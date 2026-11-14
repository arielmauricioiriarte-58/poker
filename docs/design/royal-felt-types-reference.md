# Royal Felt · Tipos TypeScript y claves técnicas del motor (Stitch DOCUMENT_2)

> **⚠️ REFERENCIA, no arquitectura actual.** La app real es **JavaScript vanilla** (`js/engine/cards.js`, `js/engine/blackjack.js`, `js/engine/game.js`) sin TypeScript ni Next.js. Este documento conserva verbatim las definiciones de Stitch para trazabilidad del DESIGN SYSTEM y como base si algún día se migra de stack.
> Compatibilidad declarada por Stitch: TypeScript 5.x estricto (`strict: true`).

---

## 1. `src/types/card.ts` (verbatim)

```typescript
/**
 * Royal Felt · Modelado de Naipes y Baraja Estándar (52 Cartas)
 */

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type CardRank =
  | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  /** Identificador único del naipe, ej. "spades-A" o "hearts-10" */
  id: string;
  /** Palo de la baraja francesa */
  suit: Suit;
  /** Rango visual de la carta */
  rank: CardRank;
  /** Valor numérico base para ordenamiento (2 = 2 ... A = 14) */
  numericValue: number;
  /** Estado de visibilidad en la mesa (boca arriba o cubierta) */
  faceUp?: boolean;
}

/**
 * Metadatos y utilidades de renderizado para componentes de carta
 */
export interface CardStyleMeta {
  color: '#0f172a' | '#dc2626'; // Palos negros vs rojos carmesí
  symbol: '♠' | '♥' | '♦' | '♣';
  label: string;
}

export const SUIT_META: Record<Suit, CardStyleMeta> = {
  spades: { color: '#0f172a', symbol: '♠', label: 'Picas' },
  clubs: { color: '#0f172a', symbol: '♣', label: 'Tréboles' },
  hearts: { color: '#dc2626', symbol: '♥', label: 'Corazones' },
  diamonds: { color: '#dc2626', symbol: '♦', label: 'Diamantes' },
};
```

---

## 2. `src/types/poker.ts` (verbatim)

```typescript
/**
 * Royal Felt · Modelado de Texas Hold'em No-Limit 6-Max
 */
import { Card } from './card';

export type GamePhase =
  | 'waiting'        // Esperando jugadores para iniciar mano
  | 'preflop'        // Cartas privadas repartidas, ciegas colocadas
  | 'flop'           // Primeras 3 cartas comunitarias
  | 'turn'           // Cuarta carta comunitaria
  | 'river'          // Quinta carta comunitaria
  | 'showdown'       // Revelación de manos y reparto de bote
  | 'hand_ended';    // Conclusión y pausa breve entre manos

export type PlayerActionType =
  | 'fold'           // Retirarse
  | 'check'          // Pasar (cuando no hay apuesta que igualar)
  | 'call'           // Igualar apuesta activa
  | 'bet'            // Abrir apuesta
  | 'raise'          // Resubir apuesta previa
  | 'all_in';        // Apostar el total del stack

export type PlayerStatus =
  | 'active'         // En juego, turno pendiente
  | 'folded'         // Retirado de la mano en curso
  | 'all_in'         // Sin fichas restantes, compite por botes elegibles
  | 'sitting_out';   // Ausente temporalmente de la mesa

export type HandCategory =
  | 'high_card'           // Carta Alta
  | 'one_pair'            // Pareja
  | 'two_pair'            // Doble Pareja
  | 'three_of_a_kind'     // Trío
  | 'straight'            // Escalera
  | 'flush'               // Color
  | 'full_house'          // Full House
  | 'four_of_a_kind'      // Póker (Cuarteto)
  | 'straight_flush'      // Escalera de Color
  | 'royal_flush';        // Escalera Real

export interface HandEvaluation {
  category: HandCategory;
  nameEs: string;         // Nombre legible en español (ej. "Doble Pareja de Ases y Reyes")
  score: number;          // Puntuación absoluta para comparar manos en Showdown
  bestFiveCards: Card[];  // Las 5 mejores cartas que forman la jugada
}

export interface PlayerSeat {
  seatIndex: number;      // Posición física en el tapete (0 a 5 en mesa 6-Max)
  playerId: string;
  name: string;
  avatarUrl?: string;
  stack: number;          // Fichas ficticias totales en el asiento
  currentBet: number;     // Fichas apostadas en la ronda actual
  cards: [Card, Card] | null; // Cartas de mano (cubiertas o visibles para el usuario)
  status: PlayerStatus;
  isDealer: boolean;      // Posee el botón de Dealer (D)
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isCurrentTurn: boolean; // Acción activa
  timeRemaining: number;  // Segundos restantes en el temporizador
}

export interface Pot {
  amount: number;         // Monto del pozo principal
  eligiblePlayerIds: string[];
}

export interface TableConfig {
  tableId: string;
  name: string;           // Ej: "Salón Privé · Hold'em $5/$10"
  maxSeats: 6;            // Formato 6-Max
  smallBlind: number;     // Ej. $5
  bigBlind: number;       // Ej. $10
  minBuyIn: number;       // Ej. $500 (50 BB)
  maxBuyIn: number;       // Ej. $2,000 (200 BB)
  turnDurationSec: number;// Ej. 15s
}

export interface PokerGameState {
  config: TableConfig;
  phase: GamePhase;
  handNumber: number;
  communityCards: Card[]; // Flop (3) + Turn (1) + River (1) = máx 5
  mainPot: number;
  sidePots: Pot[];        // Botes paralelos en situaciones de All-In
  currentMinBet: number;  // Apuesta mínima válida para la siguiente acción
  lastRaiseAmount: number;// Tamaño de la última subida
  activeSeatTurn: number | null; // Asiento con acción en curso
  seats: (PlayerSeat | null)[];  // Asientos del 0 al 5
  winners?: {
    playerId: string;
    seatIndex: number;
    amountWon: number;
    handEvaluation?: HandEvaluation;
  }[];
}
```

---

## 3. Blackjack VIP · aspectos arquitectónicos (verbatim)

- **Soporte Nativo de Manos Divididas (split):** en lugar de modelar al jugador con una única mano, `BlackjackGameState` mantiene un array `playerHands: PlayerHand[]` y un puntero `activeHandIndex` para alternar fluidamente el foco táctil cuando el usuario divide pares.
- **Cómputo Hard vs. Soft (`HandScore`):** modela si el As cuenta como 11 o como 1 y genera la etiqueta textual pedagógica para la UI móvil ("Soft 17" frente a "17 duro").
- **Reglas Configurables de Salón Privé (`BlackjackTableRules`):** permite fijar reglas estándar de casino europeo o americano (S17 vs H17, ratio 3:2, Late Surrender y DAS).
- **Respeto a Cartas Ocultas (`faceUp`):** la función auxiliar `calculateHandScore` respeta `faceUp === false` en la segunda carta del crupier para evitar filtrar el total real antes de la fase `dealer_turn`.

---

## 4. Motor de cartas · aspectos técnicos destacados (verbatim)

- **Aleatoriedad Criptográfica (`getSecureRandomInt`):** utiliza `crypto.getRandomValues` para el barajado Fisher-Yates, eliminando el sesgo de módulo (*modulo bias*) de algoritmos pseudoaleatorios estándar. Si se ejecuta en entornos donde no esté disponible, hace un fallback seguro a `Math.random()`.
- **Identificadores Únicos en Zapatos Multibaraja:** al generar las 312 cartas (zapato de 6 barajas) o 416 cartas (8 barajas), cada carta recibe un ID único (`${suit}-${rank}-${deckIndex}`), lo que previene colisiones de key en listas React/DOM al animar naipes en el paño.
- **Reglas de Casino Reales (Carta de Corte y Quemadas):** incorpora la lógica de la tarjeta de corte (`cutCardIndex`) para avisar a la UI cuando es momento de volver a barajar (`needsReshuffle`), además de soporte para quemar cartas (`burnCard()`) previo al Flop, Turn y River.

---

## 5. Equivalencia con la app actual (`js/engine/`)

| Concepto del doc | App actual | Nota |
|---|---|---|
| `Card { id, suit, rank, numericValue, faceUp }` | `{ r: 2..14, s: 's'\|'h'\|'d'\|'c' }` | `r` ≡ `numericValue`; `s` ≡ `suit`; `label(r)` da J/Q/K/A; render usa `assets/cards/{R}{S}.svg` y `back.svg` para la hole card del crupier |
| `SUIT_META` colores `#0f172a` / `#dc2626` | SVG de naipes (marfil + palo) | Los SVG ya traen sus palos; el mapeo de color vive en `assets/cards/*.svg` |
| `HandCategory` + `nameEs` | `NAMES[]` en español + `eval5()` | 9 categorías iguales; **Short Deck** invierte orden (color > full, trío > escalera) — extensión propia, no cubierta por el doc |
| `GamePhase` | `phase` en `js/engine/game.js` y `js/views.js` | Mismo ciclo waiting→preflop→flop→turn→river→showdown→hand_ended |
| `Pot` / `sidePots` | bote principal `pot` + lógica de empatías | Side pots no modelados por separado (6-max practice, sin all-in profundos) |
| `handValue()` Hard/Soft | `handValue()` en `blackjack.js` | As 11→1 ya implementado; **falta** la etiqueta textual "Soft 17 / 17 duro" en UI |
| `BlackjackTableRules` (S17/H17, 3:2, DAS, surrender) | Reglas fijas: S17, BJ 3:2, DOBLAR (1 carta y se planta), **sin** split/insurance/surrender | Decisión de producto vigente; el tipo del doc contempla split, la app NO lo implementa |
| `faceUp` en hole card | `back.svg` + total del crupier oculto hasta revelar | Equivalente visual; el motor no expone el total hasta `dealer_turn` |
| `getSecureRandomInt` (crypto) | `shuffle()` usa `Math.random()` | **Recomendación factible:** migrar a `crypto.getRandomValues` con fallback; sin dependencias, bajo riesgo (pendiente de aprobación) |
| IDs únicos `${suit}-${rank}-${deckIndex}` | carta = objeto por posición en el array | No hace falta en DOM vanilla (sin React keys); aplicar solo si se migra a React |
| `cutCardIndex` / `burnCard()` | No implementados | Opcionales para sensación de casino real; pendiente de aprobación |

## 6. Decisiones vigentes

- **Portal de Desarrollo:** eliminado (no se implementa).
- **Blackjack:** sin split, seguro ni rendición (reglas fijas del Salón Privé).
- **Stack:** se mantiene HTML/CSS/JS vanilla + Node 18 CommonJS en Hostinger (un rewrite Next.js/TS queda fuera de scope salvo decisión expresa).
