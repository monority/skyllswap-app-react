# Instructions

## Projet
SkillSwap - Application full-stack échange de compétences (React + Express + Prisma + PostgreSQL)

## Commandes de développement

### Backend
```bash
cd backend

# Développement
npm run dev

# Tests unitaires
npm test

# Tests avec coverage
npm run test:coverage

# Build production
npm run build

# Lancer le serveur prod
npm start
```

### Frontend
```bash
cd frontend

# Développement
npm run dev

# Tests unitaires
npm test

# Tests E2E (Playwright)
npm run test:e2e

# Build production
npm run build

# Linting
npm run lint
```

## Architecture

```
/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Composants UI
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API calls
│   │   └── utils/       # Utilitaires
│   └── e2e/            # Tests Playwright
│
├── backend/           # Express + Prisma
│   ├── prisma/        # Schema DB + migrations
│   └── __tests__/     # Tests Jest
│
└── .github/          # CI/CD workflows
```

## Variables d'environnement

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_ORIGIN=http://localhost:5173
PORT=4000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000
```

## Déploiement

- **Frontend**: Vercel (auto-deploy sur push main)
- **Backend**: Railway (https://skillswap-local-production.up.railway.app)

## Standards de code

1. **TypeScript** - Toujours typer les nouvelles fonctions
2. **ESLint + Prettier** - Formattage automatique
3. **Tests** - Ajouter des tests pour toute nouvelle fonctionnalité
4. **Commits** - Utiliser des messages descriptifs

## Tests à exécuter avant commit

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test -- --run && npm run test:e2e && npm run lint
```
