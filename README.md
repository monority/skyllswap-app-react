# SkillSwap

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

## Déploiement

### Stack de production recommandée

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Express API)
- **Base de données**: Neon PostgreSQL

### Déploiement automatisé avec GitHub Actions

Le projet inclut des workflows GitHub Actions pour:

1. **Déploiement automatique** sur push vers `main`
2. **Tests automatisés** avant chaque déploiement
3. **Validation de code** (linting, type checking)

### Configuration rapide

1. **Backend sur Render**:
   - Créer un service Web sur Render
   - Configurer les variables d'environnement
   - Ajouter le webhook comme secret GitHub

2. **Frontend sur Vercel**:
   - Importer le projet sur Vercel
   - Configurer `VITE_API_URL`
   - Ajouter les tokens comme secrets GitHub
