import json
from unittest.mock import patch

from django.test import TestCase

from chatbot.ai_engine import _prepare_prompt, sanitize_response_text
from chatbot.models import Conversation, ConversationMessage


class AuthApiTests(TestCase):
    def test_register_login_and_profile_lookup(self):
        register_response = self.client.post(
            "/auth/register/",
            data=json.dumps(
                {
                    "name": "Demo User",
                    "email": "demo@example.com",
                    "password": "demo1234",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(register_response.status_code, 201)
        register_payload = register_response.json()
        self.assertIn("token", register_payload)
        self.assertEqual(register_payload["user"]["email"], "demo@example.com")

        token = register_payload["token"]
        me_response = self.client.get(
            "/auth/me/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()["user"]["name"], "Demo User")

        logout_response = self.client.post(
            "/auth/logout/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(logout_response.status_code, 200)

        login_response = self.client.post(
            "/auth/login/",
            data=json.dumps(
                {
                    "email": "demo@example.com",
                    "password": "demo1234",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.json()["user"]["email"], "demo@example.com")

    @patch("chatbot.views.generate_response", return_value="Mocked reply")
    def test_chat_is_available_in_guest_mode(self, mocked_generate_response):
        response = self.client.post(
            "/chat/",
            data=json.dumps({"message": "Hello", "mode": "review"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["response"], "Mocked reply")
        mocked_generate_response.assert_called_once_with(
            "Hello",
            mode="review",
            search_mode="auto",
        )

    @patch("chatbot.views.generate_response", return_value="Grounded reply")
    def test_chat_accepts_explicit_search_mode(self, mocked_generate_response):
        response = self.client.post(
            "/chat/",
            data=json.dumps({"message": "Check the latest docs", "mode": "fix", "search_mode": "on"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["response"], "Grounded reply")
        mocked_generate_response.assert_called_once_with(
            "Check the latest docs",
            mode="fix",
            search_mode="on",
        )

    def test_login_rejects_wrong_password(self):
        self.client.post(
            "/auth/register/",
            data=json.dumps(
                {
                    "name": "Demo User",
                    "email": "demo@example.com",
                    "password": "demo1234",
                }
            ),
            content_type="application/json",
        )

        response = self.client.post(
            "/auth/login/",
            data=json.dumps(
                {
                    "email": "demo@example.com",
                    "password": "wrongpass",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)

    def test_sanitize_response_text_removes_markdown_lists_and_headings(self):
        raw = "## Live silver rate\n*   **Per Ounce:** Around $86.61 USD\n*   **Per Gram:** Roughly $2.79 USD"
        cleaned = sanitize_response_text(raw)

        self.assertNotIn("##", cleaned)
        self.assertNotIn("*", cleaned)
        self.assertIn("Per Ounce: Around $86.61 USD", cleaned)
        self.assertIn("Per Gram: Roughly $2.79 USD", cleaned)

    @patch("chatbot.ai_engine.search_web", return_value="[1] Docs\nURL: https://example.com\nSnippet: Current docs")
    def test_search_on_adds_tavily_sources_to_model_prompt(self, mocked_search):
        prepared = _prepare_prompt("Current request:\nWhat is the latest Django version?", "on")

        mocked_search.assert_called_once_with("What is the latest Django version?")
        self.assertIn("Live web research", prepared)
        self.assertIn("https://example.com", prepared)

    @patch("chatbot.ai_engine.search_web")
    def test_search_off_does_not_call_tavily(self, mocked_search):
        prompt = "Current request:\nExplain this Python loop"
        self.assertEqual(_prepare_prompt(prompt, "off"), prompt)
        mocked_search.assert_not_called()

    @patch("chatbot.views.stream_response", return_value=iter(["Remembered response"]))
    def test_saved_conversation_persists_messages_and_supplies_user_context(self, mocked_stream_response):
        register_response = self.client.post(
            "/auth/register/",
            data=json.dumps(
                {"name": "Asha", "email": "asha@example.com", "password": "demo1234"}
            ),
            content_type="application/json",
        )
        token = register_response.json()["token"]
        headers = {"HTTP_AUTHORIZATION": f"Bearer {token}"}

        conversation_response = self.client.post(
            "/conversations/",
            data=json.dumps({"title": "Array issue"}),
            content_type="application/json",
            **headers,
        )
        self.assertEqual(conversation_response.status_code, 201)
        conversation_id = conversation_response.json()["conversation"]["id"]
        conversation = Conversation.objects.get(id=conversation_id)
        ConversationMessage.objects.create(
            conversation=conversation,
            role="user",
            content="My array loses its last value.",
        )
        ConversationMessage.objects.create(
            conversation=conversation,
            role="assistant",
            content="Show me the loop that fills it.",
        )

        response = self.client.post(
            "/chat-stream/",
            data=json.dumps(
                {
                    "message": "Here is the loop: for i in range(n - 1)",
                    "mode": "fix",
                    "conversation_id": conversation_id,
                    "display_message": "Here is the loop",
                }
            ),
            content_type="application/json",
            **headers,
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Remembered response", b"".join(response.streaming_content))

        detail_response = self.client.get(f"/conversations/{conversation_id}/", **headers)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(len(detail_response.json()["messages"]), 4)
        model_request = mocked_stream_response.call_args.args[0]
        self.assertIn("The signed-in user is Asha.", model_request)
        self.assertIn("My array loses its last value.", model_request)
        self.assertIn("Show me the loop that fills it.", model_request)
