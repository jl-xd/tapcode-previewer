/**
 * TapCode 控制台日志系统
 * 负责拦截、收集和管理控制台日志
 */

class ConsoleLogger {
    constructor() {
        this.consoleLogs = [];
        this.maxLogs = window.CONFIG?.AI_DEBUGGING?.maxConsoleLogs || 50;
        this.isUpdating = false; // 防止循环更新的标志
        
        // 保存原始console方法
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };
        
        this.init();
    }
    
    init() {
        // 先输出启动日志
        this.originalConsole.log('📝 控制台日志系统已启动');
        // 启用拦截功能
        this.interceptConsoleMethods();
        
        // 延迟生成一些测试日志，确保系统正常工作
        setTimeout(() => {
            console.log('📋 控制台日志系统测试 - 这是一条测试日志');
            console.info('📊 系统正在收集控制台输出');
            this.originalConsole.log(`✅ 当前已收集 ${this.consoleLogs.length} 条日志`);
        }, 1000);
    }
    
    // 拦截console方法
    interceptConsoleMethods() {
        // 重写console.log
        console.log = (...args) => {
            this.addLogItem('log', args);
            this.originalConsole.log.apply(console, args);
        };
        
        // 重写console.error
        console.error = (...args) => {
            this.addLogItem('error', args);
            this.originalConsole.error.apply(console, args);
        };
        
        // 重写console.warn
        console.warn = (...args) => {
            this.addLogItem('warn', args);
            this.originalConsole.warn.apply(console, args);
        };
        
        // 重写console.info
        console.info = (...args) => {
            this.addLogItem('info', args);
            this.originalConsole.info.apply(console, args);
        };
    }
    
    // 添加日志项
    addLogItem(type, args) {
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
        
        this.consoleLogs.unshift(logItem);
        
        // 保持日志数量在限制范围内
        if (this.consoleLogs.length > this.maxLogs) {
            this.consoleLogs = this.consoleLogs.slice(0, this.maxLogs);
        }
        
        // 更新UI（使用原始console方法避免无限循环）
        this.updateUI();
    }
    
    // 更新UI显示
    updateUI() {
        // 防止循环更新
        if (this.isUpdating) {
            return;
        }
        
        this.isUpdating = true;
        
        try {
            // 更新日志计数
            const consoleLogCount = document.getElementById('consoleLogCount');
            if (consoleLogCount) {
                consoleLogCount.textContent = this.consoleLogs.length;
            }
            
            // 如果控制台日志查看器是打开的，实时更新
            const consoleLogsModal = document.getElementById('consoleLogsModal');
            if (consoleLogsModal && consoleLogsModal.classList.contains('show')) {
                this.updateConsoleLogsView();
            }
        } catch (error) {
            // 使用原始console方法避免无限循环
            this.originalConsole.error('更新UI时出错:', error);
        } finally {
            this.isUpdating = false;
        }
    }
    
    // 更新控制台日志查看器
    updateConsoleLogsView() {
        try {
            // 直接更新日志计数，避免循环调用
            const consoleLogCount = document.getElementById('consoleLogCount');
            if (consoleLogCount) {
                consoleLogCount.textContent = this.consoleLogs.length;
            }
            
            const consoleLogsViewContainer = document.getElementById('consoleLogsViewContainer');
            if (!consoleLogsViewContainer) {
                this.originalConsole.warn('找不到console日志容器元素');
                return;
            }
            
            if (this.consoleLogs.length === 0) {
                consoleLogsViewContainer.innerHTML = '<div class="console-logs-empty">暂无console日志</div>';
                return;
            }
            
            // 显示所有日志
            const logsHTML = this.consoleLogs.map(log => `
                <div class="console-log-item">
                    <div class="console-log-time">${log.timestamp}</div>
                    <div class="console-log-type ${log.type}">${log.type}</div>
                    <div class="console-log-message">${this.escapeHtml(log.message)}</div>
                </div>
            `).join('');
            
            consoleLogsViewContainer.innerHTML = logsHTML;
        } catch (error) {
            this.originalConsole.error('更新控制台日志查看器时出错:', error);
        }
    }
    
    // HTML转义函数
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 获取日志（用于AI对话）
    getLogsForAI(count = 20) {
        return this.consoleLogs.slice(0, count);
    }
    
    // 获取所有日志
    getAllLogs() {
        return [...this.consoleLogs];
    }
    
    // 清空日志
    clearLogs() {
        this.consoleLogs = [];
        this.updateUI();
        this.originalConsole.log('🧹 控制台日志已清空');
    }
    
    // 获取日志统计
    getStats() {
        const stats = {
            total: this.consoleLogs.length,
            log: 0,
            error: 0,
            warn: 0,
            info: 0
        };
        
        this.consoleLogs.forEach(log => {
            stats[log.type]++;
        });
        
        return stats;
    }
    
    // 根据类型筛选日志
    getLogsByType(type) {
        return this.consoleLogs.filter(log => log.type === type);
    }
    
    // 根据时间范围筛选日志
    getLogsByTimeRange(startTime, endTime) {
        return this.consoleLogs.filter(log => 
            log.time >= startTime && log.time <= endTime
        );
    }
    
    // 搜索日志
    searchLogs(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return this.consoleLogs.filter(log =>
            log.message.toLowerCase().includes(lowerKeyword)
        );
    }
    
    // 测试日志收集功能
    testLogging() {
        this.originalConsole.log('🧪 开始测试控制台日志收集...');
        
        // 测试各种类型的日志
        console.log('这是一条测试日志');
        console.warn('这是一条测试警告');
        console.error('这是一条测试错误');
        console.info('这是一条测试信息');
        
        // 测试对象和数组
        console.log('测试对象:', { test: true, count: this.consoleLogs.length });
        console.log('测试数组:', [1, 2, 3, 'test']);
        
        this.originalConsole.log(`✅ 测试完成，当前收集了 ${this.consoleLogs.length} 条日志`);
        
        // 强制更新UI，但避免循环调用
        this.updateUI();
        
        return this.consoleLogs.length;
    }
    
    // 恢复原始console方法
    restore() {
        console.log = this.originalConsole.log;
        console.error = this.originalConsole.error;
        console.warn = this.originalConsole.warn;
        console.info = this.originalConsole.info;
        this.originalConsole.log('🔄 控制台方法已恢复');
    }
    
    // 导出日志为文本
    exportLogs() {
        const logText = this.consoleLogs.map(log =>
            `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
        ).join('\n');
        
        return logText;
    }
    
    // 导出日志为JSON
    exportLogsAsJSON() {
        return JSON.stringify(this.consoleLogs, null, 2);
    }
}

// 导出模块
window.ConsoleLogger = ConsoleLogger; 