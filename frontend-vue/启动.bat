@echo off
chcp 65001 >nul
echo ====================================
echo   AI Chat - 前端启动
echo ====================================
echo.

cd /d %~dp0

echo [1/2] 检查依赖...
if not exist "node_modules" (
    echo 首次启动，正在安装依赖...
    echo 这可能需要几分钟，请稍候...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ 安装失败！请检查：
        echo   1. Node.js 是否已安装
        echo   2. 网络连接是否正常
        echo.
        pause
        exit /b 1
    )
    echo.
    echo ✅ 依赖安装完成！
) else (
    echo ✅ 依赖已安装
)

echo.
echo [2/2] 启动开发服务器...
echo.
echo ====================================
echo   前端: http://localhost:3000
echo   后端: http://localhost:8080
echo.
echo   ⚠️  请确保后端已启动！
echo ====================================
echo.

call npm run dev

pause

