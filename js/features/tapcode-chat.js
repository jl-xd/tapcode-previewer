/**
 * TapCode 对话系统
 * 负责与TapCode AI的对话交互功能
 */

class TapCodeChat {
    constructor() {
        this.isModalOpen = false;
        this.isSending = false;
        
        // DOM元素
        this.elements = {};
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        console.log('💬 TapCode对话系统已启动');
    }
    
    // 绑定DOM元素
    bindElements() {
        this.elements = {
            aiFeedbackBtn: document.getElementById('aiFeedbackBtn'),
            aiFeedbackModal: document.getElementById('aiFeedbackModal'),
            closeFeedbackModal: document.getElementById('closeFeedbackModal'),
            cancelFeedbackBtn: document.getElementById('cancelFeedbackBtn'),
            sendFeedbackBtn: document.getElementById('sendFeedbackBtn'),
            feedbackInput: document.getElementById('feedbackInput')
        };
    }
    
    // 绑定事件
    bindEvents() {
        // TapCode对话按钮
        if (this.elements.aiFeedbackBtn) {
            this.elements.aiFeedbackBtn.addEventListener('click', () => {
                this.openModal();
                if (window.debugContext) {
                    window.debugContext.trackUserInteraction('click', 'aiFeedbackBtn');
                }
            });
        }
        
        // 关闭按钮
        if (this.elements.closeFeedbackModal) {
            this.elements.closeFeedbackModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // 取消按钮
        if (this.elements.cancelFeedbackBtn) {
            this.elements.cancelFeedbackBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // 发送按钮
        if (this.elements.sendFeedbackBtn) {
            this.elements.sendFeedbackBtn.addEventListener('click', () => {
                this.sendFeedback();
            });
        }
        
        // 点击模态框外部关闭
        if (this.elements.aiFeedbackModal) {
            this.elements.aiFeedbackModal.addEventListener('click', (event) => {
                if (event.target === this.elements.aiFeedbackModal) {
                    this.closeModal();
                }
            });
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            // ESC键关闭
            if (event.key === 'Escape' && this.isModalOpen) {
                this.closeModal();
            }
            
            // Ctrl+Enter发送
            if (event.ctrlKey && event.key === 'Enter' && this.isModalOpen) {
                event.preventDefault();
                this.sendFeedback();
            }
        });
        
        // 输入框实时验证
        if (this.elements.feedbackInput) {
            this.elements.feedbackInput.addEventListener('input', () => {
                this.updateSendButton();
            });
        }
    }
    
    // 打开对话模态框
    openModal() {
        if (!this.elements.aiFeedbackModal) return;
        
        this.elements.aiFeedbackModal.classList.add('show');
        this.isModalOpen = true;
        document.body.style.overflow = 'hidden';
        
        // 聚焦到输入框
        setTimeout(() => {
            if (this.elements.feedbackInput) {
                this.elements.feedbackInput.focus();
            }
        }, 300);
        
        // 记录用户交互
        if (window.debugContext) {
            window.debugContext.trackUserInteraction('modal_open', 'aiFeedbackModal');
        }
    }
    
    // 关闭对话模态框
    closeModal() {
        if (!this.elements.aiFeedbackModal) return;
        
        this.elements.aiFeedbackModal.classList.remove('show');
        this.isModalOpen = false;
        document.body.style.overflow = '';
        
        // 重置表单
        this.resetForm();
        
        // 记录用户交互
        if (window.debugContext) {
            window.debugContext.trackUserInteraction('modal_close', 'aiFeedbackModal');
        }
    }
    
    // 重置表单
    resetForm() {
        if (this.elements.feedbackInput) {
            this.elements.feedbackInput.value = '';
        }
        this.resetSendButton();
    }
    
    // 更新发送按钮状态
    updateSendButton() {
        if (!this.elements.sendFeedbackBtn || !this.elements.feedbackInput) return;
        
        const hasContent = this.elements.feedbackInput.value.trim().length > 0;
        this.elements.sendFeedbackBtn.disabled = !hasContent || this.isSending;
    }
    
    // 重置发送按钮
    resetSendButton() {
        if (!this.elements.sendFeedbackBtn) return;
        
        this.elements.sendFeedbackBtn.disabled = false;
        this.isSending = false;
        
        const btnText = this.elements.sendFeedbackBtn.querySelector('.btn-text');
        const btnLoading = this.elements.sendFeedbackBtn.querySelector('.btn-loading');
        
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
    }
    
    // 设置发送按钮为加载状态
    setSendButtonLoading() {
        if (!this.elements.sendFeedbackBtn) return;
        
        this.elements.sendFeedbackBtn.disabled = true;
        this.isSending = true;
        
        const btnText = this.elements.sendFeedbackBtn.querySelector('.btn-text');
        const btnLoading = this.elements.sendFeedbackBtn.querySelector('.btn-loading');
        
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-flex';
    }
    
    // 发送反馈
    sendFeedback() {
        if (!this.elements.feedbackInput) return;
        
        const userMessage = this.elements.feedbackInput.value.trim();
        
        if (!userMessage) {
            this.showToast('请输入问题描述', 'error');
            return;
        }
        
        this.setSendButtonLoading();
        
        // 记录用户交互
        if (window.debugContext) {
            window.debugContext.trackUserInteraction('click', 'sendFeedbackBtn', { 
                messageLength: userMessage.length 
            });
        }
        
        // 准备发送数据
        const feedbackData = this.prepareFeedbackData(userMessage);
        
        // 模拟发送到TapCode
        this.simulateSendToTapCode(feedbackData);
    }
    
    // 准备反馈数据
    prepareFeedbackData(userMessage) {
        const feedbackData = {
            // 基础信息
            userMessage: userMessage,
            timestamp: new Date().toISOString(),
            url: window.CONFIG?.DEFAULT_PREVIEW_URL || window.location.href
        };
        
        // 添加控制台日志
        if (window.consoleLogger) {
            feedbackData.consoleLogs = window.consoleLogger.getLogsForAI(20);
        }
        
        // 添加调试上下文
        if (window.debugContext) {
            const aiContext = window.debugContext.getAIContext();
            Object.assign(feedbackData, aiContext);
        }
        
        return feedbackData;
    }
    
    // 模拟发送到TapCode
    simulateSendToTapCode(feedbackData) {
        // 模拟网络延迟
        setTimeout(() => {
            console.log('TapCode对话数据:', feedbackData);
            
            // 显示成功消息
            this.showToast('消息已发送给TapCode，感谢您的反馈！', 'success');
            
            // 关闭模态框
            this.closeModal();
            
            // 实际实现中，这里应该是真正的API调用
            // this.sendToTapCodeAPI(feedbackData);
            
        }, 2000); // 模拟网络延迟
    }
    
    // 真实的API调用（示例）
    async sendToTapCodeAPI(feedbackData) {
        try {
            const response = await fetch('/api/tapcode-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.showToast('消息已发送给TapCode，感谢您的反馈！', 'success');
            this.closeModal();
            
            return result;
            
        } catch (error) {
            console.error('发送消息失败:', error);
            this.showToast('发送失败，请稍后重试', 'error');
            this.resetSendButton();
        }
    }
    
    // 显示提示消息
    showToast(message, type = 'success') {
        // 如果有全局的toast系统就使用它
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }
        
        // 否则创建简单的toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            background: ${type === 'error' ? '#ff3b30' : '#34c759'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // 自动消失
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // 获取对话状态
    getStatus() {
        return {
            isModalOpen: this.isModalOpen,
            isSending: this.isSending,
            hasContent: this.elements.feedbackInput ? 
                this.elements.feedbackInput.value.trim().length > 0 : false
        };
    }
    
    // 程序化打开对话框
    openChat(prefillMessage = '') {
        this.openModal();
        if (prefillMessage && this.elements.feedbackInput) {
            this.elements.feedbackInput.value = prefillMessage;
            this.updateSendButton();
        }
    }
    
    // 销毁实例
    destroy() {
        // 移除事件监听器
        // 注意：实际实现中应该保存监听器引用以便正确移除
        this.closeModal();
        console.log('💬 TapCode对话系统已销毁');
    }
}

// 导出模块
window.TapCodeChat = TapCodeChat; 