# Frontend Install Guide

The frontend uses `package.json` and `package-lock.json` as its dependency manifest.

## Install dependencies

```powershell
npm install
```

## Start development server

```powershell
npm run dev
```

## Build for production

```powershell
npm run build
```

## Environment

Create `.env.local` in this folder if needed:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/xjgppnky
```

## Backend Note

This frontend talks to the Django backend, and the current prototype backend uses Ollama with `qwen2.5-coder:14b`.

Make sure the backend machine has:

```powershell
ollama pull qwen2.5-coder:14b
```
