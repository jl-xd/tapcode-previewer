@echo off
echo ========================================
echo TapCode 预览器 - 快速启动脚本
echo ========================================
echo.

:: 检查是否安装了Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 未检测到Node.js，尝试使用Python启动...
    goto :python_start
)

:: 检查是否安装了http-server
where http-server >nul 2>&1
if %errorlevel% neq 0 (
    echo [信息] 正在安装http-server...
    npm install -g http-server
    if %errorlevel% neq 0 (
        echo [错误] http-server安装失败，尝试使用Python启动...
        goto :python_start
    )
)

:: 使用http-server启动
echo [信息] 正在启动Web服务器...
echo [信息] 服务器地址: http://localhost:8000
echo [信息] 二维码生成器: http://localhost:8000/qrcode.html
echo [信息] 按 Ctrl+C 停止服务器
echo.
http-server -p 8000 -c-1 --cors
goto :end

:python_start
:: 检查Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请先安装Python或Node.js
    pause
    goto :end
)

:: 使用Python启动
echo [信息] 正在使用Python启动Web服务器...
echo [信息] 服务器地址: http://localhost:8000
echo [信息] 二维码生成器: http://localhost:8000/qrcode.html
echo [信息] 按 Ctrl+C 停止服务器
echo.
python -m http.server 8000

:end
pause 