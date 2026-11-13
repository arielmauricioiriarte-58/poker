# Royal Felt · `src/lib/poker-evaluator.ts` (Stitch DOCUMENT_2)

> **⚠️ REFERENCIA para una futura migración a Next.js/TS.** Este código NO compila ni se ejecuta en el repo actual (app estática HTML/CSS/JS vanilla en `js/engine/cards.js` y `js/engine/game.js`).
> Fuente: canvas Stitch DOCUMENT_2 (mensaje duplicado por el usuario; procesado una única vez). Compatibilidad declarada: TypeScript 5 estricto, `@/types/card` y `@/types/poker` (ver `royal-felt-types-reference.md`).

## Código fuente (verbatim)

```typescript
/**
 * Royal Felt · Evaluador de Manos de Texas Hold'em (7 Cartas -> Mejor Jugada de 5)
 * Ubicación: src/lib/poker-evaluator.ts
 */

import { Card, CardRank } from '@/types/card';
import { HandCategory, HandEvaluation } from '@/types/poker';

/**
 * Mapeo de valor numérico estándar de naipes para poker
 * (2 = 2, ..., 10 = 10, J = 11, Q = 12, K = 13, A = 14)
 */
const RANK_VALUES: Record<CardRank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

const RANK_NAMES_ES_PLURAL: Record<number, string> = {
  14: 'Ases',
  13: 'Reyes',
  12: 'Damas',
  11: 'Jotas',
  10: 'Dieces',
  9: 'Nueves',
  8: 'Ochos',
  7: 'Sietes',
  6: 'Seises',
  5: 'Cincos',
  4: 'Cuatros',
  3: 'Treses',
  2: 'Doses',
};

const RANK_NAMES_ES_SINGULAR: Record<number, string> = {
  14: 'As',
  13: 'Rey',
  12: 'Dama',
  11: 'Jota',
  10: 'Diez',
  9: 'Nueve',
  8: 'Ocho',
  7: 'Siete',
  6: 'Seis',
  5: 'Cinco',
  4: 'Cuatro',
  3: 'Tres',
  2: 'Dos',
};

/**
 * Ponderación base de cada categoría para calcular un puntaje absoluto inequívoco.
 * La fórmula de puntuación usa radix base 15 para kickers:
 * score = CATEGORY_WEIGHT + c0*15^4 + c1*15^3 + c2*15^2 + c3*15^1 + c4
 */
const CATEGORY_SCORES: Record<HandCategory, number> = {
  royal_flush: 9000000,
  straight_flush: 8000000,
  four_of_a_kind: 7000000,
  full_house: 6000000,
  flush: 5000000,
  straight: 4000000,
  three_of_a_kind: 3000000,
  two_pair: 2000000,
  one_pair: 1000000,
  high_card: 0,
};

/**
 * Genera todas las combinaciones posibles de longitud k de un array de elementos
 */
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [head, ...tail] = arr;
  const withHead = getCombinations(tail, k - 1).map((combo) => [head, ...combo]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}

/**
 * Evalúa exactamente 5 cartas y devuelve su categoría, puntuación comparativa y nombre pedagógico.
 */
function evaluateFiveCards(fiveCards: Card[]): HandEvaluation {
  // Ordenar cartas de mayor a menor según su valor de rango
  const sorted = [...fiveCards].sort(
    (a, b) => (b.numericValue ?? RANK_VALUES[b.rank]) - (a.numericValue ?? RANK_VALUES[a.rank])
  );

  const values = sorted.map((c) => c.numericValue ?? RANK_VALUES[c.rank]);
  const suits = sorted.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Detección de escalera estándar (ej. 14, 13, 12, 11, 10)
  let isStraight = false;
  let straightHigh = 0;

  if (
    values[0] - values[1] === 1 &&
    values[1] - values[2] === 1 &&
    values[2] - values[3] === 1 &&
    values[3] - values[4] === 1
  ) {
    isStraight = true;
    straightHigh = values[0];
  } else if (
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  ) {
    // Escalera baja con As (Wheel: A-2-3-4-5). El As cuenta como valor 1 (alto 5)
    isStraight = true;
    straightHigh = 5;
  }

  // Agrupamiento por rangos para detectar parejas, tríos, full y póker
  const countsMap = new Map<number, number>();
  for (const v of values) {
    countsMap.set(v, (countsMap.get(v) || 0) + 1);
  }

  // Ordenar grupos primero por frecuencia descendente, y luego por valor numérico descendente
  const groups = Array.from(countsMap.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  // 1. Escalera Real y Escalera de Color
  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return {
        category: 'royal_flush',
        nameEs: 'Escalera Real de Color',
        score: CATEGORY_SCORES.royal_flush,
        bestFiveCards: sorted,
      };
    }
    return {
      category: 'straight_flush',
      nameEs: `Escalera de Color al ${RANK_NAMES_ES_SINGULAR[straightHigh]}`,
      score: CATEGORY_SCORES.straight_flush + straightHigh,
      bestFiveCards: sorted,
    };
  }

  // 2. Póker (Cuarteto)
  if (groups[0][1] === 4) {
    const quadRank = groups[0][0];
    const kicker = groups[1][0];
    const score = CATEGORY_SCORES.four_of_a_kind + quadRank * 15 + kicker;
    return {
      category: 'four_of_a_kind',
      nameEs: `Póker de ${RANK_NAMES_ES_PLURAL[quadRank]}`,
      score,
      bestFiveCards: sorted,
    };
  }

  // 3. Full House
  if (groups[0][1] === 3 && groups[1][1] === 2) {
    const trioRank = groups[0][0];
    const pairRank = groups[1][0];
    const score = CATEGORY_SCORES.full_house + trioRank * 15 + pairRank;
    return {
      category: 'full_house',
      nameEs: `Full House de ${RANK_NAMES_ES_PLURAL[trioRank]} y ${RANK_NAMES_ES_PLURAL[pairRank]}`,
      score,
      bestFiveCards: sorted,
    };
  }

  // 4. Color (Flush)
  if (isFlush) {
    const score =
      CATEGORY_SCORES.flush +
      values[0] * Math.pow(15, 4) +
      values[1] * Math.pow(15, 3) +
      values[2] * Math.pow(15, 2) +
      values[3] * 15 +
      values[4];
    return {
      category: 'flush',
      nameEs: `Color al ${RANK_NAMES_ES_SINGULAR[values[0]]}`,
      score,
      bestFiveCards: sorted,
    };
  }

  // 5. Escalera (Straight)
  if (isStraight) {
    return {
      category: 'straight',
      nameEs: `Escalera al ${RANK_NAMES_ES_SINGULAR[straightHigh]}`,
      score: CATEGORY_SCORES.straight + straightHigh,
      bestFiveCards: sorted,
    };
  }

  // 6. Trío
  if (groups[0][1] === 3) {
    const trioRank = groups[0][0];
    const kickers = groups.slice(1).map((g) => g[0]);
    const score =
      CATEGORY_SCORES.three_of_a_kind +
      trioRank * Math.pow(15, 3) +
      kickers[0] * 15 +
      kickers[1];
    return {
      category: 'three_of_a_kind',
      nameEs: `Trío de ${RANK_NAMES_ES_PLURAL[trioRank]}`,
      score,
      bestFiveCards: sorted,
    };
  }

  // 7. Doble Pareja
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const highPair = Math.max(groups[0][0], groups[1][0]);
    const lowPair = Math.min(groups[0][0], groups[1][0]);
    const kicker = groups[2][0];
    const score =
      CATEGORY_SCORES.two_pair +
      highPair * Math.pow(15, 2) +
      lowPair * 15 +
      kicker;
    return {
      category: 'two_pair',
      nameEs: `Doble Pareja de ${RANK_NAMES_ES_PLURAL[highPair]} y ${RANK_NAMES_ES_PLURAL[lowPair]}`,
      score,
      bestFiveCards: sorted,
    };
  }

  // 8. Pareja (One Pair)
  if (groups[0][1] === 2) {
    const pairRank = groups[0][0];
    const kickers = groups.slice(1).map((g) => g[0]);
    const score =
      CATEGORY_SCORES.one_pair +
      pairRank * Math.pow(15, 3) +
      kickers[0] * Math.pow(15, 2) +
      kickers[1] * 15 +
      kickers[2];
    return {
      category: 'one_pair',
      nameEs: `Pareja de ${RANK_NAMES_ES_PLURAL[pairRank]}`,
      score,
      bestFiveCards: sorted,
    };
  }

  // 9. Carta Alta (High Card)
  const score =
    CATEGORY_SCORES.high_card +
    values[0] * Math.pow(15, 4) +
    values[1] * Math.pow(15, 3) +
    values[2] * Math.pow(15, 2) +
    values[3] * 15 +
    values[4];

  return {
    category: 'high_card',
    nameEs: `Carta Alta ${RANK_NAMES_ES_SINGULAR[values[0]]}`,
    score,
    bestFiveCards: sorted,
  };
}

/**
 * Evalúa cualquier conjunto de entre 5 y 7 cartas (típicamente 2 de mano + 3, 4 o 5 comunitarias).
 * Calcula exhaustivamente todas las combinaciones posibles de C(n, 5) y retorna la mejor mano.
 *
 * @param holeCards 2 cartas de mano del jugador
 * @param communityCards Cartas comunitarias activas (3 en flop, 4 en turn, 5 en river)
 * @returns La mejor evaluación de mano de 5 cartas
 */
export function evaluatePokerHand(
  holeCards: Card[],
  communityCards: Card[] = []
): HandEvaluation {
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length < 5) {
    if (allCards.length === 2 && allCards[0].rank === allCards[1].rank) {
      const rankVal = allCards[0].numericValue ?? RANK_VALUES[allCards[0].rank];
      return {
        category: 'one_pair',
        nameEs: `Pareja de mano de ${RANK_NAMES_ES_PLURAL[rankVal]}`,
        score: CATEGORY_SCORES.one_pair + rankVal * 15,
        bestFiveCards: allCards,
      };
    }

    const sorted = [...allCards].sort(
      (a, b) => (b.numericValue ?? RANK_VALUES[b.rank]) - (a.numericValue ?? RANK_VALUES[a.rank])
    );
    const highVal = sorted[0] ? (sorted[0].numericValue ?? RANK_VALUES[sorted[0].rank]) : 0;

    return {
      category: 'high_card',
      nameEs: highVal ? `Carta Alta ${RANK_NAMES_ES_SINGULAR[highVal]}` : 'Sin cartas suficientes',
      score: highVal,
      bestFiveCards: sorted,
    };
  }

  // Combinatoria C(7, 5) = 21 manos posibles
  const fiveCardCombos = getCombinations(allCards, 5);

  let bestEval: HandEvaluation | null = null;

  for (const combo of fiveCardCombos) {
    const currentEval = evaluateFiveCards(combo);
    if (!bestEval || currentEval.score > bestEval.score) {
      bestEval = currentEval;
    }
  }

  return bestEval!;
}

/**
 * Determina el/los ganadores entre múltiples jugadores al llegar al Showdown.
 * Soporta empates (Split Pot) cuando dos o más jugadores tienen exactamente el mismo score.
 */
export function determineShowdownWinners(
  players: { id: string; seatIndex: number; holeCards: [Card, Card] }[],
  communityCards: Card[]
): {
  winningPlayerIds: string[];
  bestEvaluation: HandEvaluation;
  playerEvaluations: Map<string, HandEvaluation>;
  isSplitPot: boolean;
} {
  const evaluations = new Map<string, HandEvaluation>();
  let highestScore = -1;
  let bestEval: HandEvaluation | null = null;
  const winners: string[] = [];

  for (const player of players) {
    const evaluation = evaluatePokerHand(player.holeCards, communityCards);
    evaluations.set(player.id, evaluation);

    if (evaluation.score > highestScore) {
      highestScore = evaluation.score;
      bestEval = evaluation;
      winners.length = 0;
      winners.push(player.id);
    } else if (evaluation.score === highestScore) {
      winners.push(player.id);
    }
  }

  return {
    winningPlayerIds: winners,
    bestEvaluation: bestEval!,
    playerEvaluations: evaluations,
    isSplitPot: winners.length > 1,
  };
}
```

## Fortalezas declaradas (verbatim)

- **Resolución de Kickers sin Ambigüedades:** sistema ponderado en base 15 (radix 15) para que empates en parejas o cartas altas se desempaten rigurosamente por los kickers ordenados.
- **Escalera Mínima ("Wheel" A-2-3-4-5):** detecta correctamente el As como carta alta (14) o en la escalera baja (1), con valor máximo de la escalera = 5.
- **Nombres Pedagógicos en Español:** propiedad `nameEs` para la etiqueta inferior del tapete móvil ("Doble Pareja de Ases y Reyes", "Color al As").
- **Soporte de Botes Compartidos (Split Pot):** `determineShowdownWinners` devuelve array `winningPlayerIds` con soporte nativo de empates.

## Comparación con el motor actual (`js/engine/cards.js` + `js/engine/game.js`)

| Aspecto | DOCUMENT_2 (`poker-evaluator.ts`) | App actual | Veredicto |
|---|---|---|---|
| Alcance de variantes | Solo Texas Hold'em | Hold'em, **Omaha** (2 mano + 3 mesa), **Short Deck** (orden invertido color>full, trío>escalera), **Draw**, **Stud** + `evaluate(cfg,…)` parametrizado | Nuestro motor es estrictamente más amplio; este módulo NO puede reemplazarlo sin reintroducir Omaha/Short Deck |
| Scoring por categoría | `CATEGORY_SCORES` explícitas (0…9 000 000) | `ORD[cat] × 1e7 + k` con `ORD` y `ORD_S` (Short Deck) | Equivalente; el nuestro es más compacto y paramétrico |
| Kickers (base 15) | Sí | Sí (`reduce((a,v)=>a*15+v,0)`) | Equivalente |
| Wheel A-2-3-4-5 | Sí (y A-6-7-8-9 en "low" rodadas vírgenes no aplica) | Sí (detecta `A,5,4,3,2`; en Short Deck `A,9,8,7,6`) | Equivalente |
| Nombres en español | **Con kickers** ("Doble Pareja de Ases y Reyes") | Genéricos de categoría (`NAMES[]`, ej. "Doble pareja") | **Mejora candidata:** portar `nameEs` enriquecidos a la UI (pendiente de aprobación) |
| Empates / split pot | `winningPlayerIds[]` + `isSplitPot` | Implementado en `game.js` ("Showdown con botes laterales; el resto impar va al primer ganador") con reparto `Math.floor(pot/n)` | Ambos lo soportan; el nuestro además maneja resto impar y botes laterales |
| Botes laterales (side pots) | No modelados por `determineShowdownWinners` | Sí (botes laterales + all-in) | Nuestro motor gana |
| Combinatoria | `C(n,5)` recursivo con `getCombinations` | Idéntico (`combos` + `evaluate` con C(n,5)) | Equivalente |
| Tipos | TypeScript estricto + `HandEvaluation` | `HandEvaluation` implícita (`{cat, score, name, cards}`) | Sustituible por tipos solo si se migra de stack |
| `partial()` / `pScore()` ( Stud, cartas visibles parciales) | No existe | Sí (`partial`, `pScore` para mano Stud / Draw incompleta) | Extensiones propias sin cobertura en el doc |

## Conclusión honesta

El documento es una referencia de máxima calidad para la huella pedagógica (`nameEs` con kickers) y para una migración a Next.js/TS, pero **no debe sustituir el evaluador actual**: perdería Omaha, Short Deck, Draw, Stud y la gestión de botes laterales/resto impar. El aprovechamiento inmediato y seguro para la app estática sería **portar los nombres pedagógicos enriquecidos a la UI** (p. ej. mostrar "Doble Pareja de Ases y Reyes" en la etiqueta de mano), algo compatible con `lib.engine/cards.js` sin reescribir el core. Pendiente de decisión del usuario.
