/**
 * TapCode UI交互管理
 * 负责侧边菜单、手势操作、按钮动画等交互功能
 */

class UIInteraction {
    constructor() {
        this.elements = {};
        this.state = {
            isMenuOpen: false,
            isRotating: false
        };
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.setupToastSystem();
        this.setupKeyboardShortcuts();
        
        console.log('🎮 UI交互管理器已启动');
    }
    
    // 绑定DOM元素
    bindElements() {
        this.elements = {
            menuBtn: document.getElementById('menuBtn'),
            rotateBtn: document.getElementById('rotateBtn'),
            sideMenu: document.getElementById('sideMenu'),
            overlay: document.getElementById('overlay'),
            closeSideMenu: document.getElementById('closeSideMenu'),
            toolbarToggle: document.getElementById('toolbarToggle'),
            homeBtn: document.getElementById('homeBtn'),
            qrCodeBtn: document.getElementById('qrCodeBtn'),
            aboutBtn: document.getElementById('aboutBtn'),
            consoleLogsBtn: document.getElementById('consoleLogsBtn'),
            consoleLogsModal: document.getElementById('consoleLogsModal'),
            closeConsoleLogsModal: document.getElementById('closeConsoleLogsModal'),
            clearConsoleLogsBtn: document.getElementById('clearConsoleLogsBtn'),
            refreshConsoleLogsBtn: document.getElementById('refreshConsoleLogsBtn'),
            toolbar: document.getElementById('toolbar'),
            appContainer: document.querySelector('.app-container')
        };
    }
    
    // 绑定事件
    bindEvents() {
        // 菜单按钮
        if (this.elements.menuBtn) {
            this.elements.menuBtn.addEventListener('click', () => {
                this.openSideMenu();
                this.animateButton(this.elements.menuBtn);
            });
        }
        
        // 旋转按钮
        if (this.elements.rotateBtn) {
            this.elements.rotateBtn.addEventListener('click', () => {
                this.rotateScreen();
                this.animateButton(this.elements.rotateBtn);
            });
        }
        
        // 关闭菜单
        if (this.elements.closeSideMenu) {
            this.elements.closeSideMenu.addEventListener('click', () => {
                this.closeSideMenu();
            });
        }
        
        // 遮罩层点击关闭菜单
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', () => {
                this.closeSideMenu();
            });
        }
        
        // 工具栏切换
        if (this.elements.toolbarToggle) {
            this.elements.toolbarToggle.addEventListener('change', (e) => {
                this.toggleToolbar(e.target.checked);
            });
        }
        
        // 菜单项功能
        this.bindMenuItems();
        
        // Console日志查看器
        this.bindConsoleViewer();
    }
    
    // 绑定菜单项
    bindMenuItems() {
        // 首页按钮
        if (this.elements.homeBtn) {
            this.elements.homeBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        // 二维码按钮
        if (this.elements.qrCodeBtn) {
            this.elements.qrCodeBtn.addEventListener('click', () => {
                window.open('qrcode.html', '_blank');
            });
        }
        
        // 关于按钮
        if (this.elements.aboutBtn) {
            this.elements.aboutBtn.addEventListener('click', () => {
                const appInfo = window.CONFIG?.APP_INFO || {};
                this.showToast(`${appInfo.name || 'TapCode 预览器'} v${appInfo.version || '1.0.0'}`);
            });
        }
    }
    
    // 绑定Console日志查看器
    bindConsoleViewer() {
        // 打开Console日志查看器
        if (this.elements.consoleLogsBtn) {
            this.elements.consoleLogsBtn.addEventListener('click', () => {
                this.openConsoleLogsModal();
                this.closeSideMenu();
            });
        }
        
        // 关闭Console日志查看器
        if (this.elements.closeConsoleLogsModal) {
            this.elements.closeConsoleLogsModal.addEventListener('click', () => {
                this.closeConsoleLogsModal();
            });
        }
        
        // 清空日志
        if (this.elements.clearConsoleLogsBtn) {
            this.elements.clearConsoleLogsBtn.addEventListener('click', () => {
                if (window.consoleLogger) {
                    window.consoleLogger.clearLogs();
                }
            });
        }
        
        // 刷新日志
        if (this.elements.refreshConsoleLogsBtn) {
            this.elements.refreshConsoleLogsBtn.addEventListener('click', () => {
                if (window.consoleLogger) {
                    window.consoleLogger.updateConsoleLogsView();
                    this.showToast('日志已刷新');
                }
            });
        }
        
        // 点击模态框外部关闭
        if (this.elements.consoleLogsModal) {
            this.elements.consoleLogsModal.addEventListener('click', (event) => {
                if (event.target === this.elements.consoleLogsModal) {
                    this.closeConsoleLogsModal();
                }
            });
        }
    }
    
    // 打开侧边菜单
    openSideMenu() {
        if (!this.elements.sideMenu || !this.elements.overlay) return;
        
        this.elements.sideMenu.classList.add('open');
        this.elements.overlay.classList.add('active');
        this.state.isMenuOpen = true;
        document.body.style.overflow = 'hidden';
        
        // 记录用户交互
        if (window.debugContext) {
            window.debugContext.trackUserInteraction('menu_open', 'sideMenu');
        }
    }
    
    // 关闭侧边菜单
    closeSideMenu() {
        if (!this.elements.sideMenu || !this.elements.overlay) return;
        
        this.elements.sideMenu.classList.remove('open');
        this.elements.overlay.classList.remove('active');
        this.state.isMenuOpen = false;
        document.body.style.overflow = '';
        
        // 记录用户交互
        if (window.debugContext) {
            window.debugContext.trackUserInteraction('menu_close', 'sideMenu');
        }
    }
    
    // 旋转屏幕
    rotateScreen() {
        if (this.state.isRotating) return;
        
        this.state.isRotating = true;
        
        if (this.elements.appContainer) {
            this.elements.appContainer.classList.add('rotate-animation');
        }
        
        // 模拟屏幕旋转效果
        setTimeout(() => {
            const isLandscape = window.innerHeight < window.innerWidth;
            if (isLandscape) {
                document.body.style.transform = 'rotate(90deg)';
                document.body.style.transformOrigin = 'center center';
            } else {
                document.body.style.transform = '';
            }
        }, 250);
        
        setTimeout(() => {
            if (this.elements.appContainer) {
                this.elements.appContainer.classList.remove('rotate-animation');
            }
            this.state.isRotating = false;
        }, 500);
        
        this.showToast('屏幕已旋转');
    }
    
    // 切换工具栏显示
    toggleToolbar(show) {
        if (!this.elements.toolbar) return;
        
        if (show) {
            this.elements.toolbar.classList.remove('hidden');
            this.showToast('工具栏已显示');
        } else {
            this.elements.toolbar.classList.add('hidden');
            this.showToast('工具栏已隐藏');
        }
    }
    
    // 按钮动画
    animateButton(button) {
        if (!button) return;
        
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 150);
    }
    
    // 打开Console日志查看器
    openConsoleLogsModal() {
        if (!this.elements.consoleLogsModal) return;
        
        this.elements.consoleLogsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // 更新日志显示
        if (window.consoleLogger) {
            window.consoleLogger.updateConsoleLogsView();
        }
    }
    
    // 关闭Console日志查看器
    closeConsoleLogsModal() {
        if (!this.elements.consoleLogsModal) return;
        
        this.elements.consoleLogsModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (!window.CONFIG?.FEATURES?.enableKeyboardShortcuts) return;
            
            // ESC键处理
            if (event.key === 'Escape') {
                if (this.elements.consoleLogsModal?.classList.contains('show')) {
                    this.closeConsoleLogsModal();
                } else if (this.state.isMenuOpen) {
                    this.closeSideMenu();
                }
            }
            
            // Ctrl+M 菜单
            if (event.ctrlKey && event.key === 'm') {
                event.preventDefault();
                if (this.state.isMenuOpen) {
                    this.closeSideMenu();
                } else {
                    this.openSideMenu();
                }
            }
            
            // H键 隐藏/显示工具栏
            if (event.key === 'h' || event.key === 'H') {
                event.preventDefault();
                this.toggleToolbar(!this.elements.toolbar?.classList.contains('hidden'));
            }
        });
    }
    
    // 设置Toast提示系统
    setupToastSystem() {
        // 创建全局showToast函数
        window.showToast = (message, type = 'success') => {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            
            // 设置样式
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 20px',
                borderRadius: '25px',
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                zIndex: '10000',
                opacity: '0',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            });
            
            // 根据类型设置背景色
            switch (type) {
                case 'success':
                    toast.style.background = 'rgba(52, 199, 89, 0.9)';
                    break;
                case 'error':
                    toast.style.background = 'rgba(255, 59, 48, 0.9)';
                    break;
                case 'warning':
                    toast.style.background = 'rgba(255, 149, 0, 0.9)';
                    break;
                default:
                    toast.style.background = 'rgba(0, 122, 255, 0.9)';
            }
            
            document.body.appendChild(toast);
            
            // 显示动画
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(-10px)';
            }, 100);
            
            // 自动消失
            const duration = window.CONFIG?.TOAST_DURATION || 3000;
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(10px)';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, duration);
        };
    }
    
    // 显示提示消息
    showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        }
    }
    
    // 获取状态
    getStatus() {
        return {
            isMenuOpen: this.state.isMenuOpen,
            isRotating: this.state.isRotating
        };
    }
    
    // 销毁
    destroy() {
        this.closeSideMenu();
        this.closeConsoleLogsModal();
        console.log('🎮 UI交互管理器已销毁');
    }
}

// 导出模块
window.UIInteraction = UIInteraction; 