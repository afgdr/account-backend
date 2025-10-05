from js import Response
import json

async def on_fetch(request, env):
    # Разрешаем запросы отовсюду
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    
    # Предварительные запросы
    if request.method == "OPTIONS":
        return Response.new(None, headers=cors_headers)
    
    path = request.path
    
    # Главная страница
    if path == "/":
        return Response.new(
            "✅ Worker готов к работе!",
            headers={**cors_headers, "Content-Type": "text/plain; charset=utf-8"}
        )
    
    # Получение тестового сообщения
    elif path == "/get-message":
        # ЗАРАНЕЕ ЗАГОТОВЛЕННОЕ сообщение
        test_message = "rolox"
        
        return Response.new(
            json.dumps({
                "success": True, 
                "message": test_message,
                "timestamp": "Сообщение отправлено: " + "сейчас"
            }),
            headers={**cors_headers, "Content-Type": "application/json"}
        )
    
    # Любой другой путь
    else:
        return Response.new(
            json.dumps({"error": "Используй GET /get-message"}),
            headers={**cors_headers, "Content-Type": "application/json"}
        )

def main(request, env, context):
    return on_fetch(request, env)
