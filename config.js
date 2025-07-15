// TapCode 预览器配置文件
const CONFIG = {
    // 默认预览URL
    DEFAULT_PREVIEW_URL: 'https://preview.auv.spark.xd.com/p/md3z7hor',
    
    // 加载超时时间（毫秒）
    LOAD_TIMEOUT: 15000,
    
    // 提示消息显示时间（毫秒）
    TOAST_DURATION: 3000,
    
    // 应用信息
    APP_INFO: {
        name: 'TapCode 预览器',
        version: '1.0.0',
        description: '移动端调试工具',
        author: 'TapCode Team'
    },
    
    // 主题配置
    THEME: {
        primary: '#00D8C4',
        secondary: '#764ba2',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
    },
    
    // 功能开关
    FEATURES: {
        // 是否显示加载动画
        showLoadingAnimation: true,
        
        // 是否显示状态指示器
        showStatusIndicator: true,
        
        // 是否显示复制按钮
        showCopyButton: true,
        
        // 是否显示刷新按钮
        showRefreshButton: true,
        
        // 是否显示全屏按钮
        showFullscreenButton: true,
        
        // 是否支持键盘快捷键
        enableKeyboardShortcuts: true,
        
        // 是否支持触摸手势
        enableTouchGestures: true,
        
        // 是否监听网络状态
        enableNetworkMonitoring: true,
        
        // 是否显示底部版权信息
        showFooter: true,
        
        // AI调试增强功能
        enableEnhancedDebugging: true,
        enableErrorCollection: true,
        enableNetworkRequestTracking: true,
        enableUserInteractionTracking: true,
        enableDOMSnapshotCollection: true,
        enablePerformanceMonitoring: true
    },
    
    // iframe 安全配置
    IFRAME_SANDBOX: 'allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation',
    
    // 二维码生成配置
    QR_CODE: {
        width: 200,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    },
    
    // 网络检测配置
    NETWORK: {
        // STUN 服务器（用于获取本机IP）
        stunServer: 'stun:stun.l.google.com:19302',
        
        // 默认端口
        defaultPort: 8000
    },
    
    // 错误消息配置
    ERROR_MESSAGES: {
        LOAD_TIMEOUT: '加载超时，请检查网络连接',
        LOAD_FAILED: '加载失败',
        INVALID_URL: '无效的预览URL',
        COPY_FAILED: '复制失败，请手动复制',
        NETWORK_ERROR: '网络连接已断开',
        QR_GENERATION_FAILED: '二维码生成失败'
    },
    
    // 成功消息配置
    SUCCESS_MESSAGES: {
        LOAD_COMPLETE: '加载完成',
        COPY_SUCCESS: 'URL已复制到剪贴板',
        REFRESH_SUCCESS: '正在刷新预览...',
        NETWORK_RESTORED: '网络连接已恢复',
        QR_GENERATED: '二维码生成成功！',
        IP_DETECTED: '已自动获取本机IP地址'
    },
    
    // AI调试配置
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
        
        // 自动触发条件
        autoTriggerOnError: false,
        autoTriggerOnPerformanceIssue: false,
        
        // 数据过期时间（毫秒）
        dataExpirationTime: 30 * 60 * 1000, // 30分钟
        
        // 隐私保护
        excludePersonalData: true,
        hashSensitiveUrls: true
    }
};

// 导出配置（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// 全局访问（浏览器环境）
if (typeof window !== 'undefined') {
    window.TAPCODE_CONFIG = CONFIG;
} 