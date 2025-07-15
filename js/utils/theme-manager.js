/**
 * TapCode 主题管理器
 * 负责深色模式、主题切换等功能
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.systemPreference = null;
        
        this.init();
    }
    
    init() {
        this.detectSystemPreference();
        this.loadSavedTheme();
        this.bindEvents();
        this.applyTheme();
        
        console.log('🎨 主题管理器已启动');
    }
    
    // 检测系统偏好
    detectSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.systemPreference = 'dark';
        } else {
            this.systemPreference = 'light';
        }
        
        // 监听系统主题变化
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                this.systemPreference = e.matches ? 'dark' : 'light';
                
                // 如果用户没有手动设置过主题，跟随系统
                const savedTheme = localStorage.getItem('darkMode');
                if (!savedTheme) {
                    this.setTheme(this.systemPreference);
                }
            });
        }
    }
    
    // 加载保存的主题
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('darkMode');
        
        if (savedTheme === 'true') {
            this.currentTheme = 'dark';
        } else if (savedTheme === 'false') {
            this.currentTheme = 'light';
        } else {
            // 如果没有保存的设置，跟随系统偏好
            this.currentTheme = this.systemPreference;
        }
    }
    
    // 绑定事件
    bindEvents() {
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => {
                this.toggleTheme();
                
                // 记录用户交互
                if (window.debugContext) {
                    window.debugContext.trackUserInteraction('click', 'darkModeBtn', {
                        newTheme: this.currentTheme
                    });
                }
            });
        }
    }
    
    // 应用主题
    applyTheme() {
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // 更新按钮状态
        this.updateThemeButton();
        
        // 触发主题变化事件
        this.dispatchThemeChangeEvent();
    }
    
    // 设置主题
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('无效的主题:', theme);
            return;
        }
        
        const oldTheme = this.currentTheme;
        this.currentTheme = theme;
        
        // 保存到本地存储
        localStorage.setItem('darkMode', theme === 'dark' ? 'true' : 'false');
        
        // 应用主题
        this.applyTheme();
        
        // 显示提示
        const message = theme === 'dark' ? '已切换到深色模式' : '已切换到浅色模式';
        this.showToast(message);
        
        console.log(`🎨 主题已从 ${oldTheme} 切换到 ${theme}`);
    }
    
    // 切换主题
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    // 更新主题按钮状态
    updateThemeButton() {
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (!darkModeBtn) return;
        
        const icon = darkModeBtn.querySelector('svg');
        if (!icon) return;
        
        // 更新图标
        if (this.currentTheme === 'dark') {
            // 太阳图标（点击切换到浅色）
            icon.innerHTML = `
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="m12 1 0 2m0 16 0 2m11-9-2 0m-16 0-2 0m15.4-6.4-1.4 1.4m-11.2 0-1.4-1.4m12.8 11.2-1.4-1.4m-11.2 0-1.4 1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            `;
        } else {
            // 月亮图标（点击切换到深色）
            icon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="none"/>
            `;
        }
        
        // 更新title
        darkModeBtn.title = this.currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式';
    }
    
    // 获取当前主题
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // 是否为深色模式
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
    
    // 获取系统偏好
    getSystemPreference() {
        return this.systemPreference;
    }
    
    // 重置为系统偏好
    resetToSystemPreference() {
        localStorage.removeItem('darkMode');
        this.setTheme(this.systemPreference);
        this.showToast('已重置为系统偏好设置');
    }
    
    // 触发主题变化事件
    dispatchThemeChangeEvent() {
        const event = new CustomEvent('themechange', {
            detail: {
                theme: this.currentTheme,
                isDark: this.isDarkMode()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // 监听主题变化
    onThemeChange(callback) {
        document.addEventListener('themechange', callback);
    }
    
    // 移除主题变化监听
    offThemeChange(callback) {
        document.removeEventListener('themechange', callback);
    }
    
    // 获取主题相关的CSS变量
    getThemeVariables() {
        const computedStyle = getComputedStyle(document.documentElement);
        
        return {
            primaryColor: computedStyle.getPropertyValue('--primary-color').trim(),
            backgroundColor: computedStyle.getPropertyValue('--background-color').trim(),
            textColor: computedStyle.getPropertyValue('--text-primary').trim(),
            surfaceColor: computedStyle.getPropertyValue('--surface-color').trim()
        };
    }
    
    // 设置自定义主题颜色
    setCustomColors(colors) {
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([property, value]) => {
            if (property.startsWith('--')) {
                root.style.setProperty(property, value);
            } else {
                root.style.setProperty(`--${property}`, value);
            }
        });
        
        console.log('🎨 自定义主题颜色已应用:', colors);
    }
    
    // 重置自定义颜色
    resetCustomColors() {
        const root = document.documentElement;
        const customProperties = [
            '--primary-color',
            '--secondary-color', 
            '--background-color',
            '--surface-color',
            '--text-primary'
        ];
        
        customProperties.forEach(property => {
            root.style.removeProperty(property);
        });
        
        console.log('🎨 自定义主题颜色已重置');
    }
    
    // 显示提示消息
    showToast(message) {
        if (window.showToast) {
            window.showToast(message);
        } else {
            console.log('🎨', message);
        }
    }
    
    // 获取主题统计信息
    getThemeStats() {
        return {
            currentTheme: this.currentTheme,
            systemPreference: this.systemPreference,
            isCustomized: !!localStorage.getItem('darkMode'),
            followsSystem: !localStorage.getItem('darkMode')
        };
    }
    
    // 导出主题配置
    exportThemeConfig() {
        return {
            theme: this.currentTheme,
            customColors: this.getThemeVariables(),
            timestamp: new Date().toISOString()
        };
    }
    
    // 导入主题配置
    importThemeConfig(config) {
        try {
            if (config.theme) {
                this.setTheme(config.theme);
            }
            
            if (config.customColors) {
                this.setCustomColors(config.customColors);
            }
            
            console.log('🎨 主题配置已导入:', config);
            this.showToast('主题配置已导入');
            
        } catch (error) {
            console.error('导入主题配置失败:', error);
            this.showToast('导入失败，配置格式不正确', 'error');
        }
    }
}

// 导出模块
window.ThemeManager = ThemeManager; 