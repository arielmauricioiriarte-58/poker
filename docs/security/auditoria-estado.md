# Estado real de la auditoría en `main` (commit actual)

**Fecha:** 13/11/2026 · **Repo:** `arielmauricioiriarte-58/poker` · **Branch:** `main`  
El documento adjunto `AUDITORIA-SEGURIDAD.md` describe una rama `auditoria` (commit `46bd158`) con estructura `public/` y archivos (`stitch-ui.js`, `profile.js`, `csp-browser.py`) que **no existen en este clon**. Sus hallazgos "Corregido" no estaban aplicados aquí; se han portado a vanilla JS en este proyecto.

| ID | Hallazgo | Estado en `main` | Nota |
|---|---|---|---|
| **S-01** | Cabeceras de seguridad ausentes (CSP, XFO, nosniff, etc.) | **Aplicado** | `server.js` reescrito: CSP estricta, HSTS detrás de HTTPS, COOP/CORP, nosniff, Referrer-Policy, Permissions-Policy |
| **S-02** | Perfil `localStorage` sin validar (self-XSS, JSON corrupto) | **Aplicado** | `js/main.js` valida tipos/rangos: avatar whitelist (AVATARS), nombre sin control/RLO/zero-width y ≤16, bankroll ≤1e12, stats solo claves conocidas y `w ≤ h`; JSON corrupto → onboarding |
| **S-03** | `X-Powered-By: Express` expuesto | **Aplicado** | `app.disable('x-powered-by')` |
| **S-04** | `ui.js` con `innerHTML`/`style=` inline | **Parcial** | `say()` ya usaba nodos de texto internamente; la CSP es `script-src 'self'` pero `ui.js` aún construye HTML con `innerHTML` (contenido estático de nuestra autoría). Sin `unsafe-inline` no se inyecta script |
| **S-05** | Barajado con `Math.random()` | **Aplicado** | `js/engine/cards.js` → `crypto.getRandomValues` (rechazo modular + fallback `Math.random`) |
| **S-06** | `/package.json` descargable | **Aplicado** | Whitelist estático en `server.js` → 404 para `/server.js`, `/package.json`, `/package-lock.json`, `/tests/*`, `/docs/*` |
| **S-07** | Métodos ≠ GET/HEAD dan 404 | **Aplicado** | 405 con `Allow: GET, HEAD` |
| **S-08** | Sin política de caché | **Aplicado** | `no-cache` HTML/JS/CSS; 7d SVG |

| ID | Recomendación (requiere acción tuya) | Estado |
|---|---|---|
| **R-01** | Proteger `main` en GitHub + 2FA | ⬜ Usuario (config GitHub) |
| **R-02** | Borrar rama `master` (maquetas rotas) | ⬜ Usuario (`git push origin --delete master`) |
| **R-03** | Self-host Google Fonts / Material Symbols | ⬜ Usuario (descargar fuentes a `assets/fonts/`, cambiar CSP `font-src 'self'`) |
| **R-04** | Node 22/24 LTS en Hostinger | ⬜ Usuario (panel Hostinger) |

## Portes "vanilla" aprobados ("todos") aplicados en este proyecto

| Candidato | Estado | Archivo |
|---|---|---|
| `crypto.getRandomValues()` shuffle | ✅ | `js/engine/cards.js` |
| Pedagógico `nameEs` (nombres didácticos) | ✅ | `js/engine/cards.js` `nameEs` |
| Reglas-por-juego con ejemplo de cartas SVG reales | ✅ | `js/engine/variants.js` RULES + lobby `<details>` en `js/ui.js` |
| Chip-style tappable bet options | ✅ | presets `<button>` Mín/2.5BB/½/¾Bote/Bote/All-In en `js/ui.js` |
| Realismo visual (fieltro textura, favicon/OG) | ✅ | `assets/favicon.svg`, `assets/og.svg`, `.table`/`.bj-felt` textura, `index.html` meta OG |
| Presets Mín/2.5BB/½Pot/¾Pot/Pot/All-In, ±BB | ✅ | `js/ui.js` askHuman (+ `.bbadj` CSS) |
| ARIA attrs en slider + expandable panel | ✅ | `aria-valuemin/max/now`, `aria-label`, panel `.slpan` con toggle `aria-expanded` |
| SFX por acción (fold, check, raise, allin, cardFlip) | ✅ | `js/sound.js` + `js/ui.js` (humano y bots) |
| Badges D/SB/BB | ✅ | `js/ui.js` seat() + `css/styles.css` `.dbtn.sb`/`.dbtn.bb` |
| Burn cards (Flop/Turn/River) | ✅ | `js/engine/game.js` |
| Timer 15s + auto-fold/check | ✅ | `js/ui.js` askHuman (`setInterval` 1s, auto-resolución) |
| Timer ring SVG (anillo visual del turno) | ✅ | `js/ui.js` seat() + CSS `.tring` / `.tr-b` / `.tr-f` |
| `disabled` global | ✅ | `this.disabled=false` en UI + gate de botones |

## Pruebas locales (pre-deploy)

```
node --check (main, ui, variants, cards, sound, game, server)  → OK
node tests/simulate.mjs (9 variantes × 150 manos)               → OK (fichas conservadas)
node tests/ui-smoke.mjs (5 variantes × 3 manos, jsdom)          → OK
```

## Verificación después del despliegue (curl)

```
curl -sI  /            → CSP, nosniff, XFO DENY, Referrer, Permissions, COOP/CORP, HSTS, no-cache
curl  /server.js       → 404     curl  /package.json → 404
curl  /tests/simulate.mjs → 404  POST /             → 405 (Allow: GET, HEAD)
curl  /assets/favicon.svg → 200  curl  /assets/og.svg → 200
```

---

**R-02:** `git push origin --delete master` (usuario). **R-01/R-03/R-04:** acciones en paneles de Hostinger/GitHub (usuario).
