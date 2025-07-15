/**
 * TapCode 预览器 - 主入口文件
 * 负责加载所有模块并启动应用
 */

(function() {
    'use strict';
    
    // 检查必要的依赖
    function checkDependencies() {
        const requiredClasses = [
            'DebugContext',
            'ConsoleLogger', 
            'TapCodeChat',
            'ThemeManager',
            'AppManager'
        ];
        
        const missing = requiredClasses.filter(className => !window[className]);
        
        if (missing.length > 0) {
            console.error('❌ 缺少必要的模块:', missing);
            return false;
        }
        
        return true;
    }
    
    // 显示加载提示
    function showLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'app-loading-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            z-index: 10000;
        `;
        
        indicator.innerHTML = `
            <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #007AFF; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
            <div style="color: #333; font-size: 14px;">TapCode 预览器启动中...</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(indicator);
        
        return indicator;
    }
    
    // 隐藏加载提示
    function hideLoadingIndicator() {
        const indicator = document.getElementById('app-loading-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(indicator)) {
                    document.body.removeChild(indicator);
                }
            }, 300);
        }
    }
    
    // 启动应用
    function startApp() {
        console.log('🚀 开始启动 TapCode 预览器...');
        
        // 显示加载提示
        const loadingIndicator = showLoadingIndicator();
        
        // 检查依赖
        if (!checkDependencies()) {
            console.error('❌ 依赖检查失败，无法启动应用');
            hideLoadingIndicator();
            showErrorPage('模块加载失败，请检查网络连接后刷新页面');
            return;
        }
        
        try {
            // 创建应用管理器实例
            window.appManager = new window.AppManager();
            
            // 监听应用启动完成事件
            document.addEventListener('appready', function(event) {
                console.log('✅ 应用启动完成:', event.detail);
                hideLoadingIndicator();
                
                // 可以在这里添加启动完成后的额外逻辑
                onAppReady(event.detail);
            });
            
        } catch (error) {
            console.error('❌ 应用启动失败:', error);
            hideLoadingIndicator();
            showErrorPage('应用启动失败，请刷新页面重试');
        }
    }
    
    // 应用启动完成回调
    function onAppReady(details) {
        console.log('🎉 TapCode 预览器已准备就绪!');
        
        // 记录性能指标
        logPerformanceMetrics(details);
        
        // 设置开发者工具快捷键
        setupDevShortcuts();
        
        // 检查是否有URL参数中的操作
        handleUrlParams();
    }
    
    // 记录性能指标
    function logPerformanceMetrics(details) {
        const metrics = {
            loadTime: details.loadTime,
            moduleCount: details.modules.length,
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 性能指标:', metrics);
        
        // 如果加载时间过长，记录警告
        if (details.loadTime > 3000) {
            console.warn('⚠️  应用加载时间较长:', details.loadTime + 'ms');
        }
    }
    
    // 设置开发者快捷键
    function setupDevShortcuts() {
        document.addEventListener('keydown', function(event) {
            // Ctrl+Shift+D: 打开调试面板
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                openDebugPanel();
            }
            
            // Ctrl+Shift+R: 重启应用
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                if (confirm('确定要重启应用吗？')) {
                    window.appManager?.restart();
                }
            }
            
            // Ctrl+Shift+C: 清空所有数据
            if (event.ctrlKey && event.shiftKey && event.key === 'C') {
                event.preventDefault();
                if (confirm('确定要清空所有调试数据吗？')) {
                    clearAllDebugData();
                }
            }
        });
    }
    
    // 打开调试面板
    function openDebugPanel() {
        const debugInfo = {
            app: window.appManager?.getAppStatus(),
            modules: window.appManager?.getAllModules(),
            theme: window.themeManager?.getThemeStats(),
            console: window.consoleLogger?.getStats(),
            debug: window.debugContext?.getStats()
        };
        
        console.group('🔍 调试信息');
        console.log('应用状态:', debugInfo.app);
        console.log('模块状态:', Object.keys(debugInfo.modules || {}));
        console.log('主题状态:', debugInfo.theme);
        console.log('日志统计:', debugInfo.console);
        console.log('调试统计:', debugInfo.debug);
        console.groupEnd();
        
        // 可以选择打开TapCode对话并预填调试信息
        if (window.tapCodeChat) {
            const debugSummary = `调试信息：
应用状态: ${debugInfo.app?.isInitialized ? '正常' : '异常'}
加载时间: ${debugInfo.app?.loadTime}ms
模块数量: ${debugInfo.app?.moduleCount || 0}
错误数量: ${debugInfo.debug?.errors || 0}
日志数量: ${debugInfo.console?.total || 0}`;
            
            window.tapCodeChat.openChat(debugSummary);
        }
    }
    
    // 清空所有调试数据
    function clearAllDebugData() {
        if (window.debugContext) {
            window.debugContext.clearAll();
        }
        
        if (window.consoleLogger) {
            window.consoleLogger.clearLogs();
        }
        
        console.log('🧹 所有调试数据已清空');
    }
    
    // 处理URL参数
    function handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        
        // 如果有debug参数，自动打开调试面板
        if (params.get('debug') === 'true') {
            setTimeout(() => {
                openDebugPanel();
            }, 1000);
        }
        
        // 如果有chat参数，自动打开对话框
        const chatMessage = params.get('chat');
        if (chatMessage && window.tapCodeChat) {
            setTimeout(() => {
                window.tapCodeChat.openChat(decodeURIComponent(chatMessage));
            }, 1000);
        }
    }
    
    // 显示错误页面
    function showErrorPage(message) {
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                color: #333;
                max-width: 400px;
                padding: 40px;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">启动失败</h1>
                <p style="margin: 0 0 24px 0; color: #666; line-height: 1.5;">${message}</p>
                <button onclick="location.reload()" style="
                    padding: 12px 24px;
                    background: #007AFF;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">刷新页面</button>
                <div style="margin-top: 20px; font-size: 12px; color: #999;">
                    TapCode 预览器 v${window.CONFIG?.APP_INFO?.version || '1.0.0'}
                </div>
            </div>
        `;
    }
    
    // 监听DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
    
    // 导出一些全局方法供调试使用
    window.TapCodeDebug = {
        openDebugPanel,
        clearAllDebugData,
        restart: () => window.appManager?.restart(),
        getStatus: () => window.appManager?.getAppStatus()
    };
    
    console.log('📦 TapCode 预览器主入口文件已加载');
    
})(); 