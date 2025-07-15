#!/bin/bash

echo "========================================"
echo "TapCode 预览器 - 快速启动脚本"
echo "========================================"
echo

# 检查是否安装了Node.js
if command -v node &> /dev/null; then
    echo "[信息] 检测到Node.js"
    
    # 检查是否安装了http-server
    if command -v http-server &> /dev/null; then
        echo "[信息] 使用http-server启动..."
    else
        echo "[信息] 正在安装http-server..."
        npm install -g http-server
        if [ $? -ne 0 ]; then
            echo "[错误] http-server安装失败，尝试使用Python启动..."
            python_start
            exit 1
        fi
    fi
    
    # 使用http-server启动
    echo "[信息] 正在启动Web服务器..."
    echo "[信息] 服务器地址: http://localhost:8000"
    echo "[信息] 二维码生成器: http://localhost:8000/qrcode.html"
    echo "[信息] 按 Ctrl+C 停止服务器"
    echo
    http-server -p 8000 -c-1 --cors
    
elif command -v python3 &> /dev/null; then
    python_start "python3"
elif command -v python &> /dev/null; then
    python_start "python"
else
    echo "[错误] 未检测到Node.js或Python，请先安装其中一个"
    exit 1
fi

# Python启动函数
python_start() {
    local python_cmd=${1:-python}
    echo "[信息] 正在使用${python_cmd}启动Web服务器..."
    echo "[信息] 服务器地址: http://localhost:8000"
    echo "[信息] 二维码生成器: http://localhost:8000/qrcode.html"
    echo "[信息] 按 Ctrl+C 停止服务器"
    echo
    ${python_cmd} -m http.server 8000
} 