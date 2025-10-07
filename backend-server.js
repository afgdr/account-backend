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
        input, textarea, select { 
            width: 100%; padding: 12px 16px; border: 2px solid #e1e5e9; border-radius: 8px; 
            font-size: 16px; transition: all 0.3s ease; font-family: inherit;
        }
        input:focus, textarea:focus, select:focus { 
            outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        textarea { resize: vertical; min-height: 100px; }
        .avatar-options { 
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;
        }
        .avatar-option { 
            border: 2px solid #e1e5e9; border-radius: 8px; padding: 10px; text-align: center;
            cursor: pointer; transition: all 0.3s ease;
        }
        .avatar-option:hover { border-color: #667eea; }
        .avatar-option.selected { border-color: #667eea; background: #f0f4ff; }
        .avatar-emoji { font-size: 24px; margin-bottom: 5px; }
        .avatar-name { font-size: 12px; color: #666; }
        .custom-avatar-input { margin-top: 10px; }
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
        @media (max-width: 600px) { 
            .card { padding: 30px 20px; } 
            h1 { font-size: 1.5rem; }
            .avatar-options { grid-template-columns: repeat(2, 1fr); }
        }
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
                    <label>Аватарка отправителя:</label>
                    <div class="avatar-options" id="avatarOptions">
                        <div class="avatar-option" data-avatar="👤" data-url="">
                            <div class="avatar-emoji">👤</div>
                            <div class="avatar-name">По умолчанию</div>
                        </div>
                        <div class="avatar-option" data-avatar="🤖" data-url="">
                            <div class="avatar-emoji">🤖</div>
                            <div class="avatar-name">Бот</div>
                        </div>
                        <div class="avatar-option" data-avatar="🎮" data-url="">
                            <div class="avatar-emoji">🎮</div>
                            <div class="avatar-name">Геймер</div>
                        </div>
                        <div class="avatar-option" data-avatar="👨‍💻" data-url="">
                            <div class="avatar-emoji">👨‍💻</div>
                            <div class="avatar-name">Разработчик</div>
                        </div>
                        <div class="avatar-option" data-avatar="🎨" data-url="">
                            <div class="avatar-emoji">🎨</div>
                            <div class="avatar-name">Художник</div>
                        </div>
                        <div class="avatar-option" data-avatar="📚" data-url="">
                            <div class="avatar-emoji">📚</div>
                            <div class="avatar-name">Студент</div>
                        </div>
                    </div>
                    
                    <div class="custom-avatar-input">
                        <label for="customAvatarUrl">Или ссылка на свою аватарку:</label>
                        <input type="text" id="customAvatarUrl" placeholder="https://example.com/avatar.png">
                        <small>Оставьте пустым, чтобы использовать emoji аватарку</small>
                    </div>
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
                
                <h3 style="margin-top: 15px;">🖼️ Про аватарки:</h3>
                <ul>
                    <li>Выберите emoji аватарку из списка</li>
                    <li>Или укажите ссылку на изображение для кастомной аватарки</li>
                    <li>Аватарка будет отображаться в Discord рядом с сообщением</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        class DiscordWebhookSender {
            constructor() {
                this.sendBtn = document.getElementById('sendBtn');
                this.statusDiv = document.getElementById('status');
                this.messageForm = document.getElementById('messageForm');
                this.selectedAvatar = '👤';
                this.customAvatarUrl = '';
                
                this.initializeApp();
            }
            
            initializeApp() {
                this.messageForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.processMessageSending();
                });
                
                // Инициализация выбора аватарки
                this.initAvatarSelection();
                
                // Следим за изменением кастомной аватарки
                document.getElementById('customAvatarUrl').addEventListener('input', (e) => {
                    this.customAvatarUrl = e.target.value.trim();
                    if (this.customAvatarUrl) {
                        this.clearAvatarSelection();
                    }
                });
            }
            
            initAvatarSelection() {
                const avatarOptions = document.querySelectorAll('.avatar-option');
                
                avatarOptions.forEach(option => {
                    option.addEventListener('click', () => {
                        // Снимаем выделение со всех options
                        avatarOptions.forEach(opt => opt.classList.remove('selected'));
                        // Выделяем выбранную
                        option.classList.add('selected');
                        
                        this.selectedAvatar = option.getAttribute('data-avatar');
                        this.customAvatarUrl = ''; // Сбрасываем кастомную аватарку
                        document.getElementById('customAvatarUrl').value = '';
                    });
                });
                
                // Выбираем аватарку по умолчанию
                avatarOptions[0].classList.add('selected');
            }
            
            clearAvatarSelection() {
                const avatarOptions = document.querySelectorAll('.avatar-option');
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                this.selectedAvatar = '';
            }
            
            async processMessageSending() {
                const username = document.getElementById('username').value.trim();
                const message = document.getElementById('message').value.trim();
                const webhookUrl = document.getElementById('webhookUrl').value.trim();
                const customAvatarUrl = document.getElementById('customAvatarUrl').value.trim();
                
                if (!username || !message || !webhookUrl) {
                    this.displayStatusMessage('Заполните все обязательные поля', 'error');
                    return;
                }

                if (!webhookUrl.includes('discord.com/api/webhooks/')) {
                    this.displayStatusMessage('Неверный формат Webhook URL', 'error');
                    return;
                }

                this.displayStatusMessage('Отправка сообщения...', 'loading');
                this.sendBtn.disabled = true;

                try {
                    const requestData = {
                        username: username,
                        message: message,
                        webhookUrl: webhookUrl,
                        avatar: this.selectedAvatar,
                        avatarUrl: customAvatarUrl || ''
                    };

                    const response = await fetch('/api/send-to-discord', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestData)
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        this.displayStatusMessage('✅ Сообщение отправлено в Discord!', 'success');
                        document.getElementById('message').value = '';
                    } else {
                        this.displayStatusMessage('❌ ' + data.error, 'error');
                    }
                    
                } catch (error) {
                    this.displayStatusMessage('❌ Ошибка подключения к серверу', 'error');
                    console.error('Ошибка:', error);
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

// 📨 API для отправки в Discord (обновленный для аватарки)
app.post('/api/send-to-discord', async (req, res) => {
    console.log('📨 Получен запрос:', req.body);
    
    try {
        const { username, message, webhookUrl, avatar, avatarUrl } = req.body;

        if (!username || !message || !webhookUrl) {
            return res.status(400).json({
                success: false,
                error: 'Все обязательные поля должны быть заполнены'
            });
        }

        if (!webhookUrl.includes('discord.com/api/webhooks/')) {
            return res.status(400).json({
                success: false,
                error: 'Неверный формат Webhook URL'
            });
        }

        // Формируем payload для Discord
        const discordPayload = {
            username: username.substring(0, 80),
            content: message.substring(0, 2000)
        };

        // Добавляем аватарку если указана
        if (avatarUrl) {
            discordPayload.avatar_url = avatarUrl;
        } else if (avatar) {
            // Для emoji аватарки создаем embed с иконкой
            discordPayload.embeds = [
                {
                    title: `Сообщение от ${username}`,
                    description: message.substring(0, 2000),
                    color: 0x667eea,
                    timestamp: new Date().toISOString(),
                    thumbnail: {
                        url: this.getAvatarIcon(avatar)
                    },
                    fields: [
                        { name: "👤 Отправитель", value: username, inline: true },
                        { name: "🕒 Время", value: new Date().toLocaleString('ru-RU'), inline: true },
                        { name: "🖼️ Аватар", value: avatar, inline: true }
                    ],
                    footer: {
                        text: "Отправлено через Webhook App",
                        icon_url: this.getAvatarIcon(avatar)
                    }
                }
            ];
            // Убираем content если есть embed
            delete discordPayload.content;
        } else {
            // Стандартное сообщение без особой аватарки
            discordPayload.embeds = [
                {
                    title: "💬 Новое сообщение",
                    description: message.substring(0, 2000),
                    color: 0x667eea,
                    timestamp: new Date().toISOString(),
                    fields: [
                        { name: "👤 Отправитель", value: username, inline: true },
                        { name: "🕒 Время", value: new Date().toLocaleString('ru-RU'), inline: true }
                    ]
                }
            ];
            delete discordPayload.content;
        }

        console.log('🔄 Отправка в Discord с аватаркой:', avatar || avatarUrl);

        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });

        if (discordResponse.ok) {
            console.log('✅ Сообщение отправлено в Discord');
            res.json({ 
                success: true, 
                message: 'Сообщение отправлено!',
                avatarUsed: avatar || avatarUrl || 'стандартная'
            });
        } else {
            const errorText = await discordResponse.text();
            console.error('❌ Ошибка Discord:', discordResponse.status, errorText);
            res.status(500).json({
                success: false,
                error: 'Ошибка Discord: ' + discordResponse.status
            });
        }

    } catch (error) {
        console.error('❌ Серверная ошибка:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера: ' + error.message
        });
    }
});

// Функция для получения иконки аватарки
function getAvatarIcon(emoji) {
    const emojiIcons = {
        '👤': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f464.svg',
        '🤖': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f916.svg',
        '🎮': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f3ae.svg',
        '👨‍💻': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f468-200d-1f4bb.svg',
        '🎨': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f3a8.svg',
        '📚': 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f4da.svg'
    };
    return emojiIcons[emoji] || 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f464.svg';
}

// 📊 Статус API
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API работает! 🚀',
        timestamp: new Date().toISOString(),
        features: ['send-messages', 'custom-avatars', 'emoji-avatars']
    });
});

// 🚀 Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🎉 Discord App с аватарками запущен!
📍 Порт: ${PORT}
🌐 Среда: ${process.env.NODE_ENV || 'development'}
🚀 Готов к работе!
    `);
});
