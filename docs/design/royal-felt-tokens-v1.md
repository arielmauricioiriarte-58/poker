/* =================================================================xture
   ROYAL FELT · TAPETE REAL — DESIGN SYSTEM CSS & TAILWIND TOKENS
   NOTA: para el bloque :root COMPLETO de DOCUMENT_2 (añade --surface-container-lowest, --felt-radial,
   --gold-glow, sombras, radios, touch-target-min y utilidades .rf-*) ver docs/design/royal-felt-globals-doc2.md
   ROYAL FELT · TAPETE REAL — DESIGN SYSTEM CSS & TAILWIND TOKENS
   Versión: 1.0.0
   Entorno: Salón Privé / Fichas Ficticias (100% Práctica)
   ==================================================================== */

/* --- 1. CSS CUSTOM PROPERTIES (VARIABLES) --- */
:root {
  /* Superficies y Fondos */
  --surface-base: #10131a;
  --surface-dim: #10141a;
  --surface-container-low: #161b24;
  --surface-container: #181c22;
  --surface-container-high: #1c2430;
  --surface-bright: #353940;

  /* Paño de Feltro Esmeralda (Gradientes) */
  --felt-emerald-dark: #0b3d2e;
  --felt-emerald-light: #10b981;
  --felt-gradient: linear-gradient(135deg, #0b3d2e 0%, #10b981 100%);

  /* Acentos Metálicos Dorados */
  --gold-primary: #d4a017;
  --gold-active: #e5a93c;
  --gold-muted: #bfa356;
  --gold-gradient: linear-gradient(135deg, #d4a017 0%, #e5a93c 100%);

  /* Tipografía y Textos */
  --text-primary: #e7ecf3;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Estados y Alertas */
  --success-win: #4ede9b;
  --danger-fold: #dc2626;

  /* Tipografías */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Manrope', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* --- 2. TAILWIND CSS CONFIGURATION EXTENSION --- */
/* 
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#10131a',
          dim: '#10141a',
          low: '#161b24',
          container: '#181c22',
          high: '#1c2430',
          bright: '#353940',
        },
        felt: {
          dark: '#0b3d2e',
          light: '#10b981',
        },
        gold: {
          DEFAULT: '#d4a017',
          active: '#e5a93c',
          muted: '#bfa356',
        },
        win: '#4ede9b',
        fold: '#dc2626',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    }
  }
}
*/

/* --- 3. UTILIDADES Y COMPONENTES CLAVE --- */

/* Paño de Juego Radial */
.bg-felt-radial {
  background: radial-gradient(circle at center, #10b981 0%, #0b3d2e 70%, #07281e 100%);
}

/* Bordes y Sutiles Anillos Dorados */
.border-gold-glow {
  border-color: rgba(212, 160, 23, 0.4);
  box-shadow: 0 0 15px rgba(212, 160, 23, 0.15);
}

/* Ficha de Casino Táctil (Componente Base) */
.casino-chip {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}

.casino-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6), inset 0 2px 6px rgba(255, 255, 255, 0.3);
}

.casino-chip:active {
  transform: translateY(1px);
}

/* Carta de Casino Vectorial */
.casino-card {
  background: #f8fafc;
  color: #0f172a;
  border-radius: 0.75rem;
  border: 1px solid rgba(212, 160, 23, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  font-family: var(--font-heading);
}
