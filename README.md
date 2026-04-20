# SkillSwap (MVP guide)

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
- Deployer l'API sur Render
- Connecter l'API a PostgreSQL Neon

## Deploiement cloud (front + API + DB)

Stack de production recommandee:

- Frontend: Vercel
- API: Render
- DB: Neon PostgreSQL

### 1. Backend sur Render

**Render (gratuit):**
- Créer service "Web Service"
- Connecter le repo GitHub
- Configurer les variables d'environnement dans le dashboard Render
- `npm run prisma:migrate:deploy && npm start`

### 2. Variables Vercel (frontend)

Configurer dans le projet Vercel:

- `VITE_API_URL`: URL publique render de l'API

Exemple:

```env
VITE_API_URL=https://skyllswap-app-react.onrender.com/
```

### 3. Verifications post-deploiement

- API health: `GET /api/health`
- Register/Login depuis l'UI
- Edition de profil
- Matching reel
- Creation conversation + envoi messages