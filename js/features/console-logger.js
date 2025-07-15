/**
 * TapCode 控制台日志系统
 * 负责拦截、收集和管理控制台日志
 */

class ConsoleLogger {
    constructor() {
        this.consoleLogs = [];
        this.maxLogs = window.CONFIG?.AI_DEBUGGING?.maxConsoleLogs || 50;
        
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
        this.interceptConsoleMethods();
        console.log('📝 控制台日志系统已启动');
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
        
        // 实时更新UI
        this.updateUI();
    }
    
    // 更新UI显示
    updateUI() {
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
    }
    
    // 更新控制台日志查看器
    updateConsoleLogsView() {
        const consoleLogsViewContainer = document.getElementById('consoleLogsViewContainer');
        if (!consoleLogsViewContainer) return;
        
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
        console.log('🧹 控制台日志已清空');
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
    
    // 恢复原始console方法
    restore() {
        console.log = this.originalConsole.log;
        console.error = this.originalConsole.error;
        console.warn = this.originalConsole.warn;
        console.info = this.originalConsole.info;
        console.log('🔄 控制台方法已恢复');
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