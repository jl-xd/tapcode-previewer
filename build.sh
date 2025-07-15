#!/bin/bash

echo "====================================="
echo "     TapCode Previewer Build Script"
echo "     (Static Files Only)"  
echo "====================================="
echo

# 设置变量
DIST_DIR="dist"
SOURCE_DIR="."

# 创建dist目录
echo "[1/3] Creating build directory..."
if [ -d "$DIST_DIR" ]; then
    echo "Cleaning old build directory..."
    rm -rf "$DIST_DIR"
fi
mkdir -p "$DIST_DIR"
echo "Success: Build directory created"

# 复制静态文件
echo
echo "[2/3] Copying static files..."
cp "$SOURCE_DIR/index.html" "$DIST_DIR/"
cp "$SOURCE_DIR/style.css" "$DIST_DIR/"
cp "$SOURCE_DIR/script.js" "$DIST_DIR/"
cp "$SOURCE_DIR/config.js" "$DIST_DIR/"
cp "$SOURCE_DIR/qrcode.html" "$DIST_DIR/"
echo "Success: Static files copied"

# 创建部署说明
echo
echo "[3/3] Generating deployment guide..."
cat > "$DIST_DIR/DEPLOYMENT.md" << 'EOF'
# TapCode Previewer - Production Build

## Files Included
- index.html - Main preview page
- qrcode.html - QR code generation page  
- style.css - Stylesheet
- script.js - Main scripts
- config.js - Configuration file

## Deployment
Upload all files to your web server root directory and access via your domain.

## Browser Support
Chrome 60+, Safari 12+, Firefox 55+, Edge 79+

EOF

echo "Build: $(date)" >> "$DIST_DIR/DEPLOYMENT.md"
echo "Success: Deployment guide generated"

# 显示打包结果
echo
echo "====================================="
echo "        BUILD COMPLETED!"
echo "====================================="
echo
echo "Build location: $(pwd)/$DIST_DIR"
echo
echo "Files included:"
ls -1 "$DIST_DIR"
echo
echo "Ready for deployment to any web server."
echo
echo "=====================================" 