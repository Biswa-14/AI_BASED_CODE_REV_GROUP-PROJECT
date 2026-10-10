from chatbot.config import FALLBACK_MODEL, PRIMARY_MODEL
from chatbot.providers.gemini_provider import generate_once, stream_once


def generate_with_fallback(prompt, search_mode="auto"):
    last_error = None

    for model_name in _model_order():
        try:
            return generate_once(prompt, model_name, search_mode=search_mode)
        except Exception as exc:
            last_error = exc

    raise RuntimeError(f"All configured Gemini models failed. Last error: {last_error}")


def stream_with_fallback(prompt, search_mode="auto"):
    last_error = None

    for model_name in _model_order():
        try:
            for chunk in stream_once(prompt, model_name, search_mode=search_mode):
                yield chunk
            return
        except Exception as exc:
            last_error = exc

    raise RuntimeError(f"All configured Gemini models failed. Last error: {last_error}")


def _model_order():
    models = [PRIMARY_MODEL]
    if FALLBACK_MODEL and FALLBACK_MODEL != PRIMARY_MODEL:
        models.append(FALLBACK_MODEL)
    return models
