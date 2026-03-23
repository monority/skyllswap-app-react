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
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `POST /api/auth/logout`
- `GET /api/profile/me` (Bearer token)
- `PUT /api/profile/me` (Bearer token)

## Etape suivante (guidee)

- Connecter une base PostgreSQL avec Prisma
- Persister le profil utilisateur (offres / besoins)
- Ajouter edition de profil depuis l'interface