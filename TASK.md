# SkyllSwap — Design Rework Vers Vercel/ShadCN

Objectif: rework CSS + classes JSX pour un design 10/10 moderne, épuré, proche de Vercel et ShadCN UI.
Architecture existante conservée (tokens CSS, couches, Inter font). Ajout d'un accent violet subtil.

---

## Statut global

| Phase | Fichier(s) | Statut |
|-------|-----------|--------|
| 1–2   | base.css | 🔄 En cours |
| 3     | layout.css, app.css (dashboard) | ⏳ À faire |
| 4     | app.css (panels) | ⏳ À faire |
| 5–6   | components.css, header.css | ⏳ À faire |
| 7     | app.css (auth landing) | ⏳ À faire |
| 8     | app.css (skills, matches, messaging, chat modal) | ⏳ À faire |
| 9     | JSX classNames | ⏳ À faire |
| 10    | index.html (theme-color) | ⏳ À faire |

---

## Détail des tâches

### Phase 1 — Tokens couleurs (base.css)
- [ ] Ajouter `--accent-primary: 252 76% 60%` (violet, light) et `252 87% 67%` (dark)
- [ ] Ajouter `--accent-primary-foreground: 0 0% 100%`
- [ ] Dark mode: `--background` → `0 0% 3.5%` (quasi-noir Vercel style)
- [ ] Dark mode: `--card` → `0 0% 5.5%` (surface légèrement élevée)
- [ ] Dark mode: `--border` → `240 3.7% 12%` (lignes ultra-subtiles)
- [ ] Dark mode: `--ring` → utilise l'accent violet
- [ ] Radius: `0.5rem` → `0.375rem` (plus géométrique)
- [ ] Ajouter `--tracking-tight: -0.03em`
- [ ] Ajouter `--shadow-glow` (violet glow pour focus)

### Phase 2 — Typographie (base.css)
- [ ] h1, h2: `letter-spacing: -0.04em`, weight 700
- [ ] h3, h4: `letter-spacing: -0.02em`
- [ ] Scrollbar: 8px → 6px, plus subtil

### Phase 3 — Layout (layout.css + app.css)
- [ ] Container: `max-width: 1400px` → `1280px`
- [ ] Dashboard height: ajuster pour nouveau header 48px/56px
- [ ] Dashboard gap: légèrement augmenté pour respiration

### Phase 4 — Panels (app.css)
- [ ] `.panel:hover`: border-color transition au lieu de box-shadow
- [ ] Panel h2: label `10px` ultra-raffiné style Vercel

### Phase 5 — Boutons & Forms (components.css)
- [ ] `.btn--primary`: background → `--accent-primary` (violet)
- [ ] `.btn--primary:hover`: lift `translateY(-1px)` + légèrement plus clair
- [ ] `.btn:focus-visible`: ring violet
- [ ] `.input:focus`: violet glow ring (`--shadow-glow`)
- [ ] `.form-label`: `11px uppercase tracking` style label Vercel

### Phase 6 — Header (header.css)
- [ ] Hauteur: `56px` → `48px`, sm: `64px` → `56px`
- [ ] Blur: opacité `0.8` → `0.92` (plus opaque)
- [ ] Icon buttons: hover accent violet sur messages

### Phase 7 — Auth Landing (app.css)
- [ ] Radial gradient violet bleeding depuis le haut (style Vercel hero)
- [ ] Auth card dark: glassmorphism (`backdrop-filter: blur(24px)`, border semi-transparent)
- [ ] Auth logo: gradient violet au lieu de flat foreground

### Phase 8 — Sections features (app.css)
- [ ] Skills: left-border accent au hover
- [ ] Matches: `.match-score` font-mono
- [ ] Messaging: conv-item active → left border accent violet
- [ ] Messaging: bulle "mine" → accent violet au lieu du noir full
- [ ] Chat modal: box-shadow plus profond, tighter border

### Phase 9 — JSX / classNames
- [ ] Vérifier les composants pour ajustements mineurs si nécessaire

### Phase 10 — index.html
- [ ] `theme-color` → cohérence avec accent violet

---

## Checklist de vérification finale
- [ ] Auth landing: glow violet depuis le haut, card glassmorphism en dark
- [ ] Dashboard: 3 colonnes, panel headers raffinés, scroll dans panels
- [ ] Header: hauteur réduite, logo aligné, status dot, icon buttons
- [ ] Bouton violet sur CTAs, focus ring sur inputs
- [ ] Chat modal: bulles violet/muted, conv active left-border
- [ ] Mobile 375px: stacking correct, pas de débordement
- [ ] `pnpm --filter frontend lint` — aucune erreur
- [ ] `pnpm --filter frontend build` — build propre

---

## Backlog (non bloquant)
- Ajouter des tests cibles pour `useRealtime`, `useSanitize`, `MessagingPanel`
- Simplifier `backend/index.ts` si ça continue de grossir
- Garder la validation backend cohérente au même endroit
- Améliorer les retours utilisateur (loading, erreur, succès)
