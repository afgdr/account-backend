class DiscordWebhookSender {
    constructor() {
        this.sendBtn = document.getElementById('sendBtn');
        this.statusDiv = document.getElementById('status');
        this.messageForm = document.getElementById('messageForm');
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processMessageSending();
        });
        
        // Счетчик символов для сообщения
        document.getElementById('message').addEventListener('input', this.updateCharacterCounter.bind(this));
        
        // Горячие клавиши: Ctrl+Enter для отправки
        document.getElementById('message').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.processMessageSending();
            }
        });
        
        // Валидация webhook URL в реальном времени
        document.getElementById('webhookUrl').addEventListener('input', (e) => {
            this.validateWebhookUrlFormat(e.target.value);
        });
        
        console.log('✅ Discord Webhook Sender инициализирован');
    }
    
    updateCharacterCounter() {
        const messageField = document.getElementById('message');
        const counterElement = document.getElementById('charCounter');
        const currentLength = messageField.value.length;
        
        counterElement.textContent = `${currentLength}/2000`;
        
        counterElement.className = 'char-counter';
        if (currentLength > 1900) {
            counterElement.classList.add('danger');
        } else if (currentLength > 1500) {
            counterElement.classList.add('warning');
        }
    }
    
    validateWebhookUrlFormat(url) {
        const webhookInput = document.getElementById('webhookUrl');
        
        if (url && !url.includes('discord.com/api/webhooks/')) {
            webhookInput.style.borderColor = '#e74c3c';
            return false;
        } else {
            webhookInput.style.borderColor = '#e1e5e9';
            return true;
        }
    }
    
    validateFormData() {
        const username = document.getElementById('username').value.trim();
        const message = document.getElementById('message').value.trim();
        const webhookUrl = document.getElementById('webhookUrl').value.trim();
        
        if (!username) {
            this.displayStatusMessage('Введите ваше имя', 'error');
            return false;
        }
        
        if (!message) {
            this.displayStatusMessage('Введите сообщение', 'error');
            return false;
        }
        
        if (!webhookUrl) {
            this.displayStatusMessage('Введите Webhook URL', 'error');
            return false;
        }
        
        if (!this.validateWebhookUrlFormat(webhookUrl)) {
            this.displayStatusMessage('Неверный формат Webhook URL', 'error');
            return false;
        }
        
        return { username, message, webhookUrl };
    }
    
    async processMessageSending() {
        const formData = this.validateFormData();
        if (!formData) return;

        this.displayStatusMessage('Отправка сообщения в Discord...', 'loading');
        this.toggleLoadingState(true);

        try {
            const apiResponse = await fetch('/api/send-to-discord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const responseData = await apiResponse.json();
            
            if (responseData.success) {
                this.displayStatusMessage('✅ Сообщение успешно отправлено в Discord!', 'success');
                this.clearMessageField();
            } else {
                this.displayStatusMessage(`❌ Ошибка: ${responseData.error}`, 'error');
            }
            
        } catch (networkError) {
            console.error('Сетевая ошибка:', networkError);
            this.displayStatusMessage('❌ Ошибка подключения к серверу', 'error');
        } finally {
            this.toggleLoadingState(false);
            
            // Автоматическое скрытие успешного статуса
            if (this.statusDiv.classList.contains('success')) {
                setTimeout(() => {
                    this.hideStatusMessage();
                }, 5000);
            }
        }
    }
    
    clearMessageField() {
        document.getElementById('message').value = '';
        this.updateCharacterCounter();
    }
    
    toggleLoadingState(isLoading) {
        if (isLoading) {
            this.sendBtn.disabled = true;
            this.sendBtn.classList.add('loading');
        } else {
            this.sendBtn.disabled = false;
            this.sendBtn.classList.remove('loading');
        }
    }
    
    displayStatusMessage(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `status ${type}`;
        this.statusDiv.style.display = 'block';
    }
    
    hideStatusMessage() {
        this.statusDiv.style.display = 'none';
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new DiscordWebhookSender();
});
