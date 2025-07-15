/**
 * TapCode 应用核心管理器
 * 负责整个应用的初始化、模块协调和生命周期管理
 */

class AppManager {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        console.log('🚀 TapCode预览器正在启动...');
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }
    
    // 初始化应用
    initializeApp() {
        try {
            // 按顺序初始化各个模块
            this.initializeModules();
            
            // 设置全局错误处理
            this.setupGlobalErrorHandling();
            
            // 初始化完成
            this.isInitialized = true;
            this.onInitializationComplete();
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.handleInitializationError(error);
        }
    }
    
    // 初始化各个模块
    initializeModules() {
        const initOrder = [
            'debugContext',
            'consoleLogger',
            'themeManager',
            'previewCore',
            'uiInteraction',
            'tapCodeChat'
        ];
        
        initOrder.forEach(moduleName => {
            try {
                this.initializeModule(moduleName);
            } catch (error) {
                console.error(`❌ 模块 ${moduleName} 初始化失败:`, error);
            }
        });
    }
    
    // 初始化单个模块
    initializeModule(moduleName) {
        switch (moduleName) {
            case 'debugContext':
                if (window.DebugContext) {
                    this.modules.debugContext = new window.DebugContext();
                    window.debugContext = this.modules.debugContext;
                }
                break;
                
            case 'consoleLogger':
                if (window.ConsoleLogger) {
                    this.modules.consoleLogger = new window.ConsoleLogger();
                    window.consoleLogger = this.modules.consoleLogger;
                }
                break;
                
            case 'themeManager':
                if (window.ThemeManager) {
                    this.modules.themeManager = new window.ThemeManager();
                    window.themeManager = this.modules.themeManager;
                }
                break;
                
            case 'previewCore':
                if (window.PreviewCore) {
                    this.modules.previewCore = new window.PreviewCore();
                    window.previewCore = this.modules.previewCore;
                }
                break;
                
            case 'uiInteraction':
                if (window.UIInteraction) {
                    this.modules.uiInteraction = new window.UIInteraction();
                    window.uiInteraction = this.modules.uiInteraction;
                }
                break;
                
            case 'tapCodeChat':
                if (window.TapCodeChat) {
                    this.modules.tapCodeChat = new window.TapCodeChat();
                    window.tapCodeChat = this.modules.tapCodeChat;
                }
                break;
                
            default:
                console.warn(`⚠️  未知模块: ${moduleName}`);
        }
    }
    
    // 设置全局错误处理
    setupGlobalErrorHandling() {
        // 全局未捕获错误处理
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            this.handleGlobalError(event.error);
        });
        
        // Promise rejection处理
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }
    
    // 处理全局错误
    handleGlobalError(error) {
        // 记录错误到调试上下文
        if (this.modules.debugContext) {
            this.modules.debugContext.addError({
                type: 'global',
                message: error.message || String(error),
                timestamp: new Date().toISOString(),
                stack: error.stack || null
            });
        }
        
        // 显示用户友好的错误提示
        this.showErrorToast('应用遇到了问题，请刷新页面重试');
    }
    
    // 初始化完成回调
    onInitializationComplete() {
        const loadTime = Date.now() - this.startTime;
        
        console.log(`✅ TapCode预览器启动完成! 耗时: ${loadTime}ms`);
        console.log('📦 已加载模块:', Object.keys(this.modules));
        
        // 显示应用信息
        this.logAppInfo();
        
        // 触发初始化完成事件
        this.dispatchInitEvent();
        
        // 设置用户交互追踪
        this.setupUserInteractionTracking();
    }
    
    // 记录应用信息
    logAppInfo() {
        const config = window.CONFIG || {};
        const appInfo = config.APP_INFO || {};
        
        console.log(`${appInfo.name || 'TapCode 预览器'} v${appInfo.version || '1.0.0'} 已初始化`);
        console.log('预览URL:', config.DEFAULT_PREVIEW_URL || 'undefined');
        console.log('功能配置:', config.FEATURES || {});
        console.log('界面模式: 透明浮动模式');
        console.log('TapCode对话功能已启用');
    }
    
    // 触发初始化完成事件
    dispatchInitEvent() {
        const event = new CustomEvent('appready', {
            detail: {
                modules: Object.keys(this.modules),
                loadTime: Date.now() - this.startTime,
                version: window.CONFIG?.APP_INFO?.version || '1.0.0'
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // 设置用户交互追踪
    setupUserInteractionTracking() {
        if (!this.modules.debugContext) return;
        
        // 页面可见性变化追踪
        document.addEventListener('visibilitychange', () => {
            this.modules.debugContext.trackUserInteraction('visibility', 'document', { 
                hidden: document.hidden 
            });
        });
        
        // 全局手势追踪
        let touchStartX, touchStartY;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // 检测滑动手势
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                const direction = deltaX > 0 ? 'right' : 'left';
                this.modules.debugContext.trackUserInteraction('swipe', 'document', { 
                    direction, 
                    distance: Math.abs(deltaX) 
                });
            }
        });
    }
    
    // 处理初始化错误
    handleInitializationError(error) {
        console.error('❌ 应用初始化失败:', error);
        
        // 显示错误信息
        this.showErrorMessage('应用初始化失败，请刷新页面重试');
        
        // 尝试恢复模式
        this.enterRecoveryMode();
    }
    
    // 进入恢复模式
    enterRecoveryMode() {
        console.log('🔧 进入恢复模式...');
        
        // 显示简化界面
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                color: #333;
            ">
                <h1>⚠️ 应用加载失败</h1>
                <p>TapCode预览器遇到了问题</p>
                <button onclick="location.reload()" style="
                    padding: 12px 24px;
                    background: #007AFF;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">刷新页面</button>
            </div>
        `;
    }
    
    // 显示错误提示
    showErrorToast(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            this.showErrorMessage(message);
        }
    }
    
    // 显示错误消息
    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px;
            background: #ff3b30;
            color: white;
            border-radius: 8px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 300px;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 5000);
    }
    
    // 获取模块
    getModule(name) {
        return this.modules[name];
    }
    
    // 获取所有模块
    getAllModules() {
        return { ...this.modules };
    }
    
    // 检查模块是否已加载
    isModuleLoaded(name) {
        return !!this.modules[name];
    }
    
    // 获取应用状态
    getAppStatus() {
        return {
            isInitialized: this.isInitialized,
            loadTime: Date.now() - this.startTime,
            modules: Object.keys(this.modules),
            version: window.CONFIG?.APP_INFO?.version || '1.0.0'
        };
    }
    
    // 重启应用
    restart() {
        console.log('🔄 重启应用...');
        
        // 销毁所有模块
        this.destroyModules();
        
        // 重新初始化
        setTimeout(() => {
            location.reload();
        }, 100);
    }
    
    // 销毁所有模块
    destroyModules() {
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                try {
                    module.destroy();
                } catch (error) {
                    console.error('模块销毁失败:', error);
                }
            }
        });
        
        this.modules = {};
        this.isInitialized = false;
    }
    
    // 获取性能指标
    getPerformanceMetrics() {
        return {
            loadTime: Date.now() - this.startTime,
            moduleCount: Object.keys(this.modules).length,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
            } : null
        };
    }
}

// 导出模块
window.AppManager = AppManager; 