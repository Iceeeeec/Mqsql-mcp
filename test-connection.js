/**
 * 测试数据库连接脚本
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量（指定 .env 文件路径）
dotenv.config({ path: join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shuwu',
};

async function testConnection() {
  console.log('🔍 测试数据库连接...');
  console.log(`📍 连接信息: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  console.log(`👤 用户: ${dbConfig.user}`);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！\n');
    
    // 测试查询
    console.log('📊 查询数据库表...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ 找到 ${tables.length} 个表:\n`);
    tables.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    await connection.end();
    console.log('\n✨ 测试完成，MCP 服务器可以正常工作！');
    console.log('\n📝 下一步：配置 Cursor AI');
    console.log('   详见 README.md 中的"配置 Cursor AI"章节');
    
  } catch (error) {
    console.error('❌ 数据库连接失败！');
    console.error(`   错误: ${error.message}`);
    console.error('\n💡 请检查：');
    console.error('   1. MySQL 是否正在运行？');
    console.error('   2. .env 文件中的用户名密码是否正确？');
    console.error('   3. 数据库 shuwu 是否存在？');
    process.exit(1);
  }
}

testConnection();

