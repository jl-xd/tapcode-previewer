// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const previewFrame = document.getElementById('previewFrame');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const progressBar = document.getElementById('progressBar');
    const toolbar = document.getElementById('toolbar');
    const toolbarContent = document.querySelector('.toolbar-content');
    const urlText = document.getElementById('urlText');
    const copyBtn = document.getElementById('copyBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenExitBtn = document.getElementById('fullscreenExitBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const menuBtn = document.getElementById('menuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    const closeSideMenu = document.getElementById('closeSideMenu');
    const toolbarToggle = document.getElementById('toolbarToggle');
    const darkModeBtn = document.getElementById('darkModeBtn');
    const homeBtn = document.getElementById('homeBtn');
    const qrCodeBtn = document.getElementById('qrCodeBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const appContainer = document.querySelector('.app-container');
    
    // TapCode对话相关元素
    const aiFeedbackBtn = document.getElementById('aiFeedbackBtn');
    const aiFeedbackModal = document.getElementById('aiFeedbackModal');
    const closeFeedbackModal = document.getElementById('closeFeedbackModal');
    const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
    const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
    const feedbackInput = document.getElementById('feedbackInput');
    
    // Console日志查看器相关元素
    const consoleLogsBtn = document.getElementById('consoleLogsBtn');
    const consoleLogsModal = document.getElementById('consoleLogsModal');
    const closeConsoleLogsModal = document.getElementById('closeConsoleLogsModal');
    const consoleLogsViewContainer = document.getElementById('consoleLogsViewContainer');
    const consoleLogCount = document.getElementById('consoleLogCount');
    const clearConsoleLogsBtn = document.getElementById('clearConsoleLogsBtn');
    const refreshConsoleLogsBtn = document.getElementById('refreshConsoleLogsBtn');
    
    // 从URL参数获取目标网站地址
    const urlParams = new URLSearchParams(window.location.search);
    const targetFromUrl = urlParams.get('target');
    
    // 预览网站URL（可以后续动态修改）
    const PREVIEW_URL = targetFromUrl || CONFIG.DEFAULT_PREVIEW_URL;
    
    // 全局状态
    let isFullscreen = false;
    let isMenuOpen = false;
    let isRotating = false;
    let progressInterval;
    let connectionStatus = 'connecting';
    let isFeedbackModalOpen = false;
    
    // Console日志收集
    let consoleLogs = [];
    const maxLogs = 50; // 最多保存50条日志
    
    // 用户交互追踪
    let userInteractionTrace = [];
    const maxInteractions = 50;
    
    // 全局错误收集
    let globalErrors = [];
    const maxErrors = 20;
    
    // 网络请求追踪
    let networkRequests = [];
    const maxRequests = 30;
    
    // 初始化错误收集
    function initErrorCollection() {
        // 拦截全局错误
        window.addEventListener('error', function(event) {
            const errorInfo = {
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: new Date().toISOString(),
                stack: event.error ? event.error.stack : null
            };
            
            globalErrors.unshift(errorInfo);
            if (globalErrors.length > maxErrors) {
                globalErrors = globalErrors.slice(0, maxErrors);
            }
            
            addLogItem('error', [`Global Error: ${event.message}`]);
        });
        
        // 拦截Promise未处理的rejection
        window.addEventListener('unhandledrejection', function(event) {
            const errorInfo = {
                type: 'promise',
                message: event.reason.toString(),
                timestamp: new Date().toISOString(),
                stack: event.reason.stack || null
            };
            
            globalErrors.unshift(errorInfo);
            if (globalErrors.length > maxErrors) {
                globalErrors = globalErrors.slice(0, maxErrors);
            }
            
            addLogItem('error', [`Unhandled Promise Rejection: ${event.reason}`]);
        });
    }
    
    // 拦截网络请求
    function initNetworkMonitoring() {
        // 拦截fetch
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            const startTime = Date.now();
            
            return originalFetch.apply(this, args)
                .then(response => {
                    const endTime = Date.now();
                    recordNetworkRequest({
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
                    recordNetworkRequest({
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
                        recordNetworkRequest({
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
    
    // 记录网络请求
    function recordNetworkRequest(requestInfo) {
        networkRequests.unshift(requestInfo);
        if (networkRequests.length > maxRequests) {
            networkRequests = networkRequests.slice(0, maxRequests);
        }
    }
    
    // 追踪用户交互
    function trackUserInteraction(action, element, data = {}) {
        const interaction = {
            type: action,
            element: element,
            timestamp: new Date().toISOString(),
            data: data,
            path: getElementPath(element)
        };
        
        userInteractionTrace.unshift(interaction);
        if (userInteractionTrace.length > maxInteractions) {
            userInteractionTrace = userInteractionTrace.slice(0, maxInteractions);
        }
    }
    
    // 获取元素路径
    function getElementPath(element) {
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
    function collectEnvironmentContext() {
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
            performance: {
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
            }
        };
    }
    
    // 收集DOM状态快照
    function collectDOMSnapshot() {
        return {
            // iframe状态
            iframe: {
                src: previewFrame.src,
                loaded: previewFrame.src !== '',
                readyState: previewFrame.contentDocument ? previewFrame.contentDocument.readyState : 'unknown',
                hasContent: previewFrame.contentDocument ? !!previewFrame.contentDocument.body?.innerHTML : false,
                url: previewFrame.contentWindow ? previewFrame.contentWindow.location.href : 'unknown'
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
                isFullscreen,
                isMenuOpen,
                isRotating,
                connectionStatus,
                currentURL: PREVIEW_URL,
                version: CONFIG.APP_INFO.version
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
    function collectProjectMetadata() {
        return {
            project: {
                name: CONFIG.APP_INFO.name,
                version: CONFIG.APP_INFO.version,
                description: CONFIG.APP_INFO.description,
                author: CONFIG.APP_INFO.author,
                generatedBy: 'TapCode AI',
                framework: 'vanilla-js',
                targetPlatform: 'mobile-web'
            },
            
            configuration: {
                features: CONFIG.FEATURES,
                theme: CONFIG.THEME,
                previewUrl: PREVIEW_URL,
                loadTimeout: CONFIG.LOAD_TIMEOUT
            },
            
            buildInfo: {
                // 这些信息可以在构建时注入
                buildDate: document.querySelector('meta[name="build-date"]')?.content || 'unknown',
                buildHash: document.querySelector('meta[name="build-hash"]')?.content || 'unknown',
                environment: document.querySelector('meta[name="environment"]')?.content || 'development'
            }
        };
    }
    
    // 拦截console方法
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };
    
    // 添加日志项
    function addLogItem(type, args) {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
        
        const logItem = {
            type: type,
            message: message,
            timestamp: timestamp,
            time: Date.now()
        };
        
        consoleLogs.unshift(logItem);
        
        // 保持日志数量在限制范围内
        if (consoleLogs.length > maxLogs) {
            consoleLogs = consoleLogs.slice(0, maxLogs);
        }
        
        // 如果console日志查看器是打开的，实时更新
        if (consoleLogsModal && consoleLogsModal.classList.contains('show')) {
            updateConsoleLogsView();
        } else if (consoleLogCount) {
            // 只更新计数
            consoleLogCount.textContent = consoleLogs.length;
        }
    }
    
    // 重写console方法
    console.log = function(...args) {
        addLogItem('log', args);
        originalConsole.log.apply(console, args);
    };
    
    console.error = function(...args) {
        addLogItem('error', args);
        originalConsole.error.apply(console, args);
    };
    
    console.warn = function(...args) {
        addLogItem('warn', args);
        originalConsole.warn.apply(console, args);
    };
    
    console.info = function(...args) {
        addLogItem('info', args);
        originalConsole.info.apply(console, args);
    };
    
    // 更新连接状态
    function updateConnectionStatus(status) {
        connectionStatus = status;
        
        // 移除所有状态类
        toolbarContent.classList.remove('connecting', 'connected', 'error');
        
        // 添加对应状态类
        toolbarContent.classList.add(status);
    }
    
    // 显示加载状态
    function showLoading() {
        loadingOverlay.classList.remove('hidden');
        updateConnectionStatus('connecting');
        
        // 启动进度条动画
        startProgressAnimation();
    }
    
    // 隐藏加载状态
    function hideLoading() {
        loadingOverlay.classList.add('hidden');
        updateConnectionStatus('connected');
        
        // 停止进度条动画
        stopProgressAnimation();
    }
    
    // 显示错误状态
    function showError(message = '加载失败') {
        loadingOverlay.classList.add('hidden');
        updateConnectionStatus('error');
        stopProgressAnimation();
    }
    
    // 进度条动画
    function startProgressAnimation() {
        let progress = 0;
        progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressBar.style.width = progress + '%';
        }, 200);
    }
    
    function stopProgressAnimation() {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
        progressBar.style.width = '100%';
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 500);
    }
    
    // 显示提示消息
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // 自动消失
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, CONFIG.TOAST_DURATION);
    }
    
    // 初始化设置
    function initPreview() {
        // 更新URL显示
        urlText.textContent = PREVIEW_URL;
        
        // 更新iframe src
        previewFrame.src = PREVIEW_URL;
        
        // 检查URL有效性
        if (checkUrl()) {
            showLoading();
            
            // 设置超时处理
            setTimeout(function() {
                if (!loadingOverlay.classList.contains('hidden')) {
                    showError(CONFIG.ERROR_MESSAGES.LOAD_TIMEOUT);
                    showToast(CONFIG.ERROR_MESSAGES.LOAD_TIMEOUT, 'error');
                }
            }, CONFIG.LOAD_TIMEOUT);
        }
    }
    
    // 检查URL有效性
    function checkUrl() {
        const url = urlText.textContent || PREVIEW_URL;
        if (!url || !url.startsWith('http')) {
            showError(CONFIG.ERROR_MESSAGES.INVALID_URL);
            showToast(CONFIG.ERROR_MESSAGES.INVALID_URL, 'error');
            return false;
        }
        return true;
    }
    
    // 禁用iframe内容的滚动
    function disableIframeScrolling() {
        try {
            const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            
            if (iframeDoc) {
                // 添加CSS样式禁用滚动
                const style = iframeDoc.createElement('style');
                style.textContent = `
                    html, body {
                        overflow: hidden !important;
                        height: 100vh !important;
                        position: fixed !important;
                        width: 100% !important;
                        top: 0 !important;
                        left: 0 !important;
                        -webkit-overflow-scrolling: none !important;
                        touch-action: none !important;
                    }
                    
                    * {
                        -webkit-overflow-scrolling: none !important;
                        touch-action: none !important;
                    }
                    
                    /* 阻止所有滚动相关的CSS */
                    *::-webkit-scrollbar {
                        display: none !important;
                    }
                `;
                iframeDoc.head.appendChild(style);
                
                // 阻止滚动事件
                const preventScroll = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };
                
                // 添加事件监听器阻止滚动
                const events = ['scroll', 'wheel', 'touchmove', 'touchstart', 'touchend'];
                events.forEach(eventType => {
                    iframeDoc.addEventListener(eventType, preventScroll, { passive: false });
                    if (iframeDoc.body) {
                        iframeDoc.body.addEventListener(eventType, preventScroll, { passive: false });
                    }
                });
                
                // 设置body样式
                if (iframeDoc.body) {
                    iframeDoc.body.style.overflow = 'hidden';
                    iframeDoc.body.style.height = '100vh';
                    iframeDoc.body.style.position = 'fixed';
                    iframeDoc.body.style.width = '100%';
                    iframeDoc.body.style.top = '0';
                    iframeDoc.body.style.left = '0';
                }
                
                // 设置html样式
                if (iframeDoc.documentElement) {
                    iframeDoc.documentElement.style.overflow = 'hidden';
                    iframeDoc.documentElement.style.height = '100vh';
                }
                
                console.log('已禁用iframe内容滚动');
            }
        } catch (error) {
            // 跨域限制或其他错误，静默处理
            console.log('无法访问iframe内容，可能存在跨域限制');
        }
    }
    
    // iframe加载事件监听
    previewFrame.addEventListener('load', function() {
        hideLoading();
        console.log('预览页面加载完成');
        
        // 禁用iframe内容的滚动
        disableIframeScrolling();
    });
    
    // iframe加载错误事件监听
    previewFrame.addEventListener('error', function() {
        showError(CONFIG.ERROR_MESSAGES.LOAD_FAILED);
        console.error('预览页面加载失败');
    });
    
    // 复制URL功能
    copyBtn.addEventListener('click', function() {
        const url = urlText.textContent || PREVIEW_URL;
        
        copyToClipboard(url);
        animateButton(copyBtn);
    });
    
    // 复制到剪贴板
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function() {
                showToast(CONFIG.SUCCESS_MESSAGES.COPY_SUCCESS);
            }).catch(function(err) {
                console.error('复制失败:', err);
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }
    
    // 降级复制方案
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showToast(CONFIG.SUCCESS_MESSAGES.COPY_SUCCESS);
            } else {
                showToast(CONFIG.ERROR_MESSAGES.COPY_FAILED, 'error');
            }
        } catch (err) {
            console.error('复制失败:', err);
            showToast(CONFIG.ERROR_MESSAGES.COPY_FAILED, 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    // 按钮动画
    function animateButton(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 150);
    }
    
    // 刷新功能
    refreshBtn.addEventListener('click', function() {
        showLoading();
        previewFrame.src = previewFrame.src;
        showToast(CONFIG.SUCCESS_MESSAGES.REFRESH_SUCCESS);
        animateButton(refreshBtn);
        
        // 刷新后重新禁用滚动
        previewFrame.addEventListener('load', function onRefreshLoad() {
            disableIframeScrolling();
            previewFrame.removeEventListener('load', onRefreshLoad);
        });
    });
    
    // 全屏功能（已隐藏）
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            if (!isFullscreen) {
                enterFullscreen();
            } else {
                exitFullscreen();
            }
            animateButton(fullscreenBtn);
        });
    }
    
    // 全屏退出按钮
    if (fullscreenExitBtn) {
        fullscreenExitBtn.addEventListener('click', function() {
            exitFullscreen();
            animateButton(fullscreenExitBtn);
        });
    }
    
    function enterFullscreen() {
        appContainer.classList.add('fullscreen');
        isFullscreen = true;
        
        // 尝试使用浏览器的全屏API
        if (appContainer.requestFullscreen) {
            appContainer.requestFullscreen().catch(console.error);
        } else if (appContainer.webkitRequestFullscreen) {
            appContainer.webkitRequestFullscreen();
        } else if (appContainer.msRequestFullscreen) {
            appContainer.msRequestFullscreen();
        }
        
        showToast('已进入全屏模式');
    }
    
    function exitFullscreen() {
        appContainer.classList.remove('fullscreen');
        isFullscreen = false;
        
        // 退出浏览器全屏
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(console.error);
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        showToast('已退出全屏模式');
    }
    
    // 旋转屏幕功能
    rotateBtn.addEventListener('click', function() {
        if (isRotating) return;
        
        isRotating = true;
        appContainer.classList.add('rotate-animation');
        
        // 模拟屏幕旋转
        setTimeout(() => {
            // 切换横屏/竖屏样式
            const isLandscape = window.innerHeight < window.innerWidth;
            if (isLandscape) {
                document.body.style.transform = 'rotate(90deg)';
                document.body.style.transformOrigin = 'center center';
            } else {
                document.body.style.transform = '';
            }
        }, 250);
        
        setTimeout(() => {
            appContainer.classList.remove('rotate-animation');
            isRotating = false;
        }, 500);
        
        showToast('屏幕已旋转');
        animateButton(rotateBtn);
    });
    
    // 菜单功能
    menuBtn.addEventListener('click', function() {
        openSideMenu();
        animateButton(menuBtn);
    });
    
    closeSideMenu.addEventListener('click', function() {
        closeSideMenuFunc();
    });
    
    overlay.addEventListener('click', function() {
        closeSideMenuFunc();
    });
    
    // TapCode对话功能
    aiFeedbackBtn.addEventListener('click', function() {
        openFeedbackModal();
        animateButton(aiFeedbackBtn);
    });
    
    closeFeedbackModal.addEventListener('click', function() {
        closeFeedbackModalFunc();
    });
    
    cancelFeedbackBtn.addEventListener('click', function() {
        closeFeedbackModalFunc();
    });
    
    sendFeedbackBtn.addEventListener('click', function() {
        sendFeedback();
    });
    
    // 点击模态框外部关闭
    aiFeedbackModal.addEventListener('click', function(event) {
        if (event.target === aiFeedbackModal) {
            closeFeedbackModalFunc();
        }
    });
    
    function openSideMenu() {
        sideMenu.classList.add('open');
        overlay.classList.add('active');
        isMenuOpen = true;
        document.body.style.overflow = 'hidden';
    }
    
    function closeSideMenuFunc() {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
        isMenuOpen = false;
        document.body.style.overflow = '';
    }
    
    // 更新console日志查看器
    function updateConsoleLogsView() {
        if (consoleLogCount) {
            consoleLogCount.textContent = consoleLogs.length;
        }
        
        if (!consoleLogsViewContainer) return;
        
        if (consoleLogs.length === 0) {
            consoleLogsViewContainer.innerHTML = '<div class="console-logs-empty">暂无console日志</div>';
            return;
        }
        
        // 显示所有日志
        const logsHTML = consoleLogs.map(log => `
            <div class="console-log-item">
                <div class="console-log-time">${log.timestamp}</div>
                <div class="console-log-type ${log.type}">${log.type}</div>
                <div class="console-log-message">${escapeHtml(log.message)}</div>
            </div>
        `).join('');
        
        consoleLogsViewContainer.innerHTML = logsHTML;
    }
    
    // HTML转义函数
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // TapCode对话模态框功能
    function openFeedbackModal() {
        aiFeedbackModal.classList.add('show');
        isFeedbackModalOpen = true;
        document.body.style.overflow = 'hidden';
        
        // 聚焦到输入框
        setTimeout(() => {
            feedbackInput.focus();
        }, 300);
    }
    
    function closeFeedbackModalFunc() {
        aiFeedbackModal.classList.remove('show');
        isFeedbackModalOpen = false;
        document.body.style.overflow = '';
        
        // 重置表单
        feedbackInput.value = '';
        resetSendButton();
    }
    
    function resetSendButton() {
        sendFeedbackBtn.disabled = false;
        sendFeedbackBtn.querySelector('.btn-text').style.display = 'inline';
        sendFeedbackBtn.querySelector('.btn-loading').style.display = 'none';
    }
    
    function setSendButtonLoading() {
        sendFeedbackBtn.disabled = true;
        sendFeedbackBtn.querySelector('.btn-text').style.display = 'none';
        sendFeedbackBtn.querySelector('.btn-loading').style.display = 'inline-flex';
    }
    
    function sendFeedback() {
        const userMessage = feedbackInput.value.trim();
        
        if (!userMessage) {
            showToast('请输入问题描述', 'error');
            return;
        }
        
        setSendButtonLoading();
        
        // 准备发送数据
        const feedbackData = {
            // 基础信息
            userMessage: userMessage,
            timestamp: new Date().toISOString(),
            url: PREVIEW_URL,
            
            // 日志和错误信息
            consoleLogs: consoleLogs.slice(0, 20), // 只发送最近20条日志
            globalErrors: globalErrors.slice(0, 5), // 只发送最近5条全局错误
            
            // 网络请求信息
            networkRequests: networkRequests.slice(0, 10), // 只发送最近10条网络请求
            
            // 用户交互路径
            userInteractionTrace: userInteractionTrace.slice(0, 10), // 只发送最近10条用户交互
            
            // 环境上下文
            environmentContext: collectEnvironmentContext(),
            
            // DOM状态快照
            domSnapshot: collectDOMSnapshot(),
            
            // AI代码生成项目元数据
            projectMetadata: collectProjectMetadata(),
            
            // 额外的调试信息
            debugInfo: {
                sessionDuration: Date.now() - (window.sessionStartTime || Date.now()),
                totalConsoleLogs: consoleLogs.length,
                totalErrors: globalErrors.length,
                totalNetworkRequests: networkRequests.length,
                totalInteractions: userInteractionTrace.length
            }
        };
        
        // 模拟发送到TapCode
        setTimeout(() => {
            console.log('TapCode对话数据:', feedbackData);
            
            // 显示成功消息
            showToast('消息已发送给 TapCode ！', 'success');
            
            // 关闭模态框
            closeFeedbackModalFunc();
            
            // 实际实现中，这里应该是真正的API调用
            // 例如：
            // fetch('/api/tapcode-chat', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(feedbackData)
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showToast('消息已发送给 TapCode ！', 'success');
            //     closeFeedbackModalFunc();
            // })
            // .catch(error => {
            //     console.error('发送消息失败:', error);
            //     showToast('发送失败，请稍后重试', 'error');
            //     resetSendButton();
            // });
            
        }, 2000); // 模拟网络延迟
    }
    
    // 工具栏切换
    if (toolbarToggle) {
        toolbarToggle.addEventListener('change', function() {
            if (this.checked) {
                toolbar.classList.remove('hidden');
                showToast('工具栏已显示');
            } else {
                toolbar.classList.add('hidden');
                showToast('工具栏已隐藏');
            }
        });
    }
    
    // 深色模式切换
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', function() {
            // 检查当前是否为深色模式
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            if (isDarkMode) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                showToast('已切换到浅色模式');
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
                showToast('已切换到深色模式');
            }
        });
    }
    
    // 菜单项功能
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    if (qrCodeBtn) {
        qrCodeBtn.addEventListener('click', function() {
            window.open('qrcode.html', '_blank');
        });
    }
    
    if (aboutBtn) {
        aboutBtn.addEventListener('click', function() {
            showToast(`${CONFIG.APP_INFO.name} v${CONFIG.APP_INFO.version}`);
        });
    }
    
    // Console日志查看器功能
    if (consoleLogsBtn) {
        consoleLogsBtn.addEventListener('click', function() {
            openConsoleLogsModal();
            closeSideMenuFunc();
        });
    }
    
    if (closeConsoleLogsModal) {
        closeConsoleLogsModal.addEventListener('click', function() {
            closeConsoleLogsModalFunc();
        });
    }
    
    if (clearConsoleLogsBtn) {
        clearConsoleLogsBtn.addEventListener('click', function() {
            clearConsoleLogs();
        });
    }
    
    if (refreshConsoleLogsBtn) {
        refreshConsoleLogsBtn.addEventListener('click', function() {
            updateConsoleLogsView();
            showToast('日志已刷新');
        });
    }
    
    // 点击模态框外部关闭console日志查看器
    if (consoleLogsModal) {
        consoleLogsModal.addEventListener('click', function(event) {
            if (event.target === consoleLogsModal) {
                closeConsoleLogsModalFunc();
            }
        });
    }
    
    // Console日志查看器功能函数
    function openConsoleLogsModal() {
        consoleLogsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        updateConsoleLogsView();
    }
    
    function closeConsoleLogsModalFunc() {
        consoleLogsModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    function clearConsoleLogs() {
        consoleLogs = [];
        updateConsoleLogsView();
        showToast('控制台日志已清空');
    }
    
    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    function handleFullscreenChange() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (isFullscreen) {
                exitFullscreen();
            }
        }
    }
    
    // 监听键盘事件
    document.addEventListener('keydown', function(event) {
        if (!CONFIG.FEATURES.enableKeyboardShortcuts) return;
        
        // ESC键
        if (event.key === 'Escape') {
            if (isFeedbackModalOpen) {
                closeFeedbackModalFunc();
            } else if (consoleLogsModal && consoleLogsModal.classList.contains('show')) {
                closeConsoleLogsModalFunc();
            } else if (isMenuOpen) {
                closeSideMenuFunc();
            } else if (isFullscreen) {
                exitFullscreen();
            }
        }
        
        // F5或Ctrl+R刷新
        if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
            event.preventDefault();
            refreshBtn.click();
        }
        
        // Ctrl+C复制
        if (event.ctrlKey && event.key === 'c') {
            event.preventDefault();
            copyBtn.click();
        }
        
        // F11全屏
        if (event.key === 'F11') {
            event.preventDefault();
            fullscreenBtn.click();
        }
        
        // Ctrl+M菜单
        if (event.ctrlKey && event.key === 'm') {
            event.preventDefault();
            menuBtn.click();
        }
        
        // H键隐藏/显示工具栏
        if (event.key === 'h' || event.key === 'H') {
            event.preventDefault();
            toolbar.classList.toggle('hidden');
        }
    });
    
    // 监听网络状态
    if (CONFIG.FEATURES.enableNetworkMonitoring) {
        window.addEventListener('online', function() {
            updateConnectionStatus('connected');
            showToast(CONFIG.SUCCESS_MESSAGES.NETWORK_RESTORED);
        });
        
        window.addEventListener('offline', function() {
            updateConnectionStatus('error');
            showToast(CONFIG.ERROR_MESSAGES.NETWORK_ERROR, 'error');
        });
    }
    
    // 触摸手势支持
    if (CONFIG.FEATURES.enableTouchGestures) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        appContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        
        appContainer.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > swipeThreshold) {
                    if (diffX > 0) {
                        // 向左滑动 - 打开菜单
                        if (!isMenuOpen) {
                            openSideMenu();
                        }
                    } else {
                        // 向右滑动 - 关闭菜单
                        if (isMenuOpen) {
                            closeSideMenuFunc();
                        }
                    }
                }
            } else {
                if (Math.abs(diffY) > swipeThreshold) {
                    if (diffY > 0) {
                        // 向上滑动 - 隐藏工具栏
                        if (!toolbar.classList.contains('hidden')) {
                            toolbar.classList.add('hidden');
                        }
                    } else {
                        // 向下滑动 - 显示工具栏
                        if (toolbar.classList.contains('hidden')) {
                            toolbar.classList.remove('hidden');
                        }
                    }
                }
            }
        }
    }
    
    // 页面可见性API
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            updateConnectionStatus('connected');
        }
    });
    
    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        // 处理方向变化
        const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        document.body.setAttribute('data-orientation', orientation);
    });
    
    // 设置初始方向
    window.dispatchEvent(new Event('resize'));
    
    // 初始化深色模式
    function initDarkMode() {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true' || (savedDarkMode === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
        }
    }
    
    // 初始化所有监控和收集系统
    function initEnhancedDebugging() {
        // 记录会话开始时间
        window.sessionStartTime = Date.now();
        
        // 初始化各种监控系统
        initErrorCollection();
        initNetworkMonitoring();
        
        // 为关键元素添加用户交互追踪
        addInteractionTracking();
        
        console.log('🔍 增强调试系统已启动');
        console.log('📊 正在收集：控制台日志、全局错误、网络请求、用户交互、环境信息');
    }
    
    // 为关键元素添加交互追踪
    function addInteractionTracking() {
        // 工具栏按钮追踪
        if (copyBtn) copyBtn.addEventListener('click', () => trackUserInteraction('click', 'copyBtn'));
        if (refreshBtn) refreshBtn.addEventListener('click', () => trackUserInteraction('click', 'refreshBtn'));
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => trackUserInteraction('click', 'fullscreenBtn'));
        if (rotateBtn) rotateBtn.addEventListener('click', () => trackUserInteraction('click', 'rotateBtn'));
        if (menuBtn) menuBtn.addEventListener('click', () => trackUserInteraction('click', 'menuBtn'));
        
        // TapCode对话系统追踪
        if (aiFeedbackBtn) aiFeedbackBtn.addEventListener('click', () => trackUserInteraction('click', 'aiFeedbackBtn'));
        if (sendFeedbackBtn) sendFeedbackBtn.addEventListener('click', () => trackUserInteraction('click', 'sendFeedbackBtn', { messageLength: feedbackInput.value.length }));
        
        // 侧边菜单追踪
        if (darkModeBtn) darkModeBtn.addEventListener('click', () => trackUserInteraction('click', 'darkModeBtn'));
        if (consoleLogsBtn) consoleLogsBtn.addEventListener('click', () => trackUserInteraction('click', 'consoleLogsBtn'));
        
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
                trackUserInteraction('swipe', 'document', { direction, distance: Math.abs(deltaX) });
            }
        });
        
        // 页面可见性变化追踪
        document.addEventListener('visibilitychange', () => {
            trackUserInteraction('visibility', 'document', { hidden: document.hidden });
        });
    }
    
    // 初始化预览
    initDarkMode();
    initPreview();
    initEnhancedDebugging();
    
    // 应用初始化完成
    console.log(`${CONFIG.APP_INFO.name} v${CONFIG.APP_INFO.version} 已初始化`);
    console.log('预览URL:', PREVIEW_URL);
    console.log('功能配置:', CONFIG.FEATURES);
    console.log('界面模式: 透明浮动模式');
    console.log('TapCode对话功能已启用');
}); 