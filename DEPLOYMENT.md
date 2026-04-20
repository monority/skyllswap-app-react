# Guide de Déploiement - SkillSwap

Ce guide explique comment déployer l'application SkillSwap sur Render (backend) et Vercel (frontend) avec GitHub Actions.

## Architecture de Production

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │     Backend     │     │   Base de      │
│   (Vercel)      │────▶│     (Render)    │────▶│   Données      │
│   React + Vite  │     │   Express API   │     │   (Neon)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Prérequis

1. **Comptes nécessaires**:
   - [GitHub](https://github.com) - Déjà configuré
   - [Render](https://render.com) - Pour le backend
   - [Vercel](https://vercel.com) - Pour le frontend
   - [Neon](https://neon.tech) - Pour PostgreSQL (optionnel, peut utiliser Render PostgreSQL)

2. **Secrets GitHub**:
   - `RENDER_DEPLOY_HOOK` - Webhook de déploiement Render
   - `VERCEL_TOKEN` - Token d'API Vercel
   - `VERCEL_ORG_ID` - ID d'organisation Vercel
   - `VERCEL_PROJECT_ID` - ID de projet Vercel

## Configuration du Backend (Render)

### 1. Créer le service sur Render

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre repository GitHub
4. Configurez le service:
   - **Name**: `skyllswap-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2. Configurer les variables d'environnement

Dans les settings du service Render, ajoutez:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=votre_secret_jwt_très_long_et_complexe
FRONTEND_ORIGIN=https://votre-frontend.vercel.app
NODE_ENV=production
PORT=10000
```

### 3. Obtenir le webhook de déploiement

1. Allez dans les settings du service
2. Section "Build & Deploy"
3. Copiez l'URL du "Deploy Hook"
4. Ajoutez-la comme secret GitHub: `RENDER_DEPLOY_HOOK`

## Configuration du Frontend (Vercel)

### 1. Créer le projet sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com)
2. Cliquez sur "Add New..." → "Project"
3. Importez votre repository GitHub
4. Configurez le projet:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Configurer les variables d'environnement

Dans les settings du projet Vercel, ajoutez:

```env
VITE_API_URL=https://skyllswap-api.onrender.com
```

### 3. Obtenir les tokens Vercel

1. Allez sur [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Créez un nouveau token
3. Obtenez votre `ORG_ID` et `PROJECT_ID` depuis le dashboard
4. Ajoutez comme secrets GitHub:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## Configuration GitHub Actions

### Secrets à ajouter dans GitHub

1. Allez dans votre repository GitHub
2. Settings → Secrets and variables → Actions
3. Ajoutez les secrets:

| Secret | Description | Où l'obtenir |
|--------|-------------|--------------|
| `RENDER_DEPLOY_HOOK` | Webhook Render | Render Dashboard → Service → Settings → Build & Deploy |
| `VERCEL_TOKEN` | Token API Vercel | Vercel Account → Tokens |
| `VERCEL_ORG_ID` | ID Organisation Vercel | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | ID Projet Vercel | Vercel Dashboard → Project → Settings → General |

### Workflows disponibles

1. **Backend CI** (`.github/workflows/backend-ci.yml`)
   - Exécute les tests backend sur push/PR
   - Génère un rapport de couverture

2. **Frontend CI** (`.github/workflows/frontend-ci.yml`)
   - Exécute les tests frontend sur push/PR
   - Vérifie le linting

3. **Deploy to Render** (`.github/workflows/deploy-render.yml`)
   - Déploie automatiquement le backend sur Render
   - Déclenché sur push vers `main` ou manuellement

4. **Deploy to Vercel** (`.github/workflows/deploy-vercel.yml`)
   - Déploie automatiquement le frontend sur Vercel
   - Déclenché sur push vers `main` ou manuellement

## Déploiement Manuel

### Backend sur Render

```bash
# 1. Pousser les changements
git push origin main

# 2. Déclencher le déploiement manuellement
# Via GitHub Actions → Deploy to Render → Run workflow
```

### Frontend sur Vercel

```bash
# 1. Pousser les changements
git push origin main

# 2. Déclencher le déploiement manuellement
# Via GitHub Actions → Deploy to Vercel → Run workflow
```

## Vérifications Post-Déploiement

### Backend (Render)
1. Vérifiez la santé de l'API:
   ```bash
   curl https://skyllswap-api.onrender.com/api/health
   ```
   Réponse attendue: `{"status":"ok","service":"skillswap-api"}`

2. Testez l'authentification:
   ```bash
   curl -X POST https://skyllswap-api.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"password123"}'
   ```

### Frontend (Vercel)
1. Visitez l'URL de votre application Vercel
2. Testez:
   - Chargement de la page
   - Formulaire d'inscription/connexion
   - Édition du profil
   - Système de matching
   - Messagerie

## Dépannage

### Problèmes courants

1. **Échec de déploiement Render**
   - Vérifiez les logs dans Render Dashboard
   - Vérifiez que `DATABASE_URL` est correcte
   - Vérifiez que `JWT_SECRET` est défini

2. **Échec de déploiement Vercel**
   - Vérifiez les logs dans Vercel Dashboard
   - Vérifiez que `VITE_API_URL` pointe vers l'API correcte
   - Vérifiez les erreurs de build

3. **Connexion API échouée**
   - Vérifiez que CORS est configuré (`FRONTEND_ORIGIN`)
   - Vérifiez que l'API est accessible depuis Vercel
   - Vérifiez les logs d'erreur

### Monitoring

1. **Render**:
   - Metrics: CPU, mémoire, requêtes
   - Logs en temps réel
   - Alertes de santé

2. **Vercel**:
   - Analytics de performance
   - Logs de déploiement
   - Monitoring d'uptime

3. **GitHub Actions**:
   - Historique des déploiements
   - Logs d'exécution
   - Notifications d'échec

## Coûts

### Plan Gratuit
- **Render**: 750 heures/mois (suffisant pour un MVP)
- **Vercel**: Illimité pour les projets personnels
- **Neon**: 3 projets gratuits, 500MB stockage

### Passage à l'échelle
- **Render**: À partir de $7/mois
- **Vercel**: Pay-as-you-go
- **Neon**: À partir de $19/mois

## Support

- **Documentation Render**: https://render.com/docs
- **Documentation Vercel**: https://vercel.com/docs
- **Issues GitHub**: https://github.com/votre-repo/issues
- **Email**: support@example.com

---

**Dernière mise à jour**: $(date +%Y-%m-%d)
**Statut**: ✅ Prêt pour la production