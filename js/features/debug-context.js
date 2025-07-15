/**
 * TapCode 调试上下文收集模块
 * 专门用于AI代码调试的增强上下文信息收集
 */

class DebugContext {
    constructor() {
        // 数据存储
        this.userInteractionTrace = [];
        this.globalErrors = [];
        this.networkRequests = [];
        
        // 配置
        this.config = window.CONFIG?.AI_DEBUGGING || {
            maxErrors: 20,
            maxNetworkRequests: 30,
            maxUserInteractions: 50
        };
        
        // 记录会话开始时间
        this.sessionStartTime = Date.now();
        
        this.init();
    }
    
    init() {
        if (!window.CONFIG?.FEATURES?.enableEnhancedDebugging) {
            return;
        }
        
        this.initErrorCollection();
        this.initNetworkMonitoring();
        console.log('🔍 调试上下文收集系统已启动');
    }
    
    // 初始化错误收集
    initErrorCollection() {
        if (!window.CONFIG?.FEATURES?.enableErrorCollection) return;
        
        // 拦截全局错误
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
        
        // 拦截Promise未处理的rejection
        window.addEventListener('unhandledrejection', (event) => {
            const errorInfo = {
                type: 'promise',
                message: event.reason.toString(),
                timestamp: new Date().toISOString(),
                stack: event.reason.stack || null
            };
            
            this.addError(errorInfo);
        });
    }
    
    // 初始化网络请求监控
    initNetworkMonitoring() {
        if (!window.CONFIG?.FEATURES?.enableNetworkRequestTracking) return;
        
        // 拦截fetch
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            const url = args[0];
            const startTime = Date.now();
            
            return originalFetch.apply(this, args)
                .then(response => {
                    const endTime = Date.now();
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
                    const endTime = Date.now();
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
        
        // 拦截XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            const originalSend = xhr.send;
            
            let requestInfo = {};
            
            xhr.open = function(method, url, ...args) {
                requestInfo = {
                    method: method,
                    url: url,
                    startTime: Date.now()
                };
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            xhr.send = function(...args) {
                const originalOnReadyStateChange = xhr.onreadystatechange;
                
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        const endTime = Date.now();
                        window.debugContext?.recordNetworkRequest({
                            method: requestInfo.method,
                            url: requestInfo.url,
                            status: xhr.status,
                            duration: endTime - requestInfo.startTime,
                            success: xhr.status >= 200 && xhr.status < 300,
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                    if (originalOnReadyStateChange) {
                        return originalOnReadyStateChange.apply(this, arguments);
                    }
                };
                
                return originalSend.apply(this, args);
            };
            
            return xhr;
        };
    }
    
    // 添加错误信息
    addError(errorInfo) {
        this.globalErrors.unshift(errorInfo);
        if (this.globalErrors.length > this.config.maxErrors) {
            this.globalErrors = this.globalErrors.slice(0, this.config.maxErrors);
        }
        
        // 如果有控制台日志系统，也记录一下
        if (window.consoleLogger) {
            window.consoleLogger.addLogItem('error', [`Global Error: ${errorInfo.message}`]);
        }
    }
    
    // 记录网络请求
    recordNetworkRequest(requestInfo) {
        this.networkRequests.unshift(requestInfo);
        if (this.networkRequests.length > this.config.maxNetworkRequests) {
            this.networkRequests = this.networkRequests.slice(0, this.config.maxNetworkRequests);
        }
    }
    
    // 追踪用户交互
    trackUserInteraction(action, element, data = {}) {
        if (!window.CONFIG?.FEATURES?.enableUserInteractionTracking) return;
        
        const interaction = {
            type: action,
            element: element,
            timestamp: new Date().toISOString(),
            data: data,
            path: this.getElementPath(element)
        };
        
        this.userInteractionTrace.unshift(interaction);
        if (this.userInteractionTrace.length > this.config.maxUserInteractions) {
            this.userInteractionTrace = this.userInteractionTrace.slice(0, this.config.maxUserInteractions);
        }
    }
    
    // 获取元素路径
    getElementPath(element) {
        if (!element || !element.tagName) return 'unknown';
        
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
    
    // 收集详细的环境信息
    collectEnvironmentContext() {
        return {
            // 基础环境信息
            basic: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                timestamp: new Date().toISOString()
            },
            
            // 屏幕和视窗信息
            display: {
                screen: {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    outerWidth: window.outerWidth,
                    outerHeight: window.outerHeight,
                    devicePixelRatio: window.devicePixelRatio,
                    orientation: screen.orientation ? {
                        angle: screen.orientation.angle,
                        type: screen.orientation.type
                    } : null
                }
            },
            
            // 设备能力检测
            capabilities: {
                touch: 'ontouchstart' in window,
                webGL: !!window.WebGLRenderingContext,
                webGL2: !!window.WebGL2RenderingContext,
                webRTC: !!window.RTCPeerConnection,
                serviceWorker: 'serviceWorker' in navigator,
                localStorage: typeof(Storage) !== "undefined",
                sessionStorage: typeof(sessionStorage) !== "undefined",
                indexedDB: !!window.indexedDB,
                webWorker: typeof(Worker) !== "undefined",
                geolocation: !!navigator.geolocation,
                notifications: 'Notification' in window,
                camera: !!navigator.mediaDevices,
                vibration: 'vibrate' in navigator
            },
            
            // 网络信息
            network: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null,
            
            // 性能信息
            performance: this.collectPerformanceInfo()
        };
    }
    
    // 收集性能信息
    collectPerformanceInfo() {
        if (!window.CONFIG?.FEATURES?.enablePerformanceMonitoring) return null;
        
        return {
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null,
            timing: performance.timing ? {
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                pageLoad: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domComplete: performance.timing.domComplete - performance.timing.navigationStart
            } : null,
            navigation: performance.navigation ? {
                type: performance.navigation.type,
                redirectCount: performance.navigation.redirectCount
            } : null
        };
    }
    
    // 收集DOM状态快照
    collectDOMSnapshot() {
        if (!window.CONFIG?.FEATURES?.enableDOMSnapshotCollection) return null;
        
        const previewFrame = document.getElementById('previewFrame');
        const toolbar = document.getElementById('toolbar');
        const sideMenu = document.getElementById('sideMenu');
        const aiFeedbackModal = document.getElementById('aiFeedbackModal');
        const consoleLogsModal = document.getElementById('consoleLogsModal');
        
        return {
            // iframe状态
            iframe: {
                src: previewFrame?.src || '',
                loaded: (previewFrame?.src || '') !== '',
                readyState: previewFrame?.contentDocument?.readyState || 'unknown',
                hasContent: previewFrame?.contentDocument ? !!previewFrame.contentDocument.body?.innerHTML : false,
                url: previewFrame?.contentWindow?.location?.href || 'unknown'
            },
            
            // 关键UI元素状态
            ui: {
                toolbar: {
                    visible: toolbar ? !toolbar.classList.contains('hidden') : false,
                    position: toolbar ? window.getComputedStyle(toolbar).position : 'unknown'
                },
                menu: {
                    open: sideMenu ? sideMenu.classList.contains('open') : false
                },
                modal: {
                    feedbackOpen: aiFeedbackModal ? aiFeedbackModal.classList.contains('show') : false,
                    consoleOpen: consoleLogsModal ? consoleLogsModal.classList.contains('show') : false
                },
                theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light'
            },
            
            // 应用状态
            app: {
                currentURL: window.CONFIG?.DEFAULT_PREVIEW_URL || 'unknown',
                version: window.CONFIG?.APP_INFO?.version || 'unknown'
            },
            
            // 本地存储状态
            storage: {
                localStorage: localStorage.length,
                sessionStorage: sessionStorage.length,
                localStorageKeys: Object.keys(localStorage),
                darkModeSetting: localStorage.getItem('darkMode')
            }
        };
    }
    
    // 收集项目元数据
    collectProjectMetadata() {
        return {
            project: {
                name: window.CONFIG?.APP_INFO?.name || 'TapCode 预览器',
                version: window.CONFIG?.APP_INFO?.version || '1.0.0',
                description: window.CONFIG?.APP_INFO?.description || '移动端调试工具',
                author: window.CONFIG?.APP_INFO?.author || 'TapCode Team',
                generatedBy: 'TapCode AI',
                framework: 'vanilla-js',
                targetPlatform: 'mobile-web'
            },
            
            configuration: {
                features: window.CONFIG?.FEATURES || {},
                theme: window.CONFIG?.THEME || {},
                previewUrl: window.CONFIG?.DEFAULT_PREVIEW_URL || '',
                loadTimeout: window.CONFIG?.LOAD_TIMEOUT || 15000
            },
            
            buildInfo: {
                buildDate: document.querySelector('meta[name="build-date"]')?.content || 'unknown',
                buildHash: document.querySelector('meta[name="build-hash"]')?.content || 'unknown',
                environment: document.querySelector('meta[name="environment"]')?.content || 'development'
            }
        };
    }
    
    // 获取用于AI对话的完整上下文
    getAIContext() {
        const config = window.CONFIG?.AI_DEBUGGING || {};
        
        return {
            // 日志和错误信息
            globalErrors: this.globalErrors.slice(0, config.sendErrors || 5),
            
            // 网络请求信息
            networkRequests: this.networkRequests.slice(0, config.sendNetworkRequests || 10),
            
            // 用户交互路径
            userInteractionTrace: this.userInteractionTrace.slice(0, config.sendUserInteractions || 10),
            
            // 环境上下文
            environmentContext: this.collectEnvironmentContext(),
            
            // DOM状态快照
            domSnapshot: this.collectDOMSnapshot(),
            
            // AI代码生成项目元数据
            projectMetadata: this.collectProjectMetadata(),
            
            // 额外的调试信息
            debugInfo: {
                sessionDuration: Date.now() - this.sessionStartTime,
                totalErrors: this.globalErrors.length,
                totalNetworkRequests: this.networkRequests.length,
                totalInteractions: this.userInteractionTrace.length
            }
        };
    }
    
    // 清空所有收集的数据
    clearAll() {
        this.userInteractionTrace = [];
        this.globalErrors = [];
        this.networkRequests = [];
        console.log('🧹 调试上下文数据已清空');
    }
    
    // 获取统计信息
    getStats() {
        return {
            errors: this.globalErrors.length,
            networkRequests: this.networkRequests.length,
            interactions: this.userInteractionTrace.length,
            sessionDuration: Date.now() - this.sessionStartTime
        };
    }
}

// 导出模块
window.DebugContext = DebugContext; 