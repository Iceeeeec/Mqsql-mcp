#!/usr/bin/env node

/**
 * MCP MySQL Server for shuwu Virtual Human Project
 * 提供数据库查询能力给 AI 助手（Cursor、Claude Desktop 等）
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量（指定 .env 文件路径）
dotenv.config({ path: join(__dirname, '.env') });

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shuwu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 是否允许写操作
const ALLOW_WRITE = process.env.ALLOW_WRITE === 'true';

// 创建连接池
let pool;

try {
  pool = mysql.createPool(dbConfig);
  console.error(`[MCP MySQL] 连接池已创建: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
} catch (error) {
  console.error('[MCP MySQL] 创建连接池失败:', error);
  process.exit(1);
}

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'shuwu-mysql-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * 检查 SQL 语句类型
 */
function getSqlType(sql) {
  const trimmedSql = sql.trim().toUpperCase();
  if (trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('SHOW') || trimmedSql.startsWith('DESCRIBE') || trimmedSql.startsWith('DESC')) {
    return 'read';
  }
  if (trimmedSql.startsWith('INSERT') || trimmedSql.startsWith('UPDATE') || trimmedSql.startsWith('DELETE')) {
    return 'write';
  }
  if (trimmedSql.startsWith('CREATE') || trimmedSql.startsWith('DROP') || trimmedSql.startsWith('ALTER') || trimmedSql.startsWith('TRUNCATE')) {
    return 'ddl';
  }
  return 'unknown';
}

/**
 * 执行 SQL 查询
 */
async function executeQuery(sql) {
  const sqlType = getSqlType(sql);
  
  // 安全检查
  if (sqlType === 'ddl') {
    throw new Error('不允许执行 DDL 语句（CREATE/DROP/ALTER/TRUNCATE）');
  }
  
  if (sqlType === 'write' && !ALLOW_WRITE) {
    throw new Error('不允许执行写操作（INSERT/UPDATE/DELETE），请在 .env 中设置 ALLOW_WRITE=true');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(sql);
    
    return {
      success: true,
      rowCount: Array.isArray(rows) ? rows.length : 0,
      data: rows,
    };
  } catch (error) {
    console.error('[MCP MySQL] 查询错误:', error.message);
    throw new Error(`SQL 执行失败: ${error.message}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * 获取数据库表列表
 */
async function getTables() {
  try {
    const result = await executeQuery('SHOW TABLES');
    const tableKey = `Tables_in_${dbConfig.database}`;
    return result.data.map(row => row[tableKey]);
  } catch (error) {
    console.error('[MCP MySQL] 获取表列表失败:', error);
    return [];
  }
}

/**
 * 获取表结构
 */
async function getTableSchema(tableName) {
  try {
    const result = await executeQuery(`DESCRIBE \`${tableName}\``);
    return result.data;
  } catch (error) {
    console.error(`[MCP MySQL] 获取表结构失败 [${tableName}]:`, error);
    throw error;
  }
}

// ========== MCP 协议实现 ==========

/**
 * 列出可用的工具
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query',
        description: '执行 SQL 查询语句（SELECT、SHOW、DESCRIBE）。支持复杂查询、JOIN、聚合等。',
        inputSchema: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
              description: 'SQL 查询语句（推荐使用 SELECT 查询）',
            },
          },
          required: ['sql'],
        },
      },
      {
        name: 'list_tables',
        description: '列出数据库中的所有表',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'describe_table',
        description: '查看表结构（字段名、类型、约束等）',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: '表名',
            },
          },
          required: ['table'],
        },
      },
    ],
  };
});

/**
 * 执行工具调用
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query': {
        if (!args.sql) {
          throw new Error('缺少参数: sql');
        }
        
        const result = await executeQuery(args.sql);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_tables': {
        const tables = await getTables();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                database: dbConfig.database,
                tables: tables,
                count: tables.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'describe_table': {
        if (!args.table) {
          throw new Error('缺少参数: table');
        }
        
        const schema = await getTableSchema(args.table);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                table: args.table,
                schema: schema,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`未知的工具: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * 列出可用资源（数据库表）
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const tables = await getTables();
  
  return {
    resources: tables.map(table => ({
      uri: `mysql:///${dbConfig.database}/${table}`,
      mimeType: 'application/json',
      name: table,
      description: `数据表: ${table}`,
    })),
  };
});

/**
 * 读取资源（表结构）
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const match = uri.match(/^mysql:\/\/\/([^/]+)\/([^/]+)$/);
  
  if (!match) {
    throw new Error(`无效的 URI 格式: ${uri}`);
  }
  
  const [, database, table] = match;
  
  if (database !== dbConfig.database) {
    throw new Error(`数据库不匹配: ${database}`);
  }
  
  const schema = await getTableSchema(table);
  
  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          table: table,
          schema: schema,
        }, null, 2),
      },
    ],
  };
});

// ========== 启动服务器 ==========

async function main() {
  // 测试数据库连接
  try {
    const connection = await pool.getConnection();
    console.error('[MCP MySQL] 数据库连接成功 ✓');
    connection.release();
  } catch (error) {
    console.error('[MCP MySQL] 数据库连接失败:', error.message);
    process.exit(1);
  }

  // 启动 MCP 服务器
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('[MCP MySQL] 服务器已启动，等待请求...');
  console.error(`[MCP MySQL] 写操作: ${ALLOW_WRITE ? '允许' : '禁止'}`);
}

main().catch((error) => {
  console.error('[MCP MySQL] 启动失败:', error);
  process.exit(1);
});

