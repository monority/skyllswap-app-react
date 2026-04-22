# Configuration des Secrets GitHub

Ce document explique comment configurer les secrets nécessaires pour les déploiements automatisés.

## Secrets Requis

### Pour Render (Backend)

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `RENDER_DEPLOY_HOOK` | Webhook de déploiement Render | 1. Allez sur Render Dashboard<br>2. Sélectionnez votre service<br>3. Settings → Build & Deploy<br>4. Copiez "Deploy Hook" |

### Pour Vercel (Frontend)

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `VERCEL_TOKEN` | Token d'API Vercel | 1. Allez sur [Vercel Account Tokens](https://vercel.com/account/tokens)<br>2. Créez un nouveau token |
| `VERCEL_ORG_ID` | ID d'organisation Vercel | 1. Allez sur Vercel Dashboard<br>2. Settings → General<br>3. Copiez "Organization ID" |
| `VERCEL_PROJECT_ID` | ID de projet Vercel | 1. Allez sur votre projet Vercel<br>2. Settings → General<br>3. Copiez "Project ID" |

## Comment Ajouter les Secrets

1. **Allez dans votre repository GitHub**
   - `https://github.com/votre-username/votre-repo`

2. **Naviguez vers les secrets**
   - Settings → Secrets and variables → Actions

3. **Ajoutez chaque secret**
   - Cliquez sur "New repository secret"
   - Entrez le nom (ex: `RENDER_DEPLOY_HOOK`)
   - Collez la valeur
   - Cliquez sur "Add secret"

## Vérification

Après avoir ajouté tous les secrets, vous pouvez vérifier que les workflows fonctionnent:

1. **Déclenchez un déploiement manuel**
   - Allez dans "Actions"
   - Sélectionnez "Deploy to Render"
   - Cliquez sur "Run workflow"

2. **Vérifiez les logs**
   - Les workflows doivent s'exécuter sans erreur
   - Les déploiements doivent être déclenchés

## Dépannage

### Secrets non reconnus
- Vérifiez l'orthographe des noms de secrets
- Vérifiez que les valeurs sont correctes
- Redémarrez le workflow après correction

### Échec d'authentification
- Vérifiez que les tokens sont valides
- Vérifiez les permissions des tokens
- Regénérez les tokens si nécessaire

### Webhook non fonctionnel
- Vérifiez que l'URL du webhook est correcte
- Testez le webhook avec curl:
  ```bash
  curl -X POST "VOTRE_WEBHOOK_URL"
  ```

## Sécurité

### Bonnes pratiques
1. **Ne jamais commit** les secrets dans le code
2. **Utiliser les secrets GitHub** pour stocker les valeurs sensibles
3. **Limiter les permissions** des tokens
4. **Régulièrement rotation** des tokens (tous les 90 jours)

### Tokens à permissions minimales
- **Vercel Token**: Lecture/écriture pour le projet seulement
- **Render Webhook**: Déclenchement de déploiement seulement

## Support

Si vous rencontrez des problèmes:
1. Consultez les logs GitHub Actions
2. Vérifiez la documentation officielle:
   - [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
   - [Render Webhooks](https://render.com/docs/deploy-webhooks)
   - [Vercel CLI](https://vercel.com/docs/cli)
3. Ouvrez une issue dans le repository

---

**Dernière vérification**: $(date +%Y-%m-%d)
**Statut**: ✅ Prêt à configurer