# Royal Felt · Variables globales (CSS Custom Properties) — DOCUMENT_2 v1.0.0

Fuente: canvas de Stitch, documento "Royal Felt · Tapete Real" (DOCUMENT_2). Bloque verbatim listo para pegar en `globals.css`/`styles.css`. Integrado en `css/styles.css` de la app estática (con las extensiones de app `--danger-text` y `--border-subtle`).

```css
/* ==========================================================================
   ROYAL FELT · TAPETE REAL — VARIABLES GLOBALES (CSS CUSTOM PROPERTIES)
   Versión: 1.0.0
   Entorno: Salón Privé / Fichas Ficticias (100% Práctica)
   Accesibilidad: WCAG 2.2 AA Compliant
   ========================================================================== */

:root {
  /* --- 1. Superficies y Fondos (Dark Mode) --- */
  --surface-base: #10131a;              /* Fondo general de la app / body */
  --surface-dim: #10141a;               /* Superficie secundaria profunda */
  --surface-container-lowest: #0a0e14;  /* Paneles traseros y modales opacos */
  --surface-container-low: #161b24;     /* Bandejas de fichas y navegación */
  --surface-container: #181c22;         /* Tarjetas de juego y paneles de jugador */
  --surface-container-high: #1c2430;    /* Elementos elevados / modales activos */
  --surface-bright: #353940;            /* Bordes sutiles y divisores */

  /* --- 2. Tapete de Fieltro Esmeralda (Felt Canvas) --- */
  --felt-emerald-dark: #0b3d2e;         /* Borde perimetral y sombra del tapete */
  --felt-emerald-light: #10b981;        /* Centro radial iluminado */
  --felt-radial: radial-gradient(circle at center, #10b981 0%, #0b3d2e 70%, #07281e 100%);
  --felt-gradient: linear-gradient(135deg, #0b3d2e 0%, #10b981 100%);

  /* --- 3. Acentos Metálicos Dorados (Gold Accents) --- */
  --gold-primary: #d4a017;             /* Acciones primarias y fichas high-roller */
  --gold-active: #e5a93c;              /* Hover y foco en elementos dorados */
  --gold-muted: #bfa356;               /* Subtítulos, insignias VIP y filigranas */
  --gold-gradient: linear-gradient(135deg, #d4a017 0%, #e5a93c 100%);
  --gold-glow: 0 0 20px rgba(212, 160, 23, 0.25);

  /* --- 4. Tipografía y Contraste de Texto (WCAG AA > 4.5:1) --- */
  --text-primary: #e7ecf3;             /* Títulos, encabezados y cifras destacadas */
  --text-secondary: #94a3b8;           /* Subtítulos y descripciones informativas */
  --text-muted: #64748b;               /* Etiquetas auxiliares y estados inactivos */

  /* --- 5. Estados de Juego y Alertas --- */
  --success-win: #4ede9b;              /* Manos ganadoras, cobros y jugadas +EV */
  --danger-fold: #dc2626;              /* Botón Fold (Retirarse) y advertencias */

  /* --- 6. Familias Tipográficas Oficiales --- */
  --font-heading: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* --- 7. Sombras y Relieves 3D --- */
  --shadow-felt-radial: inset 0 0 60px rgba(0, 0, 0, 0.7);
  --shadow-chip-3d: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2);
  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.4);

  /* --- 8. Radios de Borde --- */
  --radius-sm: 0.375rem;               /* 6px  - Badges y tags pequeños */
  --radius-md: 0.5rem;                 /* 8px  - Botones secundarios e inputs */
  --radius-lg: 0.75rem;                /* 12px - Naipes y botones táctiles */
  --radius-xl: 1rem;                   /* 16px - Tarjetas y paneles contenedores */
  --radius-full: 9999px;               /* Fichas de casino y avatares */

  /* --- 9. Ergonomía Táctil Móvil (WCAG 2.2 AA) --- */
  --touch-target-min: 44px;            /* Área táctil mínima interactiva */
}
```

## Clases Utilitarias Recomendadas (CSS Puro)

Integradas al final de `css/styles.css`:

```css
/* Paño con iluminación radial */
.rf-felt-table {
  background: var(--felt-radial);
  box-shadow: var(--shadow-felt-radial);
}

/* Ficha de casino táctil estándar */
.rf-chip {
  width: 56px;
  height: 56px;
  min-height: var(--touch-target-min);
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-weight: 700;
  box-shadow: var(--shadow-chip-3d);
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.rf-chip:hover {
  transform: translateY(-2px);
}

.rf-chip:active {
  transform: translateY(1px);
}

/* Formato tabular numérico para montos y cronómetros */
.rf-tabular-nums {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
```

## Notas de integración en la app estática

- `.bg-felt-radial` y `.table` consumen `var(--felt-radial)` (el `.table` conserva su elipse y `::before` de dashed ring propios del diseño actual).
- `.table` usa `var(--shadow-felt-radial)` además de su marco `0 0 0 3px #343a44,0 20px 44px rgba(0,0,0,.6)`.
- `.card` usa `var(--shadow-card)`; `.cta.gold` usa `var(--gold-glow)`.
- Paneles traseros opacos (`.infobar`, `.con`) usan `var(--surface-container-lowest)`.
- `--danger-fold` NO pasa AA para textos pequeños; para texto de peligro se usa `--danger-text` (`color-mix(in srgb, var(--danger-fold) 62%, #ffffff)`).
- `--radius-*` están definidos pero la migración de radios hardcodeados del código existente es opcional (pendiente, de bajo riesgo).
