const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Переменные окружения
const PORT = process.env.PORT || 3000;

// In-memory "база данных" (в продакшене используйте реальную БД)
let users = [
  { id: 1, name: 'Алексей', email: 'alex@example.com', role: 'user' },
  { id: 2, name: 'Мария', email: 'maria@example.com', role: 'admin' },
  { id: 3, name: 'Иван', email: 'ivan@example.com', role: 'user' }
];

let products = [
  { id: 1, name: 'Ноутбук', price: 999.99, category: 'Электроника' },
  { id: 2, name: 'Смартфон', price: 699.99, category: 'Электроника' },
  { id: 3, name: 'Книга', price: 19.99, category: 'Книги' }
];

// 📊 Статус API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Бэкенд работает на Render!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      'GET /': 'Статус API',
      'GET /api/users': 'Все пользователи',
      'GET /api/users/:id': 'Пользователь по ID',
      'POST /api/users': 'Создать пользователя',
      'GET /api/products': 'Все товары',
      'POST /api/contact': 'Отправить сообщение'
    }
  });
});

// 👥 Получить всех пользователей
app.get('/api/users', (req, res) => {
  try {
    res.json({
      success: true,
      data: users,
      count: users.length,
      message: `Найдено ${users.length} пользователей`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении пользователей'
    });
  }
});

// 🔍 Получить пользователя по ID
app.get('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
});

// ➕ Создать нового пользователя
app.post('/api/users', (req, res) => {
  try {
    const { name, email, role = 'user' } = req.body;

    // Валидация
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Имя и email обязательны'
      });
    }

    // Проверка существующего email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким email уже существует'
      });
    }

    // Создание нового пользователя
    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно создан',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при создании пользователя'
    });
  }
});

// 📦 Получить все товары
app.get('/api/products', (req, res) => {
  try {
    const { category } = req.query;
    
    let filteredProducts = products;
    
    if (category) {
      filteredProducts = products.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length,
      filters: category ? { category } : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении товаров'
    });
  }
});

// 📧 Отправка сообщения (контактная форма)
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Валидация
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Все поля обязательны для заполнения'
      });
    }

    // Здесь можно добавить отправку email, сохранение в БД и т.д.
    console.log('📧 Новое сообщение:', { name, email, message });

    res.json({
      success: true,
      message: 'Сообщение успешно отправлено!',
      data: {
        id: Date.now(),
        name,
        email,
        message,
        receivedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при отправке сообщения'
    });
  }
});

// 🛒 Симуляция заказа
app.post('/api/orders', (req, res) => {
  try {
    const { productId, quantity = 1, customerInfo } = req.body;

    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    const order = {
      orderId: 'ORD-' + Date.now(),
      product: product.name,
      quantity,
      total: product.price * quantity,
      customer: customerInfo,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Заказ создан успешно',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при создании заказа'
    });
  }
});

// ❌ Обработка несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден',
    availableEndpoints: [
      'GET /',
      'GET /api/users',
      'GET /api/users/:id',
      'POST /api/users',
      'GET /api/products',
      'POST /api/contact',
      'POST /api/orders'
    ]
  });
});

// 🚀 Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🎉 Сервер запущен!
📍 Порт: ${PORT}
🌐 Среда: ${process.env.NODE_ENV || 'development'}
📅 Время: ${new Date().toLocaleString()}
🚀 Готов к работе!
  `);
});

// Обработка graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM. Завершаем работу...');
  process.exit(0);
});
