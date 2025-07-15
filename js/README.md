# TapCode 预览器 - 模块化JavaScript架构

## 🚀 模块化重构说明

为了解决原`script.js`文件过大（1349行）、难以维护的问题，我们将代码重构为模块化架构。

## 📦 模块结构

```
js/
├── core/                    # 核心功能模块
│   ├── preview-core.js      # 预览核心功能（iframe、URL处理、全屏等）
│   ├── ui-interaction.js    # UI交互管理（菜单、手势、键盘快捷键）
│   └── app-manager.js       # 应用核心管理器（模块协调、生命周期）
├── features/                # 功能特性模块
│   ├── debug-context.js     # 调试上下文收集（AI调试增强功能）
│   ├── console-logger.js    # 控制台日志系统
│   └── tapcode-chat.js      # TapCode AI对话功能
├── utils/                   # 工具模块
│   └── theme-manager.js     # 主题管理（深色模式、主题切换）
└── main.js                  # 主入口文件（模块加载、应用启动）
```

## 🔧 核心模块说明

### PreviewCore - 预览核心
- **功能**: iframe管理、URL处理、加载状态、全屏模式
- **依赖**: CONFIG (全局配置)
- **导出**: `window.PreviewCore`, `window.previewCore`

### UIInteraction - UI交互管理  
- **功能**: 侧边菜单、手势操作、键盘快捷键、Toast提示
- **依赖**: CONFIG
- **导出**: `window.UIInteraction`, `window.uiInteraction`, `window.showToast`

### AppManager - 应用管理器
- **功能**: 模块初始化、错误处理、生命周期管理
- **依赖**: 所有其他模块
- **导出**: `window.AppManager`, `window.appManager`

## 🎯 功能模块说明

### DebugContext - 调试上下文
- **功能**: 错误收集、网络监控、用户交互追踪、环境信息收集
- **特点**: 专为AI代码调试设计
- **导出**: `window.DebugContext`, `window.debugContext`

### ConsoleLogger - 控制台日志
- **功能**: console方法拦截、日志收集、可视化查看
- **导出**: `window.ConsoleLogger`, `window.consoleLogger`

### TapCodeChat - AI对话
- **功能**: 与TapCode AI对话、上下文数据集成
- **导出**: `window.TapCodeChat`, `window.tapCodeChat`

### ThemeManager - 主题管理
- **功能**: 深色模式、主题切换、系统偏好检测
- **导出**: `window.ThemeManager`, `window.themeManager`

## ⚡ 加载顺序

HTML中的模块加载顺序很重要：

```html
<!-- 1. 配置文件 -->
<script src="config.js"></script>

<!-- 2. 核心模块 -->
<script src="js/core/preview-core.js"></script>
<script src="js/core/ui-interaction.js"></script>
<script src="js/core/app-manager.js"></script>

<!-- 3. 功能模块 -->
<script src="js/features/debug-context.js"></script>
<script src="js/features/console-logger.js"></script>
<script src="js/features/tapcode-chat.js"></script>

<!-- 4. 工具模块 -->
<script src="js/utils/theme-manager.js"></script>

<!-- 5. 主入口 -->
<script src="js/main.js"></script>
```

## 🔄 版本切换

### 使用新模块化版本（当前）
保持HTML文件中的当前引用即可。

### 回退到旧版本
如需回退到原来的单文件版本：

```html
<!-- 注释掉模块化引用 -->
<!-- 各种js/模块引用 -->

<!-- 启用旧版本 -->
<script src="script.js.backup"></script>
```

## 🛠️ 开发调试

### 调试快捷键
- `Ctrl+Shift+D`: 打开调试面板
- `Ctrl+Shift+R`: 重启应用
- `Ctrl+Shift+C`: 清空调试数据

### 调试命令
```javascript
// 在浏览器控制台中使用
TapCodeDebug.openDebugPanel();     // 打开调试面板
TapCodeDebug.clearAllDebugData();  // 清空调试数据
TapCodeDebug.restart();            // 重启应用
TapCodeDebug.getStatus();          // 获取应用状态
```

### URL参数调试
- `?debug=true`: 自动打开调试面板
- `?chat=message`: 自动打开对话框并预填消息

## 📊 模块化优势

### 1. **可维护性**
- 单一职责原则，每个模块专注一个功能领域
- 代码文件大小合理（200-400行）
- 清晰的模块边界和接口

### 2. **可扩展性**
- 新功能可以独立开发为新模块
- 模块间松耦合，易于替换和升级
- 支持按需加载（未来可实现）

### 3. **团队协作**
- 不同开发者可以专注不同模块
- 减少代码冲突
- 便于代码审查

### 4. **调试友好**
- 模块边界清晰，问题定位更准确
- 完善的调试工具和日志系统
- 支持模块级的性能监控

## 🚨 注意事项

### 依赖关系
- 确保按正确顺序加载模块
- `config.js` 必须最先加载
- `main.js` 必须最后加载

### 全局变量
- 所有模块类都挂载到 `window` 对象
- 实例化后的模块也挂载到 `window`
- 使用时检查模块是否已加载

### 错误处理
- 模块加载失败会有友好的错误提示
- 应用有恢复机制和降级方案
- 完整的错误日志和调试信息

## 📈 性能影响

- **文件大小**: 模块化后总大小略有增加（模块声明开销）
- **加载时间**: 多个小文件 vs 一个大文件，实际差异很小
- **运行时性能**: 无影响，反而更好的内存管理
- **可缓存性**: 单个模块更新不影响其他模块的缓存

---

**📝 维护说明**: 当添加新功能时，优先考虑创建新模块或扩展现有模块，避免将代码直接加入到已有模块中导致模块过大。 