# Estado real de la auditoría en `main` (commit actual)

**Fecha:** 13/11/2026 · **Repo:** `arielmauricioiriarte-58/poker` · **Branch:** `main`  
El documento adjunto `AUDITORIA-SEGURIDAD.md` describe una rama `auditoria` (commit `46bd158`) con estructura `public/` y archivos (`stitch-ui.js`, `profile.js`, `csp-browser.py`) que **no existen en este clon**. Sus hallazgos "Corregido" no están aplicados aquí salvo lo que hemos implementado ahora.

| ID | Hallazgo | Estado en `main` tras esta sesión | Nota |
|---|---|---|---|
| **S-01** | Cabeceras de seguridad ausentes (CSP, XFO, nosniff, etc.) | **Aplicado** | `server.js` reescrito con CSP estricta + HSTS detrás de HTTPS, COOP/CORP, Referrer, Permissions |
| **S-02** | Perfil `localStorage` sin validar (self-XSS, JSON corrupto) | **Pendiente** | Requiere portar lógica de `public/js/profile.js` a `js/main.js` (validar avatar whitelist, nombre ≤16 sin control/RLO, bankroll ≤1e12, stats keys, rechazar corrupto → onboarding) |
| **S-03** | `X-Powered-By: Express` expuesto | **Aplicado** | `app.disable('x-powered-by')` |
| **S-04** | `ui.js` con ~200 líneas `innerHTML`/`style=` inline (impide CSP estricta) | **Parcial** | Nuestro `ui.js` aún usa `innerHTML` extensivamente; CSP actual permite `'self'` (sin `unsafe-inline`) pero no elimina `innerHTML`. El audit reescribió a `stitch-ui.js` (12 líneas base) — no portado aquí. |
| **S-05** | Barajado con `Math.random()` | **Aplicado** | `js/engine/cards.js` → `crypto.getRandomValues` con rechazo + fallback `Math.random` |
| **S-06** | `/package.json` descargable | **Aplicado** | Whitelist estático en `server.js` → 404 para `/server.js`, `/package.json`, `/tests/*`, `/docs/*` |
| **S-07** | Métodos ≠ GET/HEAD dan 404 | **Aplicado** | 405 con `Allow: GET, HEAD` |
| **S-08** | Sin política de caché | **Aplicado** | `no-cache` HTML/JS/CSS; 7d SVG |

| ID | Recomendación (requiere acción tuya) | Estado |
|---|---|---|
| **R-01** | Proteger `main` en GitHub + 2FA | ⬜ Usuario (config GitHub) |
| **R-02** | Borrar rama `master` (maquetas rotas) | ⬜ Usuario (`git push origin --delete master`) |
| **R-03** | Self-host Google Fonts / Material Symbols | ⬜ Usuario (descargar fuentes a `assets/fonts/`, cambiar CSP `font-src 'self'`) |
| **R-04** | Node 22/24 LTS en Hostinger | ⬜ Usuario (panel Hostinger) |

## Portes "vanilla" aprobados ("todos") aplicados en este commit

| Candidato | Estado | Archivo |
|---|---|---|
| `crypto.getRandomValues()` shuffle | ✅ | `js/engine/cards.js` |
| Pedagógico `nameEs` (nombres español) | ✅ (parcial — evaluador ya usa español) | `js/engine/cards.js` NAMES |
| Reglas-por-juego con SVG | ⬜ | — |
| Chip-style tappable bet options | ✅ (presets botones existentes) | `js/ui.js` askHuman |
| Realismo visual (fieltro, favicon/OG, sombras) | ⬜ | — |
| Presets Mín/2.5BB/½Pot/¾Pot/Pot/All-In, ±BB | ⬜ (añadir ¾Pot/2.5BB/±BB) | `js/ui.js` |
| ARIA attrs en slider + expandable panel | ✅ (ARIA añadido; panel expandible pendiente) | `js/ui.js` |
| SFX por acción (fold, check, raise, allin, cardFlip) | ✅ | `js/sound.js` + `js/ui.js` |
| Badges D/SB/BB | ✅ | `js/ui.js` seat() + `css/styles.css` .dbtn.sb/.dbtn.bb |
| Burn cards (Flop/Turn/River) | ✅ | `js/engine/game.js` |
| Timer 15s + auto-fold | ✅ | `js/ui.js` askHuman |
| Timer ring SVG | ⬜ | — |
| `disabled` global | ✅ (propiedad `this.disabled`) | `js/ui.js` |

## Pruebas locales (pre-deploy)

```
node --check js/ui.js js/engine/cards.js js/sound.js js/engine/game.js server.js  → OK
node tests/simulate.mjs (9 variantes × 150 manos)                         → OK (fichas conservadas)
node tests/ui-smoke.mjs (5 variantes × 3 manos, jsdom)                    → OK
```

---

**Próximo paso:** `git add -A && git commit && git push origin main` → esperar ~75 s → verificar en producción con `curl -sI` y comprobación de 404 en rutas sensibles.