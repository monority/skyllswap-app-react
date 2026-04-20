# Plan - Couverture de Tests SkillSwap

## Objectif
Améliorer la couverture de tests : sécurité, E2E, et intégration avec DB réelle

## Architecture de test
- **Frontend**: Vitest (unit) + Playwright (e2e)
- **Backend**: Jest (unit/integration) + Supertest
- **DB Tests**: Neon PostgreSQL séparée (`neondb-test`)

---

## Phase 1: Tests de Sécurité (Priorité haute)

### Fichiers à créer
| Fichier | Couverture |
|---------|----------|
| `backend/__tests__/security/csrf.test.ts` | Tokens CSRF, validation, expiration |
| `backend/__tests__/security/rateLimit.test.ts` | Global (200/min) + Auth (5/min) |
| `backend/__tests__/security/headers.test.ts` | Helmet headers (HSTS, CSP, X-Frame) |
| `backend/__tests__/security/cors.test.ts` | Origines autorisées, rejection |
| `backend/__tests__/security/auth.test.ts` | JWT, tokens expirés, bypass |
| `backend/__tests__/security/validation.test.ts` | XSS, inputs malveillants |

---

## Phase 2: Tests E2E (Priorité moyenne)

### Fichiers à créer
| Fichier | Couverture |
|---------|----------|
| `frontend/e2e/auth-flow.spec.ts` | Login → Dashboard → Logout |
| `frontend/e2e/protected-routes.spec.ts` | Accès sans auth |
| `frontend/e2e/error-handling.spec.ts` | API errors, timeout |
| `frontend/e2e/accessibility.spec.ts` | Keyboard, ARIA |
| `frontend/e2e/responsive.spec.ts` | Mobile, tablet, desktop |

---

## Phase 3: Tests Intégration DB

### Fichiers à créer
| Fichier | Couverture |
|---------|----------|
| `backend/__tests__/integration/db.test.ts` | Tests avec DB Neon test |
| `backend/__tests__/validation.routes.test.ts` | Toutes routes API |

---

## DB Tests - Configuration

### .env.test
```
DATABASE_URL=postgresql://.../neondb-test
JWT_SECRET=test_secret_for_tests
FRONTEND_ORIGIN=http://localhost:5173
SESSION_COOKIE_NAME=test_session
PORT=4001
NODE_ENV=test
```

### Setup
- Créer DB `neondb-test` sur Neon
- Runner les migrations sur DB test
- Variables d'environnementchargées depuis `.env.test`

---

## Ordre d'exécution recommandé

1. **Sécurité** (d'abord, critique)
2. **E2E** (flux utilisateur)
3. **Intégration DB** (plus long à maintenir)