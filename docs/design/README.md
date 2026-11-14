# Índice de Documentos de Diseño — `docs/design/`

> Estado de cada documento:
> - **integrado**: Tokens/globales ya aplicados en `css/styles.css` (commit `edcdf8b`).
> - **referencia**: Archivo verbatim del canvas Stitch DOCUMENT_2, anotado honestamente vs app actual.
> - **eliminado**: Funcionalidad anulada por decisión del usuario.

| Archivo | Contenido | Estado | Commit |
|---|---|---|---|
| `royal-felt-tokens-v1.md` | Tokens Stitch v1.0.0 (emerald/gold, Space Grotesk/Manrope/JetBrains Mono, Material Symbols, 52 SVG + back.svg + chips) | **integrado** (commit `e183ca5`) | `e183ca5` |
| `royal-felt-component-library.md` | Biblioteca UI Stitch (botones, cards, chips, layout, tabla de componentes) | **referencia** | — |
| `royal-felt-globals-doc2.md` | Globales DOCUMENT_2 verbatim (`:root` completo, `--felt-radial`, `--gold-glow`, font stacks, shadows, radius, touch target) + tabla equivalencias | **integrado** (commit `edcdf8b`) | `edcdf8b` |
| `royal-felt-nextjs-reference.md` | Stack Next.js 14 + React 18/19 + TS5 + Tailwind; package.json, tsconfig, estructura, deps, scripts, env; nota Portal ELIMINADO | **referencia** | — |
| `royal-felt-types-reference.md` | `card.ts` + `poker.ts` verbatim; arquitectura Blackjack; highlights `card-deck` (Fisher-Yates, shoe 6-deck 75% penetration, shuffle-crypto recomendación pendiente) | **referencia** | — |
| `royal-felt-poker-evaluator-doc2.md` | `poker-evaluator.ts` verbatim (Hold'em only, 9 categorías, base-13 rank key, kickers) + comparativa honesta vs evaluador actual (9 cat + Short Deck + Omaha + Draw/Stud + side pots) | **referencia** | `4834cb3` |
| `royal-felt-chip-component-doc2.md` | `chip.tsx` + `ChipTray` verbatim; paleta oficial ($100 red→gold satin conflict), WCAG claim ≥48px vs sm=44px, port candidates | **referencia** | — |
| `royal-felt-player-seat-doc2.md` | `player-seat.tsx` + `poker-seats-layout.tsx` verbatim; avatar monograma/foto vs emojis actuales, timer ring SVG, badges D/SB/BB, action badge, mapeo | **referencia** | — |
| `royal-felt-action-bar-doc2.md` | `action-bar.tsx` + `poker-table-controls.tsx` verbatim; presets (Mín/2.5BB/½Pot/¾Pot/Pot/All-In), ±BB adjust, expandable slider, ARIA attrs, per-action SFX, mapeo vs `.pre`/`.con` slider | **referencia** | — |
| `royal-felt-use-poker-game-doc2.md` | `use-poker-game.ts` verbatim (game loop, blinds, dealer rotation, burn cards, 15s timer+auto-fold, bots 65/35, sidePots[] vacío, min-raise tracking) + flags honestos (Math.random vs crypto, side effects en updaters, Hold'em-only) | **referencia** | — |
| `royal-felt-readme-canvas.md` | README canvas Stitch (Next.js stack, install, scripts, estructura, env, arquitectura, WCAG, licencia) + setup bundle (`package.json`, `setup.sh`, `package-zip.sh`) + notas compatibilidad | **referencia** | — |

---

## Resumen de Integración Real (`css/styles.css`)

| Token / Global | Línea en `styles.css` | Origen |
|---|---|---|
| `:root` completo (superficies, felt, gold, fuentes, sombras, radius, touch target) | 3–34 | `royal-felt-globals-doc2.md` (commit `edcdf8b`) |
| `.table` → `var(--felt-radial)` + `var(--shadow-felt-radial)` | ~119 | `royal-felt-globals-doc2.md` |
| `.card` → `var(--shadow-card)` | ~144 | `royal-felt-globals-doc2.md` |
| `.cta.gold` → `var(--gold-glow)` | ~160 | `royal-felt-globals-doc2.md` |
| `.infobar`/`.con` → `var(--surface-container-lowest)` | ~180 | `royal-felt-globals-doc2.md` |
| `.bg-felt-radial` utility | appended | `royal-felt-globals-doc2.md` |
| `.rf-felt-table` / `.rf-chip` / `.rf-tabular-nums` | appended | `royal-felt-globals-doc2.md` |
| Extensiones propias conservadas (`--danger-text`, `--border-subtle`) | 3–34 | app actual |

---

## Decisiones del Usuario (Histórico)

| Fecha | Decisión | Estado |
|---|---|---|
| 13-11-2026 | Portal de Desarrollo: **ELIMINADO** — no se construye | ✅ Aplicado (marcado en `royal-felt-nextjs-reference.md` y este índice) |
| — | Stack Next.js/React/TS: **Solo referencia** — app permanece vanilla JS | ✅ Aplicado |
| — | Blackjack: 6-deck, BJ 3:2, dealer stands 17, DOBLAR only | ✅ Implementado en `js/engine/blackjack.js` |
| — | `crypto.getRandomValues()` para shuffle: **Pendiente aprobación** | ⏳ Esperando |
| — | `nameEs` pedagógico en UI: **Pendiente aprobación** | ⏳ Esperando |
| — | Reglas por juego con ejemplos SVG: **Pendiente aprobación** | ⏳ Esperando |
| — | Apuestas tipo fichas (chip tray) en mesa póker: **Pendiente aprobación** | ⏳ Esperando |
| — | Realismo visual (felt texture, favicon/OG, shadows): **Pendiente aprobación** | ⏳ Esperando |

---

## Port Candidates (Bajo Riesgo, Vanilla JS) — Próximos Pasos

| Feature | Doc Origen | Compatibilidad App Actual | Esfuerzo | Valor UX |
|---|---|---|---|---|
| Burn cards (pre-flop/turn/river) | `use-poker-game-doc2.md` | ❌ No | Bajo | Alto (regla realista) |
| 15s timer + auto-fold | `use-poker-game-doc2.md` | ❌ No | Medio | Alto (ritmo juego) |
| Timer ring SVG (PlayerSeat) | `player-seat-doc2.md` | ❌ No | Medio | Alto (feedback visual) |
| Dealer/SB/BB badges | `player-seat-doc2.md` | ❌ No | Bajo | Medio (pedagógico) |
| Action badge (CHECK/CALL/RAISE/FOLD/ALL-IN) | `player-seat-doc2.md` | ❌ No (usa `.msg` central) | Bajo | Medio |
| Presets Mín/2.5BB/All-In en ActionBar | `action-bar-doc2.md` | ✅ Parcial (Mín/2.5BB/All-In existen) | Bajo | Alto |
| ±BB fine adjust (slider + botones) | `action-bar-doc2.md` | ✅ Compatible | Bajo | Medio |
| Expandable slider panel | `action-bar-doc2.md` | ❌ No | Medio | Alto (táctil) |
| Slider ARIA attrs (`aria-valuemin/now/max`) | `action-bar-doc2.md` | ✅ Añadible | Bajo | Alto (a11y) |
| Per-action SFX (fold, check, raise, all-in) | `action-bar-doc2.md` + `use-poker-game-doc2.md` | ❌ Faltan (solo `chips`, `deal`, `win`) | Medio | Alto |
| `disabled` global para botones | `action-bar-doc2.md` | ✅ Añadible | Bajo | Medio |
| Crypto shuffle (`crypto.getRandomValues`) | `types-reference.md` + `use-poker-game-doc2.md` | ❌ No (usa `Math.random()`) | Bajo | Alto (seguridad) |
| Pedagogical `nameEs` (kickers español) | `use-poker-game-doc2.md` | ❌ No (evaluador no los tiene) | Bajo | Medio (UI) |

---

## Cómo Usar Este Índice

1. **Para buscar qué está implementado**: Fila con estado **integrado** → ya en `css/styles.css` y/o motor JS.
2. **Para ver qué propone Stitch**: Filas **referencia** → leer el `.md` correspondiente (verbatim + análisis honesto).
3. **Para proponer cambios al usuario**: Consultar tabla "Port Candidates" y decisiones pendientes.
4. **Para auditar**: Cada doc tiene banner `⚠️ REFERENCIA, no código de producción` — nunca copiar ciegamente React/TS a vanilla.