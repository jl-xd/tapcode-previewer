# 更新日志

## v2.0.2 - TapCode对话系统优化 (2024-01-XX)

### 🤖 TapCode对话系统
- **TapCode对话**：右下角对话按钮，与TapCode进行实时交流
- **简化界面**：移除控制台日志预览，专注于问题本身
- **发送图标**：使用直观的发送图标，提升用户体验
- **流畅交流**：优化对话流程，让交流更加自然
- **清爽设计**：简洁的对话界面，减少干扰元素

## v2.0.1 - AI反馈助手与界面优化 (2024-01-XX)

### 🤖 AI反馈系统
- **AI反馈助手**：右下角新增AI反馈按钮，支持智能问题反馈
- **控制台日志收集**：自动收集最近10条控制台日志，辅助问题诊断
- **动态弹出框**：带有流畅动画效果的反馈输入框
- **实时日志预览**：弹出框内实时显示控制台日志，便于问题分析
- **发送状态指示**：发送按钮带有加载动画，提升用户体验

### 🎨 界面优化
- **转屏按钮更新**：替换为更清晰易懂的手机旋转图标
- **全屏按钮隐藏**：暂时隐藏全屏功能，简化界面
- **响应式设计**：AI反馈按钮完美适配各种屏幕尺寸
- **深色模式支持**：新功能完全支持深色主题

## v2.0.0 - 透明浮动界面重构 (2024-01-XX)

### 🎨 界面升级
- **重新设计界面**：采用全新的透明浮动设计，界面更简洁大气
- **移除顶部状态栏**：去除了顶部header，让预览内容成为焦点
- **浮动工具栏**：工具栏浮动在内容上方，不占用预览空间
- **毛玻璃效果**：使用backdrop-filter实现现代化模糊背景效果
- **iOS风格设计**：采用Apple设计语言，界面更现代化
- **全屏退出按钮**：在全屏模式下添加专用退出按钮，解决移动端无ESC键问题

### 🔧 功能优化
- **合并按钮布局**：将旋转和菜单按钮整合到工具栏中
- **简化操作流程**：减少了界面元素，操作更直观
- **增强手势支持**：左右滑动、上下滑动控制界面元素
- **深色模式**：新增手动深色模式切换功能
- **连接状态指示**：通过工具栏边框颜色显示连接状态
- **移动端友好**：全屏退出按钮专为触摸操作设计，支持各种屏幕尺寸

### 📱 移动端优化
- **透明背景**：整个界面背景透明，沉浸式预览体验
- **更好的触摸体验**：按钮大小和间距针对手指操作优化
- **完美适配**：在各种屏幕尺寸上都能良好显示
- **性能提升**：减少了DOM元素，提高了渲染性能

### 🎮 交互改进
- **新的手势操作**：
  - 左滑：打开侧边菜单
  - 右滑：关闭侧边菜单
  - 上滑：隐藏工具栏
  - 下滑：显示工具栏
- **新的快捷键**：
  - `H`: 隐藏/显示工具栏
  - 保持原有的快捷键功能
- **按钮反馈**：改进了按钮点击的视觉反馈

### 🌙 主题系统
- **深色模式切换**：在侧边菜单中新增深色模式切换按钮
- **自动检测**：支持系统深色模式自动切换
- **持久化存储**：使用localStorage保存用户的主题选择
- **平滑过渡**：主题切换时有平滑的过渡动画

### 🔄 技术改进
- **CSS变量系统**：重构了CSS变量，支持动态主题切换
- **透明度管理**：新的透明度系统，支持不同层次的透明效果
- **模糊效果**：使用backdrop-filter实现现代化的毛玻璃效果
- **响应式设计**：针对不同屏幕尺寸的优化

### 🗑️ 移除的功能
- **顶部状态栏**：完全移除了顶部的状态栏区域
- **独立的状态指示器**：状态信息现在通过工具栏边框颜色显示
- **底部版权信息**：在透明模式下移除了底部footer

### 🐛 修复的问题
- **布局问题**：修复了在某些设备上的布局问题
- **触摸事件**：改进了触摸事件的处理
- **内存泄漏**：优化了事件监听器的管理
- **兼容性**：提高了在不同浏览器上的兼容性

### 📦 文件变化
- **index.html**：重构了HTML结构，简化了DOM树
- **style.css**：完全重写了CSS样式，采用新的设计系统
- **script.js**：更新了JavaScript逻辑，适应新的界面结构
- **README.md**：更新了文档，反映新的界面特性

## v1.0.0 - 初始版本 (2024-01-XX)

### 🎉 首次发布
- **基础预览功能**：iframe网站预览
- **二维码生成器**：PC端生成二维码
- **响应式设计**：适配移动端
- **基本交互**：复制、刷新、全屏功能
- **状态指示**：加载状态和网络状态显示
- **侧边菜单**：设置选项和快捷操作
- **键盘快捷键**：基本的快捷键支持
- **触摸手势**：基础的触摸手势支持

---

**🎨 v2.0.0 带来了全新的透明浮动界面设计，让预览体验更加沉浸和现代化！** 