# Tasks - Implémentation Tests

## PHASE 1: SÉCURITÉ ✅ TERMINÉ

### 1.1 Tests CSRF ✅
- [x] Créer dossier `backend/__tests__/security/`
- [x] Créer fichier `csrf.test.ts`
- [x] Tester token valide accepté
- [x] Tester token invalide rejeté (403)
- [x] Tester token expiré rejeté
- [x] Tester absence de token rejeté
- [x] Tester bypass CSRF autorisé pour GET

### 1.2 Tests Rate Limiting ✅
- [x] Créer fichier `rateLimit.test.ts`
- [x] Tester global limiter (200 req/min)
- [x] Tester auth limiter (5 req/min)
- [x] Vérifier headers rate limit (X-RateLimit-*)
- [x] Tester récupération après timeout

### 1.3 Tests Headers (Helmet) ✅
- [x] Créer fichier `headers.test.ts`
- [x] Tester HSTS header
- [x] Tester CSP header
- [x] Tester X-Frame-Options (DENY)
- [x] Tester X-Content-Type-Options (nosniff)
- [x] Tester Referrer-Policy

### 1.4 Tests CORS ✅
- [x] Créer fichier `cors.test.ts`
- [x] Tester origine autorisée (localhost:5173)
- [x] Tester origine refusée
- [x] Tester preflight OPTIONS
- [x] Tester credentials avec CORS

### 1.5 Tests Auth Security ✅
- [x] Créer fichier `auth.test.ts`
- [x] Tester JWT malformé rejeté
- [x] Tester JWT expiré rejeté
- [x] Tester accès sans token → 401
- [x] Tester password faible rejeté (register)
- [x] Tester email invalide rejeté

### 1.6 Tests Input Validation ✅
- [x] Créer fichier `validation.test.ts`
- [x] Tester XSS dans name (script tags)
- [x] Tester XSS dans email
- [x] Tester name trop long (> 40 chars)
- [x] Tester name trop court (< 2 chars)
- [x] Tester SQL injection patterns dans inputs

---

## PHASE 2: E2E ✅ TERMINÉ

### 2.1 Flux Auth Complet ✅
- [x] Créer fichier `frontend/e2e/auth-flow.spec.ts`
- [x] Login avec creds valides → redirect vers dashboard
- [x] Vérifier session cookie positionné
- [x] Vérifier user name affiché après login
- [x] Logout → redirect vers page login
- [x] Vérifier session invalidée après logout

### 2.2 Routes Protégées ✅
- [x] Créer fichier `frontend/e2e/protected-routes.spec.ts`
- [x] Accéder à / sans auth → voir page publique
- [x] Tenter accéder à /profile sans auth → redirect login
- [x] Tenter accéder à /messages sans auth → redirect login
- [x] Tenter accéder à /matches sans auth → redirect login
- [x] Après login, accès autorisé aux routes protégées

### 2.3 Gestion Erreurs ✅
- [x] Créer fichier `frontend/e2e/error-handling.spec.ts`
- [x] Tester affichage erreur réseau (offline)
- [x] Tester affichage 500 server error
- [x] Tester loading states pendant requêtes
- [x] Tester retry après echec réseau

### 2.4 Accessibilité ✅
- [x] Créer fichier `frontend/e2e/accessibility.spec.ts`
- [x] Navigation clavier (Tab, Enter, Escape)
- [x] Labels ARIA sur formulaires
- [x] Focus visible sur tous éléments interactifs
- [x] Messages d'erreur lisibles par screen reader

### 2.5 Responsive ✅
- [x] Créer fichier `frontend/e2e/responsive.spec.ts`
- [x] Tester layout mobile (< 768px)
- [x] Tester layout tablet (768px - 1024px)
- [x] Tester layout desktop (> 1024px)
- [x] Tester menu burger/collapse sur mobile

---

## PHASE 3: INTÉGRATION DB ❌ NON REQUISE (DB FIXE)
(Maintien des tests existants avec mocks Prisma)
