const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Раздача статических файлов

const PORT = process.env.PORT || 3000;

// 📨 Главный endpoint для отправки в Discord
app.post('/api/send-to-discord', async (req, res) => {
    console.log('📨 Получен запрос:', req.body);
    
    try {
        const { username, message, webhookUrl } = req.body;

        // Валидация
        if (!username || !message) {
            return res.status(400).json({
                success: false,
                error: 'Имя и сообщение обязательны'
            });
        }

        if (!webhookUrl) {
            return res.status(400).json({
                success: false,
                error: 'Webhook URL обязателен'
            });
        }

        // Проверяем валидность webhook URL
        if (!webhookUrl.includes('discord.com/api/webhooks/')) {
            return res.status(400).json({
                success: false,
                error: 'Неверный формат Webhook URL'
            });
        }

        // Подготавливаем данные для Discord
        const discordPayload = {
            username: username.substring(0, 80),
            embeds: [
                {
                    title: "💬 Новое сообщение с сайта",
                    description: message.substring(0, 2000),
                    color: 0x667eea,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Отправлено через Render"
                    },
                    fields: [
                        {
                            name: "👤 Отправитель",
                            value: username,
                            inline: true
                        },
                        {
                            name: "🕒 Время",
                            value: new Date().toLocaleString('ru-RU'),
                            inline: true
                        }
                    ]
                }
            ]
        };

        console.log('🔄 Отправка в Discord...');
        
        // Отправляем в Discord
        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordPayload)
        });

        if (discordResponse.ok) {
            console.log('✅ Сообщение отправлено в Discord');
            res.json({
                success: true,
                message: 'Сообщение успешно отправлено в Discord!'
            });
        } else {
            const errorText = await discordResponse.text();
            console.error('❌ Ошибка Discord:', discordResponse.status, errorText);
            res.status(500).json({
                success: false,
                error: `Ошибка Discord: ${discordResponse.status}`
            });
        }

    } catch (error) {
        console.error('❌ Серверная ошибка:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера: ' + error.message
        });
    }
});

// 📊 Статус API
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'Discord Webhook API работает! 🚀',
        timestamp: new Date().toISOString()
    });
});

// 🏠 Все остальные GET запросы отдаем фронтенд
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🚀 Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🎉 Fullstack Discord App запущен!
📍 Порт: ${PORT}
🌐 Среда: ${process.env.NODE_ENV || 'development'}
📁 Статика: ./public
🚀 Приложение доступно по: http://0.0.0.0:${PORT}
    `);
});
