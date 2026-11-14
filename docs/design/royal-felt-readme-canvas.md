# Royal Felt · README Canvas (Stitch DOCUMENT_2)

> **⚠️ REFERENCIA, no código de producción.** Este README describe una propuesta Next.js 14 + React 18/19 + TypeScript 5 + Tailwind CSS 3.4. La app actual es **HTML/CSS/JS vanilla** desplegada en Hostinger (Node 18, CommonJS, sin build step). Nada de este stack está en el repo; se conserva verbatim como referencia de diseño.

---

## README Original (verbatim)

```markdown
# Royal Felt · Tapete Real

> **Salón Privé Digital de Texas Hold'em (6-Max) & Blackjack VIP**  
> Plataforma interactiva mobile-first diseñada bajo un modelo 100% de fichas de práctica y entretenimiento recreativo (sin riesgo patrimonial ni apuestas con dinero real). Cumple estrictamente con el estándar de accesibilidad **WCAG 2.2 Nivel AA** ($\ge 44\text{px}$ en objetivos táctiles).

---

## 📋 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Requisitos Previos](#-requisitos-previos)
4. [Instalación Paso a Paso](#-instalación-paso-a-paso)
5. [Scripts Disponibles](#-scripts-disponibles)
6. [Estructura del Proyecto](#-estructura-del-proyecto)
7. [Variables de Entorno](#-variables-de-entorno)
8. [Arquitectura y Módulos Clave](#-arquitectura-y-módulos-clave)
9. [Directrices de Diseño y Accesibilidad](#-directrices-de-diseño-y-accesibilidad)
10. [Licencia y Aviso Legal](#-licencia-y-aviso-legal)

---

## ✨ Características Principales

- **Texas Hold'em No-Limit (6-Max):** Máquina de estados completa (`src/hooks/use-poker-game.ts`) con gestión de rondas (`preflop`, `flop`, `turn`, `river`, `showdown`), ciegas dinámicas (SB/BB), rotación de dealer y bots rivales automáticos con retardo orgánico.
- **Blackjack VIP Salón Privé:** Zapato multi-baraja (6 mazos) con regla de penetración al 75%, cálculo continuo de totales suaves/duros (*soft/hard hand*) y carta tapada del crupier.
- **Evaluador Matemático de Manos:** Motor combinatorio de 7 cartas (`src/lib/poker-evaluator.ts`) capaz de calcular desempates con kickers precisos.
- **Componentes Táctiles Ergonómicos:**
  - `Chip` (`chip.tsx`): Fichas cerámicas con relieve 3D, estriado perimetral, apilamiento visual y sonido de contacto inmediato.
  - `PlayerSeat` (`player-seat.tsx`): Asientos con anillo temporizador radial SVG regresivo (15s), badges posicionales (D, SB, BB) y cartas descubiertas/tapadas.
  - `ActionBar` (`action-bar.tsx`): Botonera para el pulgar con slider continuo de apuesta, ajuste rápido (+/- 1 BB) y atajos de pozo (Mín, 2.5 BB, 1/2 Pot, 3/4 Pot, Pot, All-In).
- **Motor de Audio Táctil de Baja Latencia (`useChipsSound`):** Síntesis procedural integrada con Web Audio API (<10ms) con soporte complementario para Howler.js.
- **Diseño Mobile-First:** Optimizado primariamente para anchos de pantalla móviles (390px - 430px) y adaptabilidad responsiva a escritorio.

---

## 🛠 Stack Tecnológico

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, React Server Components)
- **Biblioteca UI:** [React 18 / 19](https://react.dev/)
- **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/) (Modo estricto `strict: true`)
- **Estilos:** [Tailwind CSS 3.4](https://tailwindcss.com/) + PostCSS + Autoprefixer
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Audio:** [Howler.js](https://howlerjs.com/) + Web Audio API Procedural
- **Animaciones:** [Framer Motion](https://www.framer.com/motion/) + [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Utilidades de Clases:** `clsx` + `tailwind-merge`

---

## 📦 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu entorno de desarrollo:

- **Node.js:** Versión `18.17.0` o superior (se recomienda Node 20 LTS).
- **Gestor de paquetes:** `npm` (v9+), `pnpm` (v8+) o `yarn` (v1.22+).
- **Git:** Para control de versiones.

Verifica tu versión instalada ejecutando:
```bash
node -v
npm -v
```

---

## 🚀 Instalación Paso a Paso

Sigue estos pasos para clonar, configurar y ejecutar el proyecto localmente:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/royal-felt.git
cd royal-felt
```

### 2. Instalar dependencias
Con **npm**:
```bash
npm install
```
*(Opcional: Si utilizas `pnpm` o `yarn`)*:
```bash
pnpm install
# o
yarn install
```

### 3. Verificar configuración de TypeScript y Tailwind
El proyecto incluye aliases preconfigurados en `tsconfig.json` (`@/*` apuntando a `./src/*`). Puedes ejecutar una comprobación estática de tipos:
```bash
npm run type-check
```

### 4. Iniciar el servidor de desarrollo local
```bash
npm run dev
```

El servidor local se iniciará de forma predeterminada en [http://localhost:3000](http://localhost:3000).

Abre la URL en tu navegador. Para emular la experiencia óptima móvil:
1. Abre las herramientas de desarrollador (**F12** o **Cmd + Option + I**).
2. Activa la vista de dispositivo táctil (**Ctrl + Shift + M** o **Cmd + Shift + M**).
3. Selecciona **iPhone 14 / 15 Pro** (393 × 852 px).

---

## 📜 Scripts Disponibles

En el archivo `package.json` dispones de los siguientes scripts:

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el entorno local de desarrollo con recarga rápida (HMR). |
| `npm run build` | Compila y optimiza la aplicación para despliegue en producción. |
| `npm run start` | Inicia el servidor Node.js en modo producción tras ejecutar `build`. |
| `npm run lint` | Ejecuta ESLint con la configuración oficial de Next.js. |
| `npm run type-check` | Ejecuta el compilador de TypeScript (`tsc --noEmit`) para validar tipos sin emitir código. |
| `npm run format` | Aplica formato automático de código con Prettier y el plugin de Tailwind. |

---

## 📂 Estructura del Proyecto

```
royal-felt/
├── README.md                           # Documentación y guía de puesta en marcha
├── package.json                        # Definición de paquetes y scripts
├── tsconfig.json                       # Configuración de compilador y aliases (@/*)
├── tailwind.config.js                  # Paleta de tokens (felt, gold, surface)
├── postcss.config.js
├── public/                             # Archivos estáticos y audios
│   ├── assets/
│   │   ├── audio/                      # Efectos MP3/WebM (opcionales)
│   │   └── brand/                      # Isotipos y logotipos SVG
│   └── icons/                          # Iconos PWA y favicons
└── src/
    ├── app/                            # Next.js 14 App Router
    │   ├── layout.tsx                  # Shell raíz y configuración de fuentes
    │   ├── globals.css                 # Variables CSS :root y utilidades
    │   ├── page.tsx                    # Lobby y presentación de salones
    │   ├── poker/                      # Mesas de Texas Hold'em
    │   │   └── [tableId]/page.tsx
    │   └── blackjack/                  # Mesas de Blackjack VIP
    │       └── [tableId]/page.tsx
    ├── components/
    │   └── casino/                     # Componentes visuales de mesa
    │       ├── chip.tsx                # Fichas táctiles ($5, $25, $100, $500, $1k)
    │       ├── player-seat.tsx         # Asiento con temporizador circular SVG
    │       └── action-bar.tsx          # Panel inferior con slider y botones de apuesta
    ├── hooks/
    │   ├── use-chips-sound.ts          # Motor de sonido procedural y Howler
    │   └── use-poker-game.ts           # State machine y loop de Texas Hold'em
    ├── lib/
    │   ├── utils.ts                    # Función cn() y formatters
    │   ├── card-deck.ts                # Baraja Fisher-Yates y zapato de blackjack
    │   └── poker-evaluator.ts          # Evaluador combinatorio de manos
    └── types/
        ├── card.ts                     # Definición de naipes, palos y rangos
        ├── poker.ts                    # Modelos de mesa, asientos y fases
        └── blackjack.ts                # Estados de mano y crupier
```

---

## 🔐 Variables de Entorno

El proyecto opera con estado puramente frontend y almacenamiento en memoria/local storage para el modo de fichas de práctica, por lo que **no requiere variables de entorno obligatorias para arrancar**.

Si deseas configurar un puerto específico o habilitar análisis:
Crea un archivo `.env.local` en la raíz:
```bash
PORT=3000
NEXT_PUBLIC_APP_NAME="Royal Felt"
NEXT_PUBLIC_DEFAULT_CHIPS=5000
```

---

## 🏛 Arquitectura y Módulos Clave

### 1. `usePokerGame` (`src/hooks/use-poker-game.ts`)
Controla la partida completa sin depender de sockets externos para pruebas y juego local contra IA:
- Inicializa 1 jugador humano (`hero-user`) y 3 asientos ocupados por bots.
- Gestiona el cobro automático de ciegas (Small Blind: $5, Big Blind: $10).
- Despacha las fases comunitarias (`preflop` ➔ `flop` ➔ `turn` ➔ `river` ➔ `showdown`).
- Ejecuta una cuenta regresiva de 15 segundos con retirada automática (*auto-fold*) por inactividad.

### 2. `useChipsSound` (`src/hooks/use-chips-sound.ts`)
Evita latencias de descarga mediante **síntesis procedural con Web Audio API**:
- Emula osciladores sinusoidales y triangulares para choques cerámicos de fichas, toque de nudillos (*check knock*) y deslizamiento de cartas.
- Incluye fallback automático a archivos MP3/WebM mediante Howler si se colocan en `public/assets/audio/`.

### 3. Tokens y Paleta Oficial (`tailwind.config.js`)
- `surface`: `#10131a` (base oscura salón privé).
- `surface-container`: `#181c22` (tarjetas y bandejas).
- `felt-dark` / `felt-light`: `#0b3d2e` ➔ `#10b981` (gradiente radial de tapete esmeralda).
- `gold` / `gold-active`: `#d4a017` / `#e5a93c` (acentos metálicos de lujo).
- `fold` / `danger`: `#dc2626` (acciones críticas).
- `win` / `success`: `#4ede9b` (indicadores favorables).

---

## ♿ Directrices de Diseño y Accesibilidad (WCAG 2.2 AA)

1. **Objetivos Táctiles:** Todos los elementos interactivos primarios (`Chip`, `ActionBar`, botones de decisión) cuentan con dimensiones mínimas de **$44 \times 44\text{px}$** o **$48\text{px}$** de altura.
2. **Contraste de Color:** Relación de contraste superior a **4.5:1** en tipografías sobre superficies de fondo oscuro y sobre el paño de fieltro.
3. **Números Tabulares:** Los montos, fichas y temporizadores emplean la tipografía monoespaciada `JetBrains Mono` con `tabular-nums` para erradicar cualquier salto o desplazamiento visual durante los cambios de cifra.
4. **Retroalimentación No Visual:** Las acciones de juego clave cuentan con atributos `aria-label`, estados `aria-pressed` y respuestas sonoras táctiles para enriquecer la usabilidad.

---

## ⚖️ Licencia y Aviso Legal

Este proyecto es para fines exclusivamente didácticos, de demostración técnica y entretenimiento de práctica:
- **100% Moneda Ficticia:** No existe intercambio de dinero real, procesamiento de pagos con moneda fiduciaria ni mecanismos de retiro patrimonial.
- Todos los derechos de diseño e identidad pertenecen a **Royal Felt Studio**.
- Código publicado bajo licencia privada / no comercial.
```

---

## Bundle de Setup (Quickstart)

### `package.json` (verbatim del setup.sh)

```json
{
  "name": "royal-felt",
  "version": "1.0.0",
  "private": true,
  "description": "Salón Privé Digital de Póker Texas Hold'em & Blackjack VIP (100% Fichas Ficticias y Práctica)",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "lucide-react": "^0.417.0",
    "howler": "^2.2.4",
    "canvas-confetti": "^1.9.3",
    "framer-motion": "^11.3.19"
  },
  "devDependencies": {
    "@types/node": "^20.14.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/howler": "^2.2.11",
    "@types/canvas-confetti": "^1.9.0",
    "typescript": "^5.5.4",
    "tailwindcss": "^3.4.7",
    "postcss": "^8.4.40",
    "autoprefixer": "^10.4.19"
  }
}
```

### `setup.sh` (estructura de directorios + instalación)

```bash
mkdir -p src/app src/components/casino src/hooks src/lib src/types src/styles public/assets/brand public/assets/audio
npm install
npm run dev
```

### `package-zip.sh` (empaquetado)

```bash
zip -r royal-felt-starter-v1.0.0.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "*.DS_Store"
```

---

## Notas de Compatibilidad con la App Actual

| Elemento del README Stitch | App Actual (Hostinger) | Compatibilidad |
|---|---|---|
| Next.js 14 + React + TypeScript | HTML/CSS/JS vanilla | ❌ No compatible — stack diferente |
| `npm run dev` (puerto 3000) | Hostinger Node 18, sin build step | ❌ No aplica |
| `"type": "module"` implícito en Next.js | **PROHIBIDO** — causa 503 en Hostinger | ⚠️ Contradice restricción |
| `package.json` con dependencias Next.js | Repo actual no tiene `package.json` de build | ❌ No aplica |
| Estructura `src/app/`, `src/components/` | Archivos sueltos en raíz (`index.html`, `css/`, `js/`) | ❌ No aplica |
| Componentes `.tsx` (React) | Vanilla JS con template strings | ❌ No portable directo |
| `tailwind.config.js` | `css/styles.css` con variables CSS custom | ⚠️ Equivalente funcional, diferente mecanismo |
| Portal de Desarrollo | **ELIMINADO** por decisión del usuario (13-11-2026) | ❌ Anulado |

---

## Decisiones del Usuario Relacionadas

- **Portal de Desarrollo**: ELIMINADO (no construir).
- **Stack Next.js/React/TS**: Solo referencia; la app permanece en vanilla JS.
- **Blackjack**: 6-deck shoe, BJ 3:2, dealer stands on 17, DOBLAR only (sin split/insurance/surrender).
- **Apuestas**: Sin dinero real; 100% fichas ficticias.