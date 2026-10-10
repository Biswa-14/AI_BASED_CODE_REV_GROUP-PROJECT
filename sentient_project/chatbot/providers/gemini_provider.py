from google import genai
from google.genai import types

from chatbot.config import GEMINI_API_KEY, GEMINI_MAX_OUTPUT_TOKENS, GEMINI_TEMPERATURE


_client = None


def get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client

def generate_once(prompt, model_name, search_mode="auto"):
    response = get_client().models.generate_content(
        model=model_name,
        contents=prompt,
        config=_generation_config_for(search_mode),
    )
    return _extract_text(response)


def stream_once(prompt, model_name, search_mode="auto"):
    stream = get_client().models.generate_content_stream(
        model=model_name,
        contents=prompt,
        config=_generation_config_for(search_mode),
    )

    for chunk in stream:
        text = _extract_text(chunk)
        if text:
            yield text


def _extract_text(response):
    text = getattr(response, "text", "")
    if callable(text):
        text = text()
    return text or ""


def _generation_config_for(search_mode):
    config_kwargs = {
        "temperature": GEMINI_TEMPERATURE,
        "max_output_tokens": GEMINI_MAX_OUTPUT_TOKENS,
    }

    if search_mode in {"auto", "on"}:
        config_kwargs["tools"] = [types.Tool(google_search=types.GoogleSearch())]

    return types.GenerateContentConfig(**config_kwargs)
