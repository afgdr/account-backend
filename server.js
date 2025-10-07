const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 📨 Отправка сообщения в Discord
app.post('/api/send-to-discord', async (req, res) => {
    try {
        const { username, message, webhookUrl } = req.body;

        // Валидация
        if (!username || !message) {
            return res.status(400).json({
                success: false,
                error: 'Имя и сообщение обязательны'
            });
        }

        // Webhook URL (из запроса или переменная окружения)
        const discordWebhookUrl = webhookUrl || process.env.DISCORD_WEBHOOK_URL;

        if (!discordWebhookUrl) {
            return res.status(400).json({
                success: false,
                error: 'Webhook URL не указан. Укажите его в форме или настройте на сервере.'
            });
        }

        // Создаем embed сообщение для Discord
        const discordPayload = {
            username: username,
            embeds: [
                {
                    title: "💬 Новое сообщение с сайта",
                    description: message,
                    color: 0x667eea,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: "Отправлено через Cloudflare + Render"
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

        // Отправляем в Discord
        const discordResponse = await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordPayload)
        });

        if (discordResponse.ok) {
            console.log(`✅ Сообщение отправлено в Discord от ${username}`);
            res.json({
                success: true,
                message: 'Сообщение отправлено в Discord'
            });
        } else {
            const errorText = await discordResponse.text();
            console.error('❌ Ошибка Discord:', errorText);
            res.status(500).json({
                success: false,
                error: 'Ошибка при отправке в Discord'
            });
        }

    } catch (error) {
        console.error('❌ Серверная ошибка:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера'
        });
    }
});

// 📊 Статус API
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Discord Webhook API работает!',
        timestamp: new Date().toISOString(),
        endpoints: {
            'POST /api/send-to-discord': 'Отправить сообщение в Discord'
        }
    });
});

// 🚀 Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🎉 Discord Webhook Server запущен!
📍 Порт: ${PORT}
🌐 Среда: ${process.env.NODE_ENV || 'development'}
🚀 Готов к работе!
    `);
});
