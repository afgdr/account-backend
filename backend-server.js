const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 📁 Создаем HTML напрямую если папки public нет
function serveFrontend() {
    const publicPath = path.join(__dirname, 'public');
    
    if (fs.existsSync(publicPath)) {
        // Если папка public существует - используем статические файлы
        app.use(express.static(publicPath));
        console.log('✅ Используем статические файлы из папки public');
    } else {
        // Если папки public нет - отдаем HTML напрямую
        console.log('📁 Папка public не найдена, отдаем HTML напрямую');
        
        app.get('/', (req, res) => {
            const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Отправка сообщений в Discord</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px;
        }
        .container { width: 100%; max-width: 500px; }
        .card { 
            background: white; border-radius: 15px; padding: 40px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); backdrop-filter: blur(10px);
        }
        .header { text-align: center; margin-bottom: 30px; }
        h1 { color: #333; margin-bottom: 10px; font-size: 2rem; }
        .subtitle { color: #666; font-size: 1rem; }
        .form { margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #333; font-weight: 600; }
        input, textarea { 
            width: 100%; padding: 12px 16px; border: 2px solid #e1e5e9; border-radius: 8px; 
            font-size: 16px; transition: all 0.3s ease; font-family: inherit;
        }
        input:focus, textarea:focus { 
            outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        textarea { resize: vertical; min-height: 100px; }
        .send-button { 
            width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; 
            border: none; padding: 15px 20px; border-radius: 8px; font-size: 16px; font-weight: 600; 
            cursor: pointer; transition: all 0.3s ease; margin-top: 10px;
        }
        .send-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        .send-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .status { margin-top: 20px; padding: 15px; border-radius: 8px; text-align: center; font-weight: 500; display: none; }
        .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; display: block; }
        .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; display: block; }
        .status.loading { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; display: block; }
        .info { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
        .info h3 { color: #333; margin-bottom: 10px; }
        .info ol { margin-left: 20px; color: #555; }
        .info li { margin-bottom: 5px; }
        @media (max-width: 600px) { .card { padding: 30px 20px; } h1 { font-size: 1.5rem; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>💬 Отправка в Discord</h1>
                <p class="subtitle">Напишите сообщение и оно придет на ваш Discord сервер</p>
            </div>

            <form id="messageForm" class="form">
                <div class="form-group">
                    <label for="username">Ваше имя:</label>
                    <input type="text" id="username" placeholder="Введите ваше имя" value="Гость" required>
                </div>
                
                <div class="form-group">
                    <label for="message">Сообщение:</label>
                    <textarea id="message" placeholder="Введите ваше сообщение..." rows="4" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="webhookUrl">Webhook URL:</label>
                    <input type="text" id="webhookUrl" placeholder="https://discord.com/api/webhooks/..." required>
                    <small>Обязательно для заполнения. Получите в настройках Discord сервера.</small>
                </div>
                
                <button type="submit" id="sendBtn" class="send-button">📨 Отправить в Discord</button>
            </form>
            
            <div id="status" class="status"></div>
            
            <div class="info">
                <h3>📋 Как получить Webhook URL:</h3>
                <ol>
                    <li>Откройте настройки Discord сервера</li>
                    <li>Перейдите в "Интеграции" → "Webhooks"</li>
                    <li>Нажмите "Создать webhook" или выберите существующий</li>
                    <li>Скопируйте URL webhook и вставьте в поле выше</li>
                </ol>
            </div>
        </div>
    </div>

    <script>
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
            }
            
            async processMessageSending() {
                const username = document.getElementById('username').value.trim();
                const message = document.getElementById('message').value.trim();
                const webhookUrl = document.getElementById('webhookUrl').value.trim();
                
                if (!username || !message || !webhookUrl) {
                    this.displayStatusMessage('Заполните все поля', 'error');
                    return;
                }

                this.displayStatusMessage('Отправка сообщения...', 'loading');
                this.sendBtn.disabled = true;

                try {
                    const response = await fetch('/api/send-to-discord', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, message, webhookUrl })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.displayStatusMessage('✅ Сообщение отправлено в Discord!', 'success');
                        document.getElementById('message').value = '';
                    } else {
                        this.displayStatusMessage('❌ ' + data.error, 'error');
                    }
                    
                } catch (error) {
                    this.displayStatusMessage('❌ Ошибка подключения', 'error');
                } finally {
                    this.sendBtn.disabled = false;
                }
            }
            
            displayStatusMessage(message, type) {
                this.statusDiv.textContent = message;
                this.statusDiv.className = 'status ' + type;
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new DiscordWebhookSender();
        });
    </script>
</body>
</html>
            `;
            res.send(html);
        });
    }
}

// Инициализируем фронтенд
serveFrontend();

// 📨 API для отправки в Discord
app.post('/api/send-to-discord', async (req, res) => {
    console.log('📨 Получен запрос:', req.body);
    
    try {
        const { username, message, webhookUrl } = req.body;

        if (!username || !message || !webhookUrl) {
            return res.status(400).json({
                success: false,
                error: 'Все поля обязательны'
            });
        }

        if (!webhookUrl.includes('discord.com/api/webhooks/')) {
            return res.status(400).json({
                success: false,
                error: 'Неверный формат Webhook URL'
            });
        }

        const discordPayload = {
            username: username.substring(0, 80),
            embeds: [{
                title: "💬 Новое сообщение",
                description: message.substring(0, 2000),
                color: 0x667eea,
                timestamp: new Date().toISOString(),
                fields: [
                    { name: "👤 Отправитель", value: username, inline: true },
                    { name: "🕒 Время", value: new Date().toLocaleString('ru-RU'), inline: true }
                ]
            }]
        };

        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });

        if (discordResponse.ok) {
            res.json({ success: true, message: 'Сообщение отправлено!' });
        } else {
            res.status(500).json({
                success: false,
                error: 'Ошибка Discord: ' + discordResponse.status
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера: ' + error.message
        });
    }
});

// 📊 Статус API
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API работает! 🚀',
        timestamp: new Date().toISOString()
    });
});

// 🚀 Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(\`
🎉 Discord App запущен!
📍 Порт: \${PORT}
🌐 Среда: \${process.env.NODE_ENV || 'development'}
🚀 Готов к работе!
    \`);
});
