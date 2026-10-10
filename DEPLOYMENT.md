# Deployment guide

The project is deployed as two services:

- `UI_CODEFIXER`: a Vite static frontend on Vercel.
- `sentient_project`: a Django API plus PostgreSQL database on Render.

## Before deploying

1. Push this repository to GitHub. Do not commit `.env` files.
2. Rotate any provider key that has ever been shared in a screenshot, message, or commit history.
3. Ensure local verification passes:

   ```powershell
   cd sentient_project
   .\.venv\Scripts\python.exe manage.py test chatbot
   cd ..\UI_CODEFIXER
   npm run build
   ```

## Deploy the API on Render

1. In Render, choose **New → Blueprint** and select the GitHub repository.
2. Render detects `render.yaml`, creates `sentient-api` and `sentient-postgres`, and generates `SECRET_KEY`.
3. Provide `GEMINI_API_KEY` when Render requests it. The Blueprint pins the API to Python 3.12.10 and runs migrations before each release.
4. After the API receives its `https://…onrender.com` URL, set these API environment variables and redeploy:

   ```text
   CORS_ALLOWED_ORIGINS=https://your-vercel-site.vercel.app
   CSRF_TRUSTED_ORIGINS=https://your-vercel-site.vercel.app
   ```

## Deploy the frontend on Vercel

1. Import the same repository in Vercel.
2. Set **Root Directory** to `UI_CODEFIXER` and use the Vite preset.
3. Add this production environment variable, using the Render API URL:

   ```text
   VITE_API_BASE_URL=https://your-render-api.onrender.com
   ```

4. Deploy, then use the generated Vercel URL in Render's two CORS variables above.
5. Register an account, send a message, reload the page, and reopen the saved thread to verify the database-backed chat history.

`render.yaml` uses PostgreSQL, not SQLite, so accounts and conversations persist across redeploys.
