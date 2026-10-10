import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").strip().lower()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
# Gemini 2.5 access is restricted for new API projects. Use the current stable
# models so a newly created key works without any extra model entitlements.
PRIMARY_MODEL = os.getenv("PRIMARY_MODEL", "gemini-3.5-flash-lite").strip()
FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "gemini-3.1-flash-lite").strip()
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.15"))
GEMINI_MAX_OUTPUT_TOKENS = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "4096"))


def ensure_gemini_config():
    if LLM_PROVIDER != "gemini":
        raise RuntimeError(
            f"Unsupported LLM_PROVIDER '{LLM_PROVIDER}'. This deployment is configured for Gemini only."
        )

    if not GEMINI_API_KEY:
        raise RuntimeError(
            "Missing GEMINI_API_KEY. Add it to sentient_project/.env before starting the backend."
        )
