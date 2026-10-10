import requests

from chatbot.config import TAVILY_API_KEY


class WebSearchUnavailable(RuntimeError):
    """Raised when live web search was requested but cannot run."""


def search_web(query):
    if not TAVILY_API_KEY:
        raise WebSearchUnavailable(
            "Live web search needs TAVILY_API_KEY. Add a free Tavily API key in Render Environment, then redeploy."
        )

    try:
        response = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": TAVILY_API_KEY,
                "query": query,
                "search_depth": "basic",
                "max_results": 5,
                "include_answer": False,
            },
            timeout=15,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise WebSearchUnavailable("Live web search is temporarily unavailable. Please try again shortly.") from exc

    results = response.json().get("results", [])
    if not results:
        return "No useful live sources were found for this request."

    sources = []
    for index, result in enumerate(results[:5], start=1):
        title = (result.get("title") or "Untitled source").strip()
        url = (result.get("url") or "").strip()
        snippet = (result.get("content") or "").strip()
        if not url:
            continue
        sources.append(f"[{index}] {title}\nURL: {url}\nSnippet: {snippet[:1200]}")

    return "\n\n".join(sources) or "No useful live sources were found for this request."
