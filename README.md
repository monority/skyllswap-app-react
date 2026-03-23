# SkillSwap Local (MVP guide)

Premier jet full-stack pour portfolio.

## Stack

- Frontend: React + Vite
- Backend: Express

## Lancer le projet

1. Backend

```bash
cd backend
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

2. Frontend

```bash
cd frontend
copy .env.example .env
npm run dev
```

## Endpoints disponibles

- `GET /api/health`
- `GET /api/skills?q=react`
- `GET /api/matches/preview`
- `GET /api/matches/me` (Bearer token)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `POST /api/auth/logout`
- `GET /api/profile/me` (Bearer token)
- `PUT /api/profile/me` (Bearer token)

## Etape suivante (guidee)

- Ajouter une messagerie basique entre utilisateurs
- Calculer des vrais matchs a partir des offres / besoins en base
- Deployer PostgreSQL + API