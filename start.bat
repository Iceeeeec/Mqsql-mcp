@echo off
chcp 65001 >nul
echo ========================================
echo   shuwu MCP MySQL Server
echo ========================================
echo.
echo 📍 项目: shuwu Virtual Human
echo 🗄️  数据库: %DB_NAME%
echo 🚀 启动中...
echo.

node index.js

pause

