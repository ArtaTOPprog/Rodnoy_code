import json
import logging
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)


class OpenAIUnavailable(Exception):
    pass


def is_enabled():
    return bool(getattr(settings, "OPENAI_API_KEY", ""))


def chat_json(system_prompt, user_prompt, max_tokens=1500, temperature=0.7):
    if not is_enabled():
        raise OpenAIUnavailable("OPENAI_API_KEY не задан")

    body = {
        "model": settings.OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    request = urllib.request.Request(
        settings.OPENAI_BASE_URL.rstrip("/") + "/chat/completions",
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=settings.OPENAI_TIMEOUT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read(500).decode("utf-8", "replace")
        raise OpenAIUnavailable(f"OpenAI вернул {exc.code}: {detail}") from None
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
        raise OpenAIUnavailable(f"Нет ответа от OpenAI: {exc}") from None

    try:
        content = payload["choices"][0]["message"]["content"]
        result = json.loads(content)
    except (KeyError, IndexError, TypeError, ValueError):
        raise OpenAIUnavailable("OpenAI вернул ответ в неожиданном формате") from None

    if not isinstance(result, dict):
        raise OpenAIUnavailable("OpenAI вернул не JSON-объект")
    return result
