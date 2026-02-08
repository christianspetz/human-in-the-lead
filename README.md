# Human-in-the-Lead: AI Transformation Readiness Diagnostic

A sleek, interactive diagnostic tool that helps executives assess their organization's readiness for AI transformation. Built by Christian Spetz.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js
- **Database**: PostgreSQL
- **AI**: Claude API (Sonnet)
- **PDF**: PDFKit
- **Hosting**: Railway (single service)

## Deploy to Railway

### 1. Create a new project on Railway

### 2. Add a PostgreSQL database
- Click "New" → "Database" → "PostgreSQL"

### 3. Deploy the app
- Connect your GitHub repo, or use `railway up` from CLI
- Railway will auto-detect the Node.js app and build it

### 4. Set environment variables
In your Railway service settings, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | *(auto-set by Railway if you link the PG service)* |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `NODE_ENV` | `production` |

### 5. That's it
Railway will run `npm install && npm run build && npm run migrate` then `npm start`.

## Local Development

```bash
# Install server deps
npm install

# Install client deps and build
cd client && npm install && cd ..

# Set up .env (copy from .env.example)
cp .env.example .env
# Edit .env with your DATABASE_URL and ANTHROPIC_API_KEY

# Run migration
npm run migrate

# Start server (serves API + built frontend)
npm start

# Or for dev with hot-reload:
# Terminal 1: npm run dev:server
# Terminal 2: npm run dev:client
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/api/analyze` | POST | Submit diagnostic, get AI analysis |
| `/api/generate-pdf` | POST | Generate PDF report |
| `/api/stats` | GET | Submission statistics (admin) |

## Architecture

Single Railway service where Express serves the Vite-built React frontend from `client/dist/`. The Claude API key never touches the frontend — all AI calls go through the Express backend.
