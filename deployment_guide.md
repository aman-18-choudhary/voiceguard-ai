# VoiceGuard AI Deployment Guide

This guide covers deploying the VoiceGuard AI stack across Vercel (Frontend), Render (FastAPI Backend), and Supabase (Database/Storage).

## 1. Supabase Setup
Ensure your Supabase project is active. You will need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for the backend)

**Storage Configuration**:
Ensure the `adr-audio` bucket is set to **Public** so the frontend audio player and LangGraph AI agent can successfully fetch the `.webm` audio blobs.

## 2. Frontend Deployment (Vercel)

### Prerequisites
1. Push the `frontend` folder to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.

### Configuration
1. **Framework Preset**: Next.js
2. **Root Directory**: `frontend`
3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```
4. Click **Deploy**. Vercel will automatically build the Next.js 15 application.

## 3. Backend Deployment (Render)

### Prerequisites
1. Push the `backend` folder to a GitHub repository.
2. Sign in to [Render](https://render.com) and click **New > Web Service**.

### Configuration
1. **Root Directory**: `backend`
2. **Environment**: Python 3
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   ```env
   PYTHON_VERSION=3.10.0
   GROQ_API_KEY=gsk_...
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```

> [!WARNING]
> Since we use Faster-Whisper and Librosa, ensure your Render instance has enough memory (Standard or Pro tier recommended), as audio processing can be memory-intensive.

## 4. Production Checklist

- [ ] Ensure all 5 SQL migrations in `backend/database/migrations/` have been executed via the Supabase SQL Editor.
- [ ] Ensure the `adr-audio` Supabase Storage bucket is Public.
- [ ] Run the `seed_demo_data.py` script to populate the Research Dashboard with 30 realistic ADR reports.
- [ ] Verify CORS settings on the Render backend to accept requests from your Vercel frontend URL.
- [ ] Test the full audio upload -> transcription -> extraction -> explanation pipeline end-to-end.
