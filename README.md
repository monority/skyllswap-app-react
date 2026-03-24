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

## Tests

Backend:

```bash
cd backend
npm run test
npm run test:coverage
```

CI:

- Workflow GitHub Actions: `.github/workflows/backend-ci.yml`
- Lance les tests backend avec couverture sur `push` et `pull_request`

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

- Deployer le frontend sur Vercel
- Deployer l'API sur Railway
- Connecter l'API a PostgreSQL Neon

## Deploiement cloud (front + API + DB)

Stack de production recommandee:

- Frontend: Vercel
- API: Railway
- DB: Neon PostgreSQL

### 1. Variables Railway (backend)

Configurer ces variables dans le service Railway:

- `DATABASE_URL`: URL Neon (non pooler)
- `JWT_SECRET`: secret long et aleatoire
- `FRONTEND_ORIGIN`: URL Vercel du frontend (possible multi-origines, separees par virgule)
- `PORT`: laisse Railway gerer ou garder `4000`

Exemple multi-origines:

```env
FRONTEND_ORIGIN=https://skillswap.vercel.app,https://skillswap-git-main-xxx.vercel.app
```

Le backend applique automatiquement les migrations Prisma au demarrage via:

- `npm run prisma:migrate:deploy && npm start`

### 2. Variables Vercel (frontend)

Configurer dans le projet Vercel:

- `VITE_API_URL`: URL publique Railway de l'API

Exemple:

```env
VITE_API_URL=https://skillswap-api-production.up.railway.app
```

### 3. Verifications post-deploiement

- API health: `GET /api/health`
- Register/Login depuis l'UI
- Edition de profil
- Matching reel
- Creation conversation + envoi messages