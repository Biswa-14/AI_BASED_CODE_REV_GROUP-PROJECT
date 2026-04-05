# Sentient CodeFixer

Sentient CodeFixer is an AI-based code fixing and analysis project with:

- a Django backend in `sentient_project`
- a React + Vite frontend in `UI_CODEFIXER`
- Ollama-based local model inference for the current prototype

## Project Setup

### Backend

1. Open a terminal in `sentient_project`
2. Create a virtual environment:

```powershell
python -m venv .venv
```

3. Activate it:

```powershell
.venv\Scripts\Activate.ps1
```

4. Install backend dependencies:

```powershell
pip install -r requirements.txt
```

5. Apply migrations:

```powershell
python manage.py migrate
```

6. Start the backend:

```powershell
python manage.py runserver
```

### Frontend

The frontend uses `package.json` and `package-lock.json` as its dependency manifest, which is the Node.js equivalent of `requirements.txt`.

1. Open a terminal in `UI_CODEFIXER`
2. Install frontend dependencies:

```powershell
npm install
```

3. Start the frontend:

```powershell
npm run dev
```

### Environment

Create `UI_CODEFIXER/.env.local` if needed:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/xjgppnky
```

### Ollama Setup For The Current Prototype

The current prototype uses a local Ollama model for inference, so Ollama must be installed and running before the backend can generate responses.

1. Install Ollama on the machine running the backend
2. Pull the current default model:

```powershell
ollama pull qwen2.5-coder:14b
```

3. Make sure Ollama is running
4. Optional: verify the model is available:

```powershell
ollama list
```

The backend currently defaults to:

- `OLLAMA_URL=http://localhost:11434/api/generate`
- `OLLAMA_MODEL=qwen2.5-coder:14b`

## Quick Start

Run the backend in one terminal:

```powershell
cd sentient_project
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
ollama pull qwen2.5-coder:14b
python manage.py migrate
python manage.py runserver
```

Run the frontend in another terminal:

```powershell
cd UI_CODEFIXER
npm install
npm run dev
```
