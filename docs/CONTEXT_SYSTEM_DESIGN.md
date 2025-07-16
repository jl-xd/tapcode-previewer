# TapCode 调试上下文系统设计文档

> 本文档详细介绍了TapCode预览器中集成的AI调试上下文收集系统的设计理念、架构实现和使用方法。

## 📋 系统概览

### 设计目标

TapCode调试上下文系统是专门为AI代码调试设计的增强上下文信息收集模块，旨在：

- **智能问题诊断**：自动收集问题发生时的完整上下文环境
- **提升调试效率**：为AI助手提供丰富的调试信息，减少问题定位时间
- **非侵入式监控**：在不影响应用正常运行的前提下，透明地收集调试数据
- **隐私保护**：确保敏感信息不被收集或传输

### 核心特性

- ✅ **全生命周期监控**：从页面加载到用户交互全程跟踪
- ✅ **多维度数据收集**：错误信息、网络请求、用户行为、性能指标
- ✅ **智能数据管理**：自动清理过期数据，控制内存使用
- ✅ **可配置性**：通过配置文件灵活控制收集范围和详细程度
- ✅ **隐私安全**：支持敏感信息过滤和URL哈希化

## 🏗️ 系统架构

### 文件结构

```
js/features/debug-context.js    # 核心上下文收集模块 (16KB, 437行)
config.js                       # 系统配置文件
```

### 核心类设计

```javascript
class DebugContext {
    // 数据存储
    userInteractionTrace[]      // 用户交互轨迹
    globalErrors[]              // 全局错误信息
    networkRequests[]           // 网络请求记录
    
    // 核心方法
    init()                      // 系统初始化
    collectEnvironmentContext() // 环境信息收集
    collectDOMSnapshot()        // DOM状态快照
    getAIContext()              // 获取AI调试上下文
}
```

## 🔧 功能模块详解

### 1. 错误信息收集

#### JavaScript 错误监控

```javascript
// 全局JavaScript错误拦截
window.addEventListener('error', (event) => {
    const errorInfo = {
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        stack: event.error ? event.error.stack : null
    };
    this.addError(errorInfo);
});
```

#### Promise Rejection 监控

```javascript
// 未处理的Promise rejection拦截
window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = {
        type: 'promise',
        message: event.reason.toString(),
        timestamp: new Date().toISOString(),
        stack: event.reason.stack || null
    };
    this.addError(errorInfo);
});
```

**配置选项：**
- `maxErrors`: 最大错误记录数量 (默认: 20)
- `collectStackTraces`: 是否收集堆栈跟踪 (默认: true)
- `sendErrors`: 发送给AI的错误数量 (默认: 5)

### 2. 网络请求监控

#### Fetch API 拦截

```javascript
const originalFetch = window.fetch;
window.fetch = (...args) => {
    const url = args[0];
    const startTime = Date.now();
    
    return originalFetch.apply(this, args)
        .then(response => {
            // 记录成功请求
            this.recordNetworkRequest({
                method: args[1]?.method || 'GET',
                url: url,
                status: response.status,
                duration: endTime - startTime,
                success: response.ok,
                timestamp: new Date().toISOString()
            });
            return response;
        })
        .catch(error => {
            // 记录失败请求
            this.recordNetworkRequest({
                method: args[1]?.method || 'GET',
                url: url,
                status: 0,
                duration: endTime - startTime,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        });
};
```

#### XMLHttpRequest 监控

系统同时拦截传统的XMLHttpRequest请求，确保网络监控的完整性。

**配置选项：**
- `maxNetworkRequests`: 最大网络请求记录数量 (默认: 30)
- `sendNetworkRequests`: 发送给AI的请求数量 (默认: 10)
- `hashSensitiveUrls`: 是否对敏感URL进行哈希化 (默认: true)

### 3. 用户交互追踪

#### 交互事件记录

```javascript
trackUserInteraction(action, element, data = {}) {
    const interaction = {
        type: action,
        element: element,
        timestamp: new Date().toISOString(),
        data: data,
        path: this.getElementPath(element)
    };
    
    this.userInteractionTrace.unshift(interaction);
}
```

#### DOM路径生成

```javascript
getElementPath(element) {
    const path = [];
    let current = element;
    
    while (current && current.tagName) {
        let selector = current.tagName.toLowerCase();
        
        if (current.id) {
            selector += '#' + current.id;
        } else if (current.className) {
            selector += '.' + current.className.split(' ').join('.');
        }
        
        path.unshift(selector);
        current = current.parentElement;
        
        if (path.length > 5) break; // 限制路径深度
    }
    
    return path.join(' > ');
}
```

**配置选项：**
- `maxUserInteractions`: 最大交互记录数量 (默认: 50)
- `sendUserInteractions`: 发送给AI的交互数量 (默认: 10)
- `collectElementPaths`: 是否收集元素路径 (默认: true)

### 4. 环境信息收集

#### 基础环境检测

```javascript
collectEnvironmentContext() {
    return {
        basic: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            timestamp: new Date().toISOString()
        },
        
        display: {
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                devicePixelRatio: window.devicePixelRatio
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        },
        
        capabilities: {
            touch: 'ontouchstart' in window,
            webGL: !!window.WebGLRenderingContext,
            serviceWorker: 'serviceWorker' in navigator,
            localStorage: typeof(Storage) !== "undefined",
            geolocation: !!navigator.geolocation
        }
    };
}
```

#### 性能指标收集

```javascript
collectPerformanceInfo() {
    return {
        memory: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null,
        
        timing: performance.timing ? {
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            pageLoad: performance.timing.loadEventEnd - performance.timing.navigationStart
        } : null
    };
}
```

### 5. DOM状态快照

#### 应用状态监控

```javascript
collectDOMSnapshot() {
    const previewFrame = document.getElementById('previewFrame');
    const toolbar = document.getElementById('toolbar');
    const sideMenu = document.getElementById('sideMenu');
    
    return {
        iframe: {
            src: previewFrame?.src || '',
            loaded: (previewFrame?.src || '') !== '',
            readyState: previewFrame?.contentDocument?.readyState || 'unknown'
        },
        
        ui: {
            toolbar: {
                visible: toolbar ? !toolbar.classList.contains('hidden') : false
            },
            menu: {
                open: sideMenu ? sideMenu.classList.contains('open') : false
            },
            theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light'
        },
        
        storage: {
            localStorage: localStorage.length,
            sessionStorage: sessionStorage.length,
            localStorageKeys: Object.keys(localStorage)
        }
    };
}
```

## ⚙️ 配置管理

### 主要配置项

```javascript
// config.js 中的 AI_DEBUGGING 配置
AI_DEBUGGING: {
    // 数据收集限制
    maxConsoleLogs: 50,
    maxErrors: 20,
    maxNetworkRequests: 30,
    maxUserInteractions: 50,
    
    // 发送给AI的数据量
    sendConsoleLogs: 20,
    sendErrors: 5,
    sendNetworkRequests: 10,
    sendUserInteractions: 10,
    
    // 收集详细程度
    collectStackTraces: true,
    collectElementPaths: true,
    collectPerformanceMetrics: true,
    collectDeviceCapabilities: true,
    collectNetworkInfo: true,
    
    // 隐私保护
    excludePersonalData: true,
    hashSensitiveUrls: true,
    
    // 数据过期时间（毫秒）
    dataExpirationTime: 30 * 60 * 1000 // 30分钟
}
```

### 功能开关

```javascript
// config.js 中的 FEATURES 配置
FEATURES: {
    enableEnhancedDebugging: true,          // 启用增强调试
    enableErrorCollection: true,            // 启用错误收集
    enableNetworkRequestTracking: true,     // 启用网络请求跟踪
    enableUserInteractionTracking: true,    // 启用用户交互跟踪
    enableDOMSnapshotCollection: true,      // 启用DOM快照收集
    enablePerformanceMonitoring: true       // 启用性能监控
}
```

## 🚀 使用方法

### 系统初始化

```javascript
// 在应用启动时自动初始化
window.debugContext = new DebugContext();
```

### 手动收集上下文

```javascript
// 获取完整的AI调试上下文
const context = window.debugContext.getAIContext();

// 发送给AI助手进行问题分析
// context 包含所有必要的调试信息
```

### 用户交互追踪

```javascript
// 在用户交互事件中添加追踪
button.addEventListener('click', (event) => {
    window.debugContext?.trackUserInteraction('click', event.target, {
        buttonText: event.target.textContent,
        buttonType: event.target.type
    });
    
    // 执行按钮逻辑
});
```

### 手动错误报告

```javascript
// 在特定情况下手动添加错误信息
try {
    // 可能出错的代码
} catch (error) {
    window.debugContext?.addError({
        type: 'manual',
        message: error.message,
        context: 'specific-function',
        timestamp: new Date().toISOString(),
        stack: error.stack
    });
}
```

## 📊 数据结构

### AI上下文数据格式

```javascript
{
    // 错误信息 (最近5个)
    globalErrors: [
        {
            type: 'javascript|promise|manual',
            message: '错误描述',
            filename: '文件名',
            lineno: 行号,
            colno: 列号,
            timestamp: 'ISO时间戳',
            stack: '堆栈跟踪'
        }
    ],
    
    // 网络请求 (最近10个)
    networkRequests: [
        {
            method: 'GET|POST|PUT|DELETE',
            url: '请求URL',
            status: 200,
            duration: 1234,
            success: true,
            timestamp: 'ISO时间戳'
        }
    ],
    
    // 用户交互 (最近10个)
    userInteractionTrace: [
        {
            type: 'click|scroll|input',
            element: '元素引用',
            path: 'div > button#submit',
            timestamp: 'ISO时间戳',
            data: { /* 额外数据 */ }
        }
    ],
    
    // 环境信息
    environmentContext: {
        basic: { /* 基础信息 */ },
        display: { /* 显示信息 */ },
        capabilities: { /* 设备能力 */ },
        network: { /* 网络信息 */ },
        performance: { /* 性能信息 */ }
    },
    
    // DOM快照
    domSnapshot: {
        iframe: { /* iframe状态 */ },
        ui: { /* UI状态 */ },
        app: { /* 应用状态 */ },
        storage: { /* 存储状态 */ }
    },
    
    // 项目元数据
    projectMetadata: {
        project: { /* 项目信息 */ },
        configuration: { /* 配置信息 */ },
        buildInfo: { /* 构建信息 */ }
    },
    
    // 调试统计
    debugInfo: {
        sessionDuration: 123456,
        totalErrors: 5,
        totalNetworkRequests: 23,
        totalInteractions: 45
    }
}
```

## 🔒 隐私与安全

### 隐私保护机制

1. **敏感数据过滤**
   - 自动识别并过滤包含敏感信息的URL
   - 对用户输入数据进行脱敏处理
   - 移除可能包含个人信息的堆栈跟踪部分

2. **URL哈希化**
   ```javascript
   // 对敏感URL进行哈希处理
   if (config.hashSensitiveUrls && isSensitiveUrl(url)) {
       url = 'hashed:' + btoa(url).substring(0, 16);
   }
   ```

3. **数据生命周期管理**
   - 设置数据过期时间 (默认30分钟)
   - 自动清理过期数据
   - 限制内存使用量

### 安全考虑

- **同源策略**：严格遵守浏览器同源策略
- **无外部依赖**：避免引入第三方库的安全风险
- **最小权限原则**：只收集必要的调试信息
- **透明性**：所有收集行为都有明确的配置选项

## 🛠️ 开发和扩展

### 添加新的数据收集器

1. **扩展 DebugContext 类**
   ```javascript
   // 在 debug-context.js 中添加新方法
   collectCustomData() {
       return {
           customMetric: this.calculateCustomMetric(),
           timestamp: new Date().toISOString()
       };
   }
   ```

2. **更新配置文件**
   ```javascript
   // 在 config.js 中添加相关配置
   AI_DEBUGGING: {
       enableCustomDataCollection: true,
       maxCustomData: 20
   }
   ```

3. **集成到主上下文**
   ```javascript
   // 在 getAIContext() 方法中添加
   getAIContext() {
       return {
           // ... 现有数据
           customData: this.collectCustomData()
       };
   }
   ```

### 性能优化建议

1. **异步处理**
   ```javascript
   // 使用 requestIdleCallback 进行后台处理
   if (window.requestIdleCallback) {
       requestIdleCallback(() => {
           this.processCollectedData();
       });
   }
   ```

2. **数据压缩**
   ```javascript
   // 对大型数据进行压缩
   compressData(data) {
       return JSON.stringify(data, null, 0);
   }
   ```

3. **内存管理**
   ```javascript
   // 定期清理过期数据
   setInterval(() => {
       this.cleanupExpiredData();
   }, 5 * 60 * 1000); // 每5分钟清理一次
   ```

## 📈 监控与调试

### 系统状态监控

```javascript
// 获取系统统计信息
const stats = window.debugContext.getStats();
console.log('调试系统状态:', stats);
// 输出: { errors: 3, networkRequests: 15, interactions: 22, sessionDuration: 125000 }
```

### 调试技巧

1. **启用详细日志**
   ```javascript
   // 在浏览器控制台查看收集的数据
   console.log('AI Context:', window.debugContext.getAIContext());
   ```

2. **测试数据收集**
   ```javascript
   // 手动触发错误测试
   throw new Error('测试错误收集');
   
   // 手动记录交互
   window.debugContext.trackUserInteraction('test', document.body, {
       testData: 'example'
   });
   ```

3. **性能分析**
   ```javascript
   // 监控系统开销
   const before = performance.now();
   window.debugContext.getAIContext();
   const after = performance.now();
   console.log(`上下文收集耗时: ${after - before}ms`);
   ```

## 🔄 版本历史

### v1.0.0 (当前版本)
- ✅ 基础错误收集功能
- ✅ 网络请求监控
- ✅ 用户交互追踪
- ✅ 环境信息收集
- ✅ DOM状态快照
- ✅ 隐私保护机制
- ✅ 可配置的数据管理

### 计划功能
- 🔮 WebWorker 中的错误收集
- 🔮 Service Worker 集成
- 🔮 实时数据流传输
- 🔮 AI智能分析集成
- 🔮 可视化调试界面

## 📚 相关文档

- [项目概览](./PROJECT_OVERVIEW.md)
- [使用指南](./USAGE_GUIDE.md)
- [TapCode对话指南](./TAPCODE_CHAT_GUIDE.md)
- [新功能说明](./NEW_FEATURES.md)
- [更新日志](./CHANGELOG.md)

---

*本文档由 TapCode AI 生成，详细描述了调试上下文系统的完整设计和实现。* 