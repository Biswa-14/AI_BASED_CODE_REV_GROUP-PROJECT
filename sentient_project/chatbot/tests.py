import json
from unittest.mock import patch

from django.test import TestCase


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
        mocked_generate_response.assert_called_once_with("Hello", mode="review")

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
