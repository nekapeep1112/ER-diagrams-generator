import json
import os
from pathlib import Path
from openai import OpenAI
from django.conf import settings


def get_system_prompt() -> str:
    """Загружает system prompt из файла."""
    prompt_path = Path(__file__).parent.parent.parent / 'prompts' / 'system_prompt.txt'
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()


def get_openai_client() -> OpenAI:
    """Создает клиент OpenAI."""
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_er_model(chat_history: list[dict], sql_dialect: str = 'PostgreSQL') -> dict:
    """
    Генерирует ER-модель, SQL код и текстовый ответ на основе истории чата.

    Args:
        chat_history: Список сообщений в формате [{"role": "user/assistant", "content": "..."}]
        sql_dialect: Диалект SQL для генерации кода (PostgreSQL, MySQL, SQLite, SQL Server, Oracle)

    Returns:
        dict: {
            "message": "Текстовый ответ/резюме",
            "er_data": {"nodes": [...], "edges": [...]} или null,
            "sql": "SQL DDL код" или null
        }
    """
    client = get_openai_client()
    system_prompt = get_system_prompt()

    # Добавляем информацию о выбранном диалекте SQL в system prompt
    dialect_info = f"\n\n## Текущий диалект SQL\n\nПользователь выбрал диалект: **{sql_dialect}**. Генерируй SQL код именно для этого диалекта."
    full_system_prompt = system_prompt + dialect_info

    # Формируем сообщения для OpenAI
    messages = [{"role": "system", "content": full_system_prompt}]

    # Добавляем историю чата
    messages.extend(chat_history)

    response = client.chat.completions.create(
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

    # Валидация структуры
    if 'message' not in data:
        raise ValueError("Response must contain 'message' field")

    # er_data может быть null (для вопросов без схемы)
    er_data = data.get('er_data')
    if er_data is not None:
        if 'nodes' not in er_data or 'edges' not in er_data:
            raise ValueError("er_data must contain 'nodes' and 'edges' fields")

    # sql может быть null (для вопросов без схемы)
    sql = data.get('sql')

    return {
        'message': data['message'],
        'er_data': er_data,
        'sql': sql
    }


def generate_chat_title(prompt: str) -> str:
    """
    Генерирует краткое название для чата на основе промпта пользователя.

    Args:
        prompt: Промпт пользователя

    Returns:
        str: Краткое название для чата (макс. 50 символов)
    """
    client = get_openai_client()

    response = client.chat.completions.create(
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
    # Обрезаем до 50 символов если нужно
    return title[:50] if len(title) > 50 else title
