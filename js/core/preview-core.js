/**
 * TapCode 核心预览功能
 * 负责iframe管理、URL处理、加载状态等核心功能
 */

class PreviewCore {
    constructor() {
        this.elements = {};
        this.state = {
            isLoading: false,
            currentUrl: '',
            connectionStatus: 'connecting'
        };
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.initPreview();
        
        console.log('🖥️  核心预览功能已启动');
    }
    
    // 绑定DOM元素
    bindElements() {
        this.elements = {
            previewFrame: document.getElementById('previewFrame'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            progressBar: document.getElementById('progressBar'),
            urlText: document.getElementById('urlText'),
            copyBtn: document.getElementById('copyBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            fullscreenExitBtn: document.getElementById('fullscreenExitBtn'),
            appContainer: document.querySelector('.app-container')
        };
    }
    
    // 绑定事件
    bindEvents() {
        // 复制按钮
        if (this.elements.copyBtn) {
            this.elements.copyBtn.addEventListener('click', () => {
                this.copyUrl();
            });
        }
        

        
        // 刷新按钮
        if (this.elements.refreshBtn) {
            this.elements.refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
        
        // 全屏按钮
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', () => {
                this.enterFullscreen();
            });
        }
        
        // 退出全屏按钮
        if (this.elements.fullscreenExitBtn) {
            this.elements.fullscreenExitBtn.addEventListener('click', () => {
                this.exitFullscreen();
            });
        }
        
        // iframe加载事件
        if (this.elements.previewFrame) {
            this.elements.previewFrame.addEventListener('load', () => {
                this.onFrameLoad();
            });
            
            this.elements.previewFrame.addEventListener('error', () => {
                this.onFrameError();
            });
        }
        
        // 全屏状态变化监听
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());
    }
    
    // 初始化预览
    initPreview() {
        // 从URL参数获取目标网站地址
        const urlParams = new URLSearchParams(window.location.search);
        const targetFromUrl = urlParams.get('target');
        
        // 预览网站URL - 提供fallback URL
        const fallbackUrl = 'https://preview.auv.spark.xd.com/p/md3z7hor';
        const previewUrl = targetFromUrl || window.CONFIG?.DEFAULT_PREVIEW_URL || fallbackUrl;
        this.state.currentUrl = previewUrl;
        
        // 更新URL显示
        if (this.elements.urlText) {
            this.elements.urlText.textContent = previewUrl;
        }
        
        // 加载预览
        this.loadPreview(previewUrl);
        
        // 确保即使没有URL也隐藏loading（防止卡住）
        if (!previewUrl) {
            console.warn('⚠️ 没有预览URL，隐藏加载屏幕');
            setTimeout(() => this.hideLoading(), 1000);
        }
    }
    
    // 加载预览
    loadPreview(url) {
        if (!url || !this.elements.previewFrame) {
            console.warn('⚠️ loadPreview: URL为空或iframe元素未找到');
            this.hideLoading(); // 确保隐藏加载屏幕
            return;
        }
        
        this.state.isLoading = true;
        this.state.currentUrl = url;
        
        // 显示加载状态
        this.showLoading();
        
        console.log('🔄 开始加载预览:', url);
        
        // 设置iframe源
        this.elements.previewFrame.src = url;
        
        // 设置超时处理
        const timeout = window.CONFIG?.LOAD_TIMEOUT || 15000;
        setTimeout(() => {
            if (this.state.isLoading) {
                this.onLoadTimeout();
            }
        }, timeout);
    }
    
    // 显示加载状态
    showLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.remove('hidden');
        }
        
        // 启动进度条动画
        this.startProgressAnimation();
    }
    
    // 隐藏加载状态
    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.add('hidden');
        }
        
        this.state.isLoading = false;
    }
    
    // 启动进度条动画
    startProgressAnimation() {
        if (!this.elements.progressBar) return;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 95) progress = 95;
            
            this.elements.progressBar.style.width = progress + '%';
            
            if (!this.state.isLoading) {
                clearInterval(interval);
                this.elements.progressBar.style.width = '100%';
            }
        }, 200);
    }
    
    // iframe加载完成
    onFrameLoad() {
        this.state.isLoading = false;
        this.hideLoading();
        this.updateConnectionStatus('connected');
        this.showToast('加载完成');
        
        // 禁用iframe滚动
        this.disableIframeScrolling();
    }
    
    // iframe加载错误
    onFrameError() {
        this.state.isLoading = false;
        this.hideLoading();
        this.updateConnectionStatus('error');
        this.showToast('加载失败', 'error');
    }
    
    // 加载超时
    onLoadTimeout() {
        this.state.isLoading = false;
        this.hideLoading();
        this.updateConnectionStatus('error');
        this.showToast('加载超时，请检查网络连接', 'error');
    }
    
    // 禁用iframe滚动
    disableIframeScrolling() {
        try {
            const iframe = this.elements.previewFrame;
            if (!iframe || !iframe.contentDocument) return;
            
            // 设置iframe属性
            iframe.scrolling = 'no';
            
            // 添加CSS样式
            const style = iframe.contentDocument.createElement('style');
            style.textContent = `
                html, body {
                    overflow: hidden !important;
                    touch-action: none !important;
                    -webkit-overflow-scrolling: touch !important;
                }
            `;
            iframe.contentDocument.head.appendChild(style);
            
            // 阻止滚动事件
            ['scroll', 'touchmove', 'wheel'].forEach(event => {
                iframe.contentDocument.addEventListener(event, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, { passive: false });
            });
            
        } catch (error) {
            console.warn('无法禁用iframe滚动:', error);
        }
    }
    
    // 复制URL
    copyUrl() {
        const url = this.state.currentUrl;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('URL已复制到剪贴板');
            }).catch(() => {
                this.fallbackCopyUrl(url);
            });
        } else {
            this.fallbackCopyUrl(url);
        }
    }
    
    // 备用复制方法
    fallbackCopyUrl(url) {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('URL已复制到剪贴板');
        } catch (error) {
            this.showToast('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    // 刷新预览
    refresh() {
        this.showToast('正在刷新预览...');
        this.loadPreview(this.state.currentUrl);
    }
    
    // 进入全屏
    enterFullscreen() {
        if (!this.elements.appContainer) return;
        
        this.elements.appContainer.classList.add('fullscreen');
        
        // 浏览器全屏API
        if (this.elements.appContainer.requestFullscreen) {
            this.elements.appContainer.requestFullscreen().catch(console.error);
        } else if (this.elements.appContainer.webkitRequestFullscreen) {
            this.elements.appContainer.webkitRequestFullscreen();
        } else if (this.elements.appContainer.msRequestFullscreen) {
            this.elements.appContainer.msRequestFullscreen();
        }
        
        this.showToast('已进入全屏模式');
    }
    
    // 退出全屏
    exitFullscreen() {
        if (!this.elements.appContainer) return;
        
        this.elements.appContainer.classList.remove('fullscreen');
        
        // 退出浏览器全屏
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(console.error);
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        this.showToast('已退出全屏模式');
    }
    
    // 处理全屏状态变化
    handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.msFullscreenElement);
        
        if (!isFullscreen && this.elements.appContainer) {
            this.elements.appContainer.classList.remove('fullscreen');
        }
    }
    
    // 更新连接状态
    updateConnectionStatus(status) {
        this.state.connectionStatus = status;
        
        // 可以在这里更新UI状态指示器
        console.log('连接状态:', status);
    }
    
    // 显示提示消息
    showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    
    // 获取当前状态
    getStatus() {
        return {
            isLoading: this.state.isLoading,
            currentUrl: this.state.currentUrl,
            connectionStatus: this.state.connectionStatus
        };
    }
    
    // 销毁
    destroy() {
        // 清理事件监听器等
        console.log('🖥️  核心预览功能已销毁');
    }
}

// 导出模块
window.PreviewCore = PreviewCore; 