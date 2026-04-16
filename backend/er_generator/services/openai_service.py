import json
import asyncio
from pathlib import Path
from openai import AsyncOpenAI
from django.conf import settings


def get_system_prompt() -> str:
    """Загружает system prompt из файла."""
    prompt_path = Path(__file__).parent.parent.parent / 'prompts' / 'system_prompt.txt'
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()


def get_openai_client() -> AsyncOpenAI:
    """Создает асинхронный клиент OpenAI."""
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def _generate_er_model_async(chat_history: list[dict], sql_dialect: str = 'PostgreSQL') -> dict:
    """
    Асинхронная генерация ER-модели.
    """
    client = get_openai_client()
    system_prompt = get_system_prompt()

    dialect_info = f"\n\n## Текущий диалект SQL\n\nПользователь выбрал диалект: **{sql_dialect}**. Генерируй SQL код именно для этого диалекта."
    full_system_prompt = system_prompt + dialect_info

    messages = [{"role": "system", "content": full_system_prompt}]
    messages.extend(chat_history)

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        response_format={"type": "json_object"},
        temperature=0.7,
    )

    content = response.choices[0].message.content

    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON response from OpenAI: {e}")

    if 'message' not in data:
        raise ValueError("Response must contain 'message' field")

    er_data = data.get('er_data')
    if er_data is not None:
        if 'nodes' not in er_data or 'edges' not in er_data:
            raise ValueError("er_data must contain 'nodes' and 'edges' fields")

    return {
        'message': data['message'],
        'er_data': er_data,
        'sql': data.get('sql')
    }


async def _generate_chat_title_async(prompt: str) -> str:
    """
    Асинхронная генерация названия чата.
    """
    client = get_openai_client()

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "Ты помощник, который создаёт краткие названия для чатов. "
                          "На основе описания пользователя сгенерируй краткое название (макс. 50 символов). "
                          "Отвечай ТОЛЬКО названием, без кавычек и дополнительного текста. "
                          "Название должно быть на русском языке."
            },
            {
                "role": "user",
                "content": f"Создай название для чата по этому запросу: {prompt}"
            }
        ],
        max_tokens=50,
        temperature=0.7,
    )

    title = response.choices[0].message.content.strip()
    return title[:50] if len(title) > 50 else title


def generate_er_model(chat_history: list[dict], sql_dialect: str = 'PostgreSQL') -> dict:
    """
    Синхронная обёртка для генерации ER-модели.
    Запускает async код в event loop.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Если уже есть running loop (например, в ASGI), создаём новый в треде
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    asyncio.run,
                    _generate_er_model_async(chat_history, sql_dialect)
                )
                return future.result()
        else:
            return loop.run_until_complete(_generate_er_model_async(chat_history, sql_dialect))
    except RuntimeError:
        # Нет event loop - создаём новый
        return asyncio.run(_generate_er_model_async(chat_history, sql_dialect))


def generate_chat_title(prompt: str) -> str:
    """
    Синхронная обёртка для генерации названия чата.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    asyncio.run,
                    _generate_chat_title_async(prompt)
                )
                return future.result()
        else:
            return loop.run_until_complete(_generate_chat_title_async(prompt))
    except RuntimeError:
        return asyncio.run(_generate_chat_title_async(prompt))
