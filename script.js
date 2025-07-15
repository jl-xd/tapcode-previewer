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
            userMessage: userMessage,
            timestamp: new Date().toISOString(),
            url: PREVIEW_URL,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        // 模拟发送到TapCode
        setTimeout(() => {
            console.log('TapCode对话数据:', feedbackData);
            
            // 显示成功消息
            showToast('消息已发送给TapCode，感谢您的反馈！', 'success');
            
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
            //     showToast('消息已发送给TapCode，感谢您的反馈！', 'success');
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
    
    // 初始化预览
    initDarkMode();
    initPreview();
    
    // 应用初始化完成
    console.log(`${CONFIG.APP_INFO.name} v${CONFIG.APP_INFO.version} 已初始化`);
    console.log('预览URL:', PREVIEW_URL);
    console.log('功能配置:', CONFIG.FEATURES);
    console.log('界面模式: 透明浮动模式');
    console.log('TapCode对话功能已启用');
}); 