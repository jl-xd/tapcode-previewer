# TapCode 预览器 - 构建指南

## 概述

本项目提供自动化构建脚本，将源代码打包成可直接部署的静态网站文件。

## 构建脚本

### Windows 用户
```bash
# 方法1: 直接运行
build.bat

# 方法2: 通过npm
npm run build
```

### Linux/Mac 用户
```bash
# 方法1: 直接运行
chmod +x build.sh
./build.sh

# 方法2: 通过npm
npm run build:linux
```

## 构建输出

构建完成后，会在项目根目录生成 `dist/` 文件夹，包含以下静态文件：

### 核心静态文件
- `index.html` - 主预览页面
- `qrcode.html` - 二维码生成页面
- `style.css` - 样式文件
- `script.js` - 主要脚本
- `config.js` - 配置文件

### 文档文件
- `README.md` - 项目说明
- `DEPLOYMENT.md` - 部署说明（自动生成）
- `docs/` - 详细文档目录
  - `CHANGELOG.md` - 更新日志
  - `USAGE_GUIDE.md` - 使用指南
  - `TAPCODE_CHAT_GUIDE.md` - 对话功能指南
  - `NEW_FEATURES.md` - 新功能说明
  - `DEMO.md` - 演示说明
  - `MOBILE_FULLSCREEN_TEST.md` - 移动端测试说明

## 部署方式

### 1. Web服务器部署
将 `dist/` 目录中的所有文件上传到Web服务器根目录即可。

### 2. Apache/Nginx部署
1. 将文件放置到网站根目录
2. 配置虚拟主机或域名解析
3. 访问对应域名即可

### 3. 静态托管服务
支持部署到以下平台：
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- 阿里云OSS静态网站
- 腾讯云COS静态网站

### 4. CDN部署
将文件上传到CDN，配置域名解析即可。

## 访问地址

部署完成后，可通过以下地址访问：
- 主页：`http://your-domain.com/` 或 `http://your-domain.com/index.html`
- 二维码生成：`http://your-domain.com/qrcode.html`

## 浏览器兼容性

- Chrome 60+
- Safari 12+
- Firefox 55+
- Edge 79+

## 注意事项

1. **纯静态文件**：构建输出为纯静态文件，无需Node.js运行环境
2. **跨域访问**：如果预览的网站有跨域限制，需要在服务器端配置CORS
3. **HTTPS要求**：某些现代浏览器功能（如地理位置、摄像头等）需要HTTPS环境
4. **移动端优化**：建议在移动设备上测试确保体验正常

## 常见问题

### Q: 为什么没有启动脚本？
A: 本项目已优化为纯静态文件，可直接部署到任意Web服务器，无需额外的启动脚本。

### Q: 如何自定义配置？
A: 修改 `config.js` 文件中的配置，然后重新构建即可。

### Q: 构建失败怎么办？
A: 检查是否有权限访问项目目录，确保没有文件被占用。

### Q: 如何更新到新版本？
A: 替换所有文件后重新构建即可，注意备份自定义配置。 