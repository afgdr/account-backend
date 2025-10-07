// worker.js
export default {
  async fetch(request, env, ctx) {
    // Настройки CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Обработка preflight запросов
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Маршрутизация
    try {
      // GET /api/users - получить всех пользователей
      if (path === '/api/users' && request.method === 'GET') {
        return await getUsers(request, corsHeaders);
      }

      // GET /api/users/{id} - получить пользователя по ID
      else if (path.startsWith('/api/users/') && request.method === 'GET') {
        return await getUserById(request, corsHeaders);
      }

      // POST /api/users - создать нового пользователя
      else if (path === '/api/users' && request.method === 'POST') {
        return await createUser(request, corsHeaders);
      }

      // GET /api/products - получить товары
      else if (path === '/api/products' && request.method === 'GET') {
        return await getProducts(request, corsHeaders);
      }

      // Статус API
      else if (path === '/api/status' && request.method === 'GET') {
        return new Response(JSON.stringify({
          status: 'OK',
          message: 'Cloudflare Worker API is running!',
          timestamp: new Date().toISOString()
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }

      // Домашняя страница
      else if (path === '/' && request.method === 'GET') {
        return new Response(`
          <html>
            <body>
              <h1>Cloudflare Worker Backend API</h1>
              <p>Available endpoints:</p>
              <ul>
                <li>GET /api/users - Get all users</li>
                <li>GET /api/users/{id} - Get user by ID</li>
                <li>POST /api/users - Create new user</li>
                <li>GET /api/products - Get products</li>
                <li>GET /api/status - API status</li>
              </ul>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      }

      else {
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }
  }
}

// Функция для получения всех пользователей
async function getUsers(request, corsHeaders) {
  // Имитация данных из базы
  const users = [
    { id: 1, name: "Alice Smith", email: "alice@example.com", role: "user" },
    { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "admin" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", role: "user" }
  ];

  // Имитация задержки базы данных
  await new Promise(resolve => setTimeout(resolve, 100));

  return new Response(JSON.stringify({
    success: true,
    data: users,
    count: users.length
  }), {
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders 
    }
  });
}

// Функция для получения пользователя по ID
async function getUserById(request, corsHeaders) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const userId = parseInt(pathParts[pathParts.length - 1]);

  const users = {
    1: { id: 1, name: "Alice Smith", email: "alice@example.com", role: "user" },
    2: { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "admin" },
    3: { id: 3, name: "Carol Davis", email: "carol@example.com", role: "user" }
  };

  const user = users[userId];

  if (!user) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'User not found' 
    }), {
      status: 404,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    data: user
  }), {
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders 
    }
  });
}

// Функция для создания пользователя
async function createUser(request, corsHeaders) {
  const contentType = request.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Content-Type must be application/json' 
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }

  try {
    const data = await request.json();
    
    // Простая валидация
    if (!data.name || !data.email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Name and email are required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // Имитация создания пользователя
    const newUser = {
      id: Math.floor(Math.random() * 1000) + 4, // Генерируем ID
      name: data.name,
      email: data.email,
      role: data.role || 'user',
      createdAt: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'User created successfully',
      data: newUser
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid JSON data' 
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }
}

// Функция для получения товаров
async function getProducts(request, corsHeaders) {
  const products = [
    { id: 1, name: "Laptop", price: 999.99, category: "Electronics" },
    { id: 2, name: "Smartphone", price: 699.99, category: "Electronics" },
    { id: 3, name: "Desk Chair", price: 199.99, category: "Furniture" }
  ];

  return new Response(JSON.stringify({
    success: true,
    data: products,
    count: products.length
  }), {
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders 
    }
  });
}
