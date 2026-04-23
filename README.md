# SkillSwap

Plateforme d'échange de compétences entre pairs.

## Stack

| Frontend | Backend | Database |
|----------|---------|----------|
| React + Vite + TypeScript | Express + Socket.IO | PostgreSQL + Prisma |

## Installation

```bash
# Backend
cd backend
copy .env.example .env
npm install
npm run prisma:migrate
npm run dev

# Frontend (autre terminal)
cd frontend
copy .env.example .env
npm install
npm run dev
```

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

## API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/register` | - | Inscription |
| `POST /api/auth/login` | - | Connexion |
| `GET /api/auth/me` | Bearer | Profil utilisateur |
| `GET /api/skills` | - | Liste des compétences |
| `GET /api/matches/me` | Bearer | Mes matchs |

## Production

**Frontend**: Vercel  
**Backend**: Render  
**Database**: Neon PostgreSQL

Workflows GitHub Actions: build, test, deploy automatique sur `main`.
