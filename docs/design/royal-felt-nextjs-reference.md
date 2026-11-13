# Royal Felt · Referencia de arquitectura recomendada (Stitch DOCUMENT_2)

> **⚠️ Estado: REFERENCIA, no arquitectura del proyecto actual.**
> La app real (repo `arielmauricioiriarte-58/poker`) es una **web estática HTML + CSS + JavaScript vanilla** servida en Hostinger (Node 18, servidor CommonJS). No hay Next.js, React, TypeScript ni Tailwind en el código actual. Este documento conserva la propuesta de Stitch por si algún día se evalúa una migración de stack, y por trazabilidad del DESIGN SYSTEM.
>
> **🚫 Portal de Desarrollo — ELIMINADO** (decisión del usuario, 13-11-2026): la ruta `src/app/docs` y su `page.tsx` no se implementarán. Cualquier mención del "Portal de Desarrollo" en documentos del repo debe considerarse anulada.
>
> Fuentes (canvas Stitch, proyecto 12554065197685665090):
> - Pantalla `4eefd297a1a044aa948e6395fcb8a2fc` — Estructura de Directorios Recomendada para el Repositorio
> - Pantalla `2ac75e49bc444186848943750a828dd6` — Configuración de `tsconfig.json`
> - Bloque "Justificación Técnica de las Librerías Seleccionadas" (mismo canvas)

---

## 1. Estructura de Directorios Recomendada para el Repositorio

> Stack recomendado: **Next.js (App Router)** o **React + Vite** / React Native (o Capacitor / PWA) con **Tailwind CSS** y **TypeScript**.
> Enfoque: Monorepo o estructura modular web/móvil para compartir componentes de diseño (`casino-chip`, `casino-card`, tapete, tokens).

```
royal-felt/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                   # Pipeline de test, build y validación de tipos
├── docs/                               # Documentación de diseño y especificaciones
│   ├── ARCHITECTURE.md                 # Arquitectura de la app, flujos y state machine
│   ├── DESIGN_SYSTEM.md                # Sistema de diseño, tokens, paleta de colores (WCAG 2.2 AA)
│   ├── COMPONENTS.md                   # Catálogo de fichas táctiles, naipes y botones
│   └── API_SPEC.md                     # Contratos de API para salones y fichas de práctica
├── public/                             # Recursos estáticos
│   ├── favicon.ico
│   ├── icons/                          # Iconos PWA y favicons para web y móvil
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── assets/
│       ├── audio/                      # Efectos sonoros sutiles (fichas, barajeo, check)
│       └── brand/                      # Logotipo e isotipo Royal Felt en formato SVG
├── src/
│   ├── app/                            # Rutas principales (Next.js App Router / Pages)
│   │   ├── layout.tsx                  # Shell raíz con importación de fuentes (Space Grotesk, Manrope, JetBrains Mono)
│   │   ├── globals.css                 # Variables CSS :root y directivas de Tailwind
│   │   ├── page.tsx                    # Landing / Lobby de bienvenida (Presentación Web Mobile-First)
│   │   ├── salon/                      # Selección de mesas y salas privadas
│   │   │   └── page.tsx
│   │   ├── poker/                      # Mesa de Texas Hold'em NL 6-Max
│   │   │   ├── [tableId]/
│   │   │   │   └── page.tsx            # Vista de juego de póker móvil/desktop
│   │   │   └── layout.tsx
│   │   ├── blackjack/                  # Mesa de Blackjack VIP Salón Privé
│   │   │   ├── [tableId]/
│   │   │   │   └── page.tsx            # Vista de juego de blackjack móvil/desktop
│   │   │   └── layout.tsx
│   │   └── docs/                       # 🚫 ELIMINADO (13-11-2026) — Portal de Desarrollo, NO se implementará
│   │       └── page.tsx                # 🚫 ELIMINADO
│   ├── components/                     # Biblioteca de componentes modulares
│   │   ├── ui/                         # Primitivas UI reutilizables
│   │   │   ├── button.tsx              # Botones primarios (All-in, Subir, Fold)
│   │   │   ├── badge.tsx               # Badges de estado de mesa y jugador
│   │   │   ├── modal.tsx               # Modales de configuración, ayuda y recarga ficticia
│   │   │   └── sheet.tsx               # Menú deslizable para estadísticas e historial
│   │   ├── casino/                     # Componentes específicos de casino virtual
│   │   │   ├── chip.tsx                # Ficha táctil (.casino-chip) $25, $100, $500 (≥44px)
│   │   │   ├── chip-tray.tsx           # Bandeja inferior táctil de selección de fichas
│   │   │   ├── card.tsx                # Naipe vectorial (.casino-card) con marfil claro y palos
│   │   │   ├── felt-table.tsx          # Tapete verde esmeralda con gradiente radial y borde
│   │   │   ├── pot-display.tsx         # Contador de pozo central con JetBrains Mono
│   │   │   ├── bet-controls.tsx        # Slider de subida, botones Fold, Check, Call, All-In
│   │   │   └── timer.tsx               # Barra de cuenta regresiva por turno
│   │   ├── poker/                      # Componentes exclusivos de Texas Hold'em
│   │   │   ├── player-seat.tsx         # Asiento de jugador (avatar, fichas, cartas tapadas/vistas)
│   │   │   ├── community-cards.tsx     # Flop, Turn y River en el centro del paño
│   │   │   └── hand-evaluator.tsx      # Indicador pedagógico de mano actual (ej. Doble Par)
│   │   ├── blackjack/                  # Componentes exclusivos de Blackjack VIP
│   │   │   ├── dealer-area.tsx         # Zapato, mano del crupier y conteo visible
│   │   │   ├── player-hand.tsx         # Mano del jugador con cálculo automático de valor (Hard/Soft)
│   │   │   └── action-bar.tsx          # Botones Pedir (+), Plantarse (✋), Doblar (2x), Rendirse (🚩)
│   │   └── layout/                     # Estructura de navegación y shell
│   │       ├── header.tsx              # App Bar superior con balance de fichas y menú
│   │       ├── bottom-nav.tsx          # Navegación móvil fija por pestañas
│   │       └── footer.tsx              # Pie de página institucional y descargo de fichas ficticias
│   ├── hooks/                          # Custom Hooks reutilizables
│   │   ├── use-chips-sound.ts          # Reproducción de SFX en apuestas y click de fichas
│   │   ├── use-game-timer.ts           # Control de tiempos de turno
│   │   └── use-table-socket.ts         # Sincronización WebSockets/SSE para eventos de mesa
│   ├── context/                        # Estados globales de la aplicación
│   │   ├── audio-context.tsx           # Preferencias de volumen y silencio
│   │   └── player-context.tsx          # Balance ficticio de fichas, avatar y nivel VIP
│   ├── types/                          # Definiciones TypeScript
│   │   ├── card.ts                     # Tipo de naipe (Palo: Picas, Corazones, Tréboles, Diamantes; Valor: A-K)
│   │   ├── chip.ts                     # Denominaciones ($1, $5, $25, $100, $500, $1k)
│   │   ├── poker.ts                    # Modelos de mesa, fases (Preflop, Flop, Turn, River) y asientos
│   │   └── blackjack.ts                # Modelos de mesa de blackjack, reglas de mesa y resultados
│   ├── lib/                            # Utilidades puras y evaluadores
│   │   ├── utils.ts                    # Función cn() para concatenación de clases Tailwind (clsx + twMerge)
│   │   ├── card-deck.ts                # Barajador y generador de mazos estándar de 52 cartas
│   │   └── formatters.ts               # Formateador de moneda ficticia con números tabulares
│   └── styles/
│       └── tokens.css                  # Tokens cromáticos, radios y sombras (extraído de DESIGN.md)
├── tailwind.config.js                  # Configuración extendida de colores (felt, gold, surface)
├── postcss.config.js
├── tsconfig.json                       # Path aliases (@/* apuntando a ./src/*)
├── package.json
└── README.md                           # Guía de instalación, scripts y entorno local
```

---

## 2. Justificación Técnica de las Librerías Seleccionadas

### clsx + tailwind-merge (cn() helper)
Esencial para gestionar las clases dinámicas de fichas (`.casino-chip`) y cartas activas sin conflictos de especificidad en Tailwind.

### howler
Motor de audio Web Audio API de latencia ultrabaja para disparar efectos sonoros táctiles (click de fichas, deslizamiento de naipes sobre el paño, avisos de tiempo) con soporte fluido en iOS Safari y Android.

### framer-motion
Animaciones declarativas de alta fidelidad y aceleración por GPU para el reparto de cartas desde el zapato/mazo hacia las posiciones del jugador y cartas comunitarias.

### canvas-confetti
Celebración ligera y optimizada en canvas 2D para victorias en el Showdown y Blackjacks naturales, sin penalizar el rendimiento ni el DOM del juego.

### lucide-react
Iconografía SVG limpia y escalable para la barra superior, controles de audio, corona VIP y candados de mesa privada.

### Archivo complementario recomendado: `src/lib/utils.ts`

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatChips(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount).replace("USD", "$");
}
```

---

## 3. Configuración de `tsconfig.json`

Stack: Next.js 14 (App Router) + React 18/19 + TypeScript + Tailwind CSS. Ubicación: `/tsconfig.json` (raíz del proyecto).

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/casino/*": ["./src/components/casino/*"],
      "@/poker/*": ["./src/components/poker/*"],
      "@/blackjack/*": ["./src/components/blackjack/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/context/*": ["./src/context/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### Detalle de Opciones y Rationale Técnico

| Clave | Valor | Justificación para Royal Felt |
|---|---|---|
| `target` | `ES2022` | Soporta características modernas de JavaScript (como private fields y métodos de array recientes) para evaluadores de manos y state machines. |
| `moduleResolution` | `bundler` | La resolución recomendada por Next.js 14 / Turbopack para compatibilidad moderna de paquetes como `lucide-react`, `howler` y `clsx`. |
| `strict` | `true` | Tipado estricto esencial para lógica de juego segura (cartas, valores de palos, botes numéricos y estados de turno). |
| `paths` (`@/*`) | Aliases configurados | Permite importar módulos limpiamente (ej. `import { Chip } from '@/casino/chip'`) sin rutas relativas profundas (`../../..`). |
| `plugins` | `[{ "name": "next" }]` | Plugin oficial del compilador de Next.js para tipado automático de layouts, pages y Server Actions. |

---

## 4. Equivalencia con la app actual (estática, vanilla JS)

| Propuesta Next.js/TS | Estado en la app actual |
|---|---|
| `cn()` con clsx + tailwind-merge | No aplica (sin Tailwind). Clases dinámicas vía template strings en `js/views.js`/`js/ui.js`. |
| `howler` | `js/sound.js` ya implementa SFX con Web Audio API (fichas, barajeo). Evaluable migrar a howler si crece el SFX. |
| `framer-motion` | Animaciones actuales con CSS transitions/keyframes en `styles.css` (.card, .seat, etc.). |
| `canvas-confetti` | Posible mejora: celebración de victoria en Showdown/Blackjack natural. Pendiente de aprobación del usuario. |
| `lucide-react` | Se usa Material Symbols (fuente) en toda la app; sustituir por lucide-react implicaría rediseño de iconografía. |
| `formatChips()` | Equivalente ya existe en la app (formateo `$` con separador de miles) en `js/ui.js`/vistas. |
| `tsconfig.json` / `paths @/*` | No aplica (JS sin bundler). |
| Portal de Desarrollo (`src/app/docs`) | **ELIMINADO — no se implementará.** |
