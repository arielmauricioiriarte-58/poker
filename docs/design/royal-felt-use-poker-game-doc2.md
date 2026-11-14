# Royal Felt · Hook usePokerGame (Stitch DOCUMENT_2)

> **⚠️ REFERENCIA, no código de producción.** Hook React (`useState`/`useEffect`/`useRef`/`useMemo`/`useCallback`). La app actual es **JS vanilla**: motor en `js/engine/game.js` + `js/ai.js` + `js/ui.js` (smoke test 5 variantes × 3 manos OK). Este doc conserva verbatim el hook y extrae la lógica pura para comparar con el motor actual.

## `src/hooks/use-poker-game.ts` (verbatim desde `three.js_4/code.html`)

```typescript
/**
 * Royal Felt · Hook de Control de Ciclo de Juego (Game Loop Engine)
 * Ubicación: src/hooks/use-poker-game.ts
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, Suit, CardRank } from '@/types/card';
import {
  PokerGameState,
  PlayerSeat,
  GamePhase,
  TableConfig,
  HandEvaluation,
  PlayerStatus,
  PlayerActionType,
} from '@/types/poker';
import { evaluatePokerHand, determineShowdownWinners } from '@/lib/poker-evaluator';
import { useChipsSound } from '@/hooks/use-chips-sound';

export const DEFAULT_TABLE_CONFIG: TableConfig = {
  tableId: 'table-salon-prive-1',
  name: "Salón Privé · Hold'em $5/$10",
  maxSeats: 6,
  smallBlind: 5,
  bigBlind: 10,
  minBuyIn: 500,
  maxBuyIn: 2000,
  turnDurationSec: 15,
};

function createFreshDeck(): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const rankValues: Record<CardRank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        numericValue: rankValues[rank],
        faceUp: false,
      });
    }
  }

  // Barajado Fisher-Yates — USA Math.random() (ver flag honesto abajo)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function createInitialSeats(heroInitialStack = 2850): (PlayerSeat | null)[] {
  return [
    {
      seatIndex: 0,
      playerId: 'hero-user',
      name: 'Alejandro VIP',
      stack: heroInitialStack,
      currentBet: 0,
      cards: null,
      status: 'active',
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
      isCurrentTurn: false,
      timeRemaining: 15,
    },
    {
      seatIndex: 1,
      playerId: 'bot-1',
      name: 'LordSterling',
      stack: 3400,
      currentBet: 0,
      cards: null,
      status: 'active',
      isDealer: true,
      isSmallBlind: false,
      isBigBlind: false,
      isCurrentTurn: false,
      timeRemaining: 15,
    },
    {
      seatIndex: 2,
      playerId: 'bot-2',
      name: 'LadyElena',
      stack: 1950,
      currentBet: 0,
      cards: null,
      status: 'active',
      isDealer: false,
      isSmallBlind: true,
      isBigBlind: false,
      isCurrentTurn: false,
      timeRemaining: 15,
    },
    {
      seatIndex: 3,
      playerId: 'bot-3',
      name: 'BaronG',
      stack: 2600,
      currentBet: 0,
      cards: null,
      status: 'active',
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: true,
      isCurrentTurn: false,
      timeRemaining: 15,
    },
    null, // Asiento 4 libre
    null, // Asiento 5 libre
  ];
}

export function usePokerGame(customConfig?: Partial<TableConfig>) {
  const config = useMemo(() => ({ ...DEFAULT_TABLE_CONFIG, ...customConfig }), [customConfig]);

  const {
    playChipSelect,
    playChipBet,
    playChipStack,
    playAllIn,
    playCardDeal,
    playCardFlip,
    playCheckKnock,
    playFold,
    playWinCelebration,
  } = useChipsSound();

  const [gameState, setGameState] = useState<PokerGameState>({
    config,
    phase: 'waiting',
    handNumber: 1,
    communityCards: [],
    mainPot: 0,
    sidePots: [],
    currentMinBet: config.bigBlind,
    lastRaiseAmount: config.bigBlind,
    activeSeatTurn: null,
    seats: createInitialSeats(),
    winners: [],
  });

  const [heroHandEvaluation, setHeroHandEvaluation] = useState<HandEvaluation | null>(null);

  const deckRef = useRef<Card[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const heroSeat = useMemo(() => {
    return gameState.seats.find((s) => s?.playerId === 'hero-user') || null;
  }, [gameState.seats]);

  const isHeroTurn = useMemo(() => {
    if (!heroSeat || gameState.activeSeatTurn === null) return false;
    return gameState.activeSeatTurn === heroSeat.seatIndex;
  }, [heroSeat, gameState.activeSeatTurn]);

  const callAmount = useMemo(() => {
    if (!heroSeat) return 0;
    return Math.max(0, gameState.currentMinBet - heroSeat.currentBet);
  }, [heroSeat, gameState.currentMinBet]);

  const canCheck = callAmount === 0;

  useEffect(() => {
    if (heroSeat?.cards && heroSeat.cards.length === 2) {
      const evaluation = evaluatePokerHand(heroSeat.cards, gameState.communityCards);
      setHeroHandEvaluation(evaluation);
    } else {
      setHeroHandEvaluation(null);
    }
  }, [heroSeat?.cards, gameState.communityCards]);

  const startNewHand = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);

    const deck = createFreshDeck();
    deckRef.current = deck;

    setGameState((prev) => {
      const activeSeats = prev.seats.map((seat) => {
        if (!seat) return null;
        if (seat.stack <= 0) {
          seat.stack = config.minBuyIn;
        }
        return {
          ...seat,
          currentBet: 0,
          cards: null as [Card, Card] | null,
          status: 'active' as PlayerStatus,
          isCurrentTurn: false,
          timeRemaining: config.turnDurationSec,
        };
      });

      const seatedIndexes = activeSeats
        .map((s, idx) => (s ? idx : -1))
        .filter((idx) => idx !== -1);

      if (seatedIndexes.length < 2) return prev;

      const currentDealerIdx = activeSeats.findIndex((s) => s?.isDealer);
      const nextDealerPos =
        currentDealerIdx === -1
          ? 0
          : (seatedIndexes.indexOf(currentDealerIdx) + 1) % seatedIndexes.length;
      const dealerSeatIndex = seatedIndexes[nextDealerPos];

      const sbPos = (nextDealerPos + 1) % seatedIndexes.length;
      const bbPos = (nextDealerPos + 2) % seatedIndexes.length;
      const sbSeatIndex = seatedIndexes[sbPos];
      const bbSeatIndex = seatedIndexes[bbPos];

      const utgPos = (bbPos + 1) % seatedIndexes.length;
      const utgSeatIndex = seatedIndexes[utgPos];

      let potAccumulator = 0;
      activeSeats.forEach((seat) => {
        if (!seat) return;
        seat.isDealer = seat.seatIndex === dealerSeatIndex;
        seat.isSmallBlind = seat.seatIndex === sbSeatIndex;
        seat.isBigBlind = seat.seatIndex === bbSeatIndex;

        if (seat.isSmallBlind) {
          const sbAmount = Math.min(seat.stack, config.smallBlind);
          seat.stack -= sbAmount;
          seat.currentBet = sbAmount;
          potAccumulator += sbAmount;
        } else if (seat.isBigBlind) {
          const bbAmount = Math.min(seat.stack, config.bigBlind);
          seat.stack -= bbAmount;
          seat.currentBet = bbAmount;
          potAccumulator += bbAmount;
        }

        const c1 = deck.pop()!;
        const c2 = deck.pop()!;
        if (seat.playerId === 'hero-user') {
          c1.faceUp = true;
          c2.faceUp = true;
        }
        seat.cards = [c1, c2];
      });

      playCardDeal();

      if (activeSeats[utgSeatIndex]) {
        activeSeats[utgSeatIndex]!.isCurrentTurn = true;
      }

      return {
        ...prev,
        phase: 'preflop',
        handNumber: prev.handNumber + 1,
        communityCards: [],
        mainPot: potAccumulator,
        sidePots: [],
        currentMinBet: config.bigBlind,
        lastRaiseAmount: config.bigBlind,
        activeSeatTurn: utgSeatIndex,
        seats: activeSeats,
        winners: [],
      };
    });
  }, [config, playCardDeal]);

  const advanceToNextPhase = useCallback(() => {
    setGameState((prev) => {
      const deck = deckRef.current;
      let nextPhase: GamePhase = 'flop';
      const newCommunity = [...prev.communityCards];

      if (prev.phase === 'preflop') {
        nextPhase = 'flop';
        deck.pop(); // Burn card
        const f1 = deck.pop()!; f1.faceUp = true;
        const f2 = deck.pop()!; f2.faceUp = true;
        const f3 = deck.pop()!; f3.faceUp = true;
        newCommunity.push(f1, f2, f3);
        playCardFlip();
      } else if (prev.phase === 'flop') {
        nextPhase = 'turn';
        deck.pop(); // Burn card
        const turnCard = deck.pop()!; turnCard.faceUp = true;
        newCommunity.push(turnCard);
        playCardFlip();
      } else if (prev.phase === 'turn') {
        nextPhase = 'river';
        deck.pop(); // Burn card
        const riverCard = deck.pop()!; riverCard.faceUp = true;
        newCommunity.push(riverCard);
        playCardFlip();
      } else if (prev.phase === 'river') {
        nextPhase = 'showdown';
      }

      const updatedSeats = prev.seats.map((seat) => {
        if (!seat) return null;
        return {
          ...seat,
          currentBet: 0,
          isCurrentTurn: false,
          timeRemaining: config.turnDurationSec,
        };
      });

      if (nextPhase === 'showdown') {
        const eligiblePlayers = updatedSeats
          .filter((s): s is PlayerSeat => s !== null && s.status !== 'folded' && s.cards !== null)
          .map((s) => ({
            id: s.playerId,
            seatIndex: s.seatIndex,
            holeCards: s.cards!,
          }));

        const result = determineShowdownWinners(eligiblePlayers, newCommunity);
        const splitCount = result.winningPlayerIds.length || 1;
        const prizePerWinner = Math.floor(prev.mainPot / splitCount);

        updatedSeats.forEach((seat) => {
          if (!seat || !seat.cards) return;
          seat.cards[0].faceUp = true;
          seat.cards[1].faceUp = true;
          if (result.winningPlayerIds.includes(seat.playerId)) {
            seat.stack += prizePerWinner;
          }
        });

        playWinCelebration();

        return {
          ...prev,
          phase: 'showdown',
          communityCards: newCommunity,
          activeSeatTurn: null,
          seats: updatedSeats,
          winners: result.winningPlayerIds.map((id) => {
            const seat = updatedSeats.find((s) => s?.playerId === id);
            return {
              playerId: id,
              seatIndex: seat?.seatIndex ?? 0,
              amountWon: prizePerWinner,
              handEvaluation: result.bestEvaluation,
            };
          }),
        };
      }

      const activeIndexes = updatedSeats
        .map((s, idx) => (s && s.status === 'active' ? idx : -1))
        .filter((idx) => idx !== -1);

      const firstTurnIdx = activeIndexes.length > 0 ? activeIndexes[0] : null;
      if (firstTurnIdx !== null && updatedSeats[firstTurnIdx]) {
        updatedSeats[firstTurnIdx]!.isCurrentTurn = true;
      }

      return {
        ...prev,
        phase: nextPhase,
        communityCards: newCommunity,
        currentMinBet: 0,
        lastRaiseAmount: config.bigBlind,
        activeSeatTurn: firstTurnIdx,
        seats: updatedSeats,
      };
    });
  }, [config.bigBlind, config.turnDurationSec, playCardFlip, playWinCelebration]);

  const passTurn = useCallback(() => {
    setGameState((prev) => {
      const activeSeats = prev.seats.filter(
        (s): s is PlayerSeat => s !== null && s.status === 'active'
      );

      const nonFoldedSeats = prev.seats.filter(
        (s): s is PlayerSeat => s !== null && s.status !== 'folded'
      );

      if (nonFoldedSeats.length === 1) {
        const winner = nonFoldedSeats[0];
        winner.stack += prev.mainPot;
        playWinCelebration();

        return {
          ...prev,
          phase: 'hand_ended',
          activeSeatTurn: null,
          winners: [
            {
              playerId: winner.playerId,
              seatIndex: winner.seatIndex,
              amountWon: prev.mainPot,
            },
          ],
        };
      }

      const maxBet = Math.max(...prev.seats.map((s) => s?.currentBet || 0));
      const allMatched = activeSeats.every((s) => s.currentBet === maxBet);

      if (allMatched && activeSeats.length > 0) {
        setTimeout(() => advanceToNextPhase(), 600);
        return {
          ...prev,
          activeSeatTurn: null,
        };
      }

      const seatedIndexes = prev.seats
        .map((s, idx) => (s && s.status === 'active' ? idx : -1))
        .filter((idx) => idx !== -1);

      if (seatedIndexes.length === 0) {
        setTimeout(() => advanceToNextPhase(), 600);
        return prev;
      }

      const currentPos = prev.activeSeatTurn !== null ? seatedIndexes.indexOf(prev.activeSeatTurn) : -1;
      const nextPos = (currentPos + 1) % seatedIndexes.length;
      const nextSeatIndex = seatedIndexes[nextPos];

      const newSeats = prev.seats.map((seat) => {
        if (!seat) return null;
        return {
          ...seat,
          isCurrentTurn: seat.seatIndex === nextSeatIndex,
          timeRemaining: config.turnDurationSec,
        };
      });

      return {
        ...prev,
        activeSeatTurn: nextSeatIndex,
        seats: newSeats,
      };
    });
  }, [advanceToNextPhase, config.turnDurationSec, playWinCelebration]);

  const handlePlayerAction = useCallback(
    (action: PlayerActionType, amount?: number) => {
      setGameState((prev) => {
        if (prev.activeSeatTurn === null) return prev;
        const currentSeat = prev.seats[prev.activeSeatTurn];
        if (!currentSeat) return prev;

        const updatedSeats = [...prev.seats];
        let newPot = prev.mainPot;
        let newMinBet = prev.currentMinBet;
        let newLastRaise = prev.lastRaiseAmount;

        switch (action) {
          case 'fold': {
            playFold();
            updatedSeats[prev.activeSeatTurn] = {
              ...currentSeat,
              status: 'folded',
              isCurrentTurn: false,
            };
            break;
          }

          case 'check': {
            playCheckKnock();
            updatedSeats[prev.activeSeatTurn] = {
              ...currentSeat,
              isCurrentTurn: false,
            };
            break;
          }

          case 'call': {
            const toCall = Math.min(currentSeat.stack, prev.currentMinBet - currentSeat.currentBet);
            newPot += toCall;
            playChipBet();
            const newStack = currentSeat.stack - toCall;
            updatedSeats[prev.activeSeatTurn] = {
              ...currentSeat,
              stack: newStack,
              currentBet: currentSeat.currentBet + toCall,
              status: newStack === 0 ? 'all_in' : 'active',
              isCurrentTurn: false,
            };
            break;
          }

          case 'bet':
          case 'raise': {
            const targetTotal = amount || prev.currentMinBet * 2;
            const added = Math.min(currentSeat.stack, targetTotal - currentSeat.currentBet);
            newPot += added;
            const newStack = currentSeat.stack - added;
            const isAllIn = newStack === 0;

            if (isAllIn) {
              playAllIn();
            } else {
              playChipStack();
            }

            newLastRaise = targetTotal - prev.currentMinBet;
            newMinBet = currentSeat.currentBet + added;

            updatedSeats[prev.activeSeatTurn] = {
              ...currentSeat,
              stack: newStack,
              currentBet: currentSeat.currentBet + added,
              status: isAllIn ? 'all_in' : 'active',
              isCurrentTurn: false,
            };
            break;
          }

          case 'all_in': {
            const allInAmount = currentSeat.stack;
            newPot += allInAmount;
            playAllIn();
            const totalBet = currentSeat.currentBet + allInAmount;
            if (totalBet > newMinBet) {
              newLastRaise = totalBet - newMinBet;
              newMinBet = totalBet;
            }

            updatedSeats[prev.activeSeatTurn] = {
              ...currentSeat,
              stack: 0,
              currentBet: totalBet,
              status: 'all_in',
              isCurrentTurn: false,
            };
            break;
          }
        }

        return {
          ...prev,
          mainPot: newPot,
          currentMinBet: newMinBet,
          lastRaiseAmount: newLastRaise,
          seats: updatedSeats,
        };
      });

      setTimeout(() => passTurn(), 300);
    },
    [passTurn, playAllIn, playCheckKnock, playChipBet, playChipStack, playFold]
  );

  useEffect(() => {
    if (gameState.activeSeatTurn === null || gameState.phase === 'waiting' || gameState.phase === 'showdown') {
      return;
    }

    const currentSeat = gameState.seats[gameState.activeSeatTurn];
    if (!currentSeat || currentSeat.playerId === 'hero-user') {
      return;
    }

    const thinkingTime = 1200 + Math.random() * 1000;

    botTimeoutRef.current = setTimeout(() => {
      const neededToCall = Math.max(0, gameState.currentMinBet - currentSeat.currentBet);

      if (neededToCall === 0) {
        const rand = Math.random();
        if (rand < 0.65) {
          handlePlayerAction('check');
        } else {
          const betVal = Math.min(currentSeat.stack, gameState.config.bigBlind * 2);
          handlePlayerAction('bet', betVal);
        }
      } else {
        const isBigCall = neededToCall > currentSeat.stack * 0.4;
        const foldChance = isBigCall ? 0.6 : 0.25;

        if (Math.random() < foldChance) {
          handlePlayerAction('fold');
        } else {
          handlePlayerAction('call');
        }
      }
    }, thinkingTime);

    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, [gameState.activeSeatTurn, gameState.phase, gameState.currentMinBet, gameState.seats, handlePlayerAction]);

  useEffect(() => {
    if (gameState.activeSeatTurn === null || gameState.phase === 'waiting' || gameState.phase === 'showdown') {
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.activeSeatTurn === null) return prev;
        const currentSeat = prev.seats[prev.activeSeatTurn];
        if (!currentSeat) return prev;

        if (currentSeat.timeRemaining <= 1) {
          const canAutoCheck = currentSeat.currentBet === prev.currentMinBet;
          setTimeout(() => handlePlayerAction(canAutoCheck ? 'check' : 'fold'), 100);
          return prev;
        }

        const newSeats = [...prev.seats];
        newSeats[prev.activeSeatTurn] = {
          ...currentSeat,
          timeRemaining: currentSeat.timeRemaining - 1,
        };

        return {
          ...prev,
          seats: newSeats,
        };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.activeSeatTurn, gameState.phase, handlePlayerAction]);

  const onFold = useCallback(() => handlePlayerAction('fold'), [handlePlayerAction]);
  const onCheck = useCallback(() => handlePlayerAction('check'), [handlePlayerAction]);
  const onCall = useCallback(() => handlePlayerAction('call'), [handlePlayerAction]);
  const onBetRaise = useCallback((amount: number) => handlePlayerAction('raise', amount), [handlePlayerAction]);
  const onAllIn = useCallback(() => handlePlayerAction('all_in'), [handlePlayerAction]);

  return {
    gameState,
    heroSeat,
    isHeroTurn,
    callAmount,
    canCheck,
    heroHandEvaluation,
    startNewHand,
    handlePlayerAction,
    onFold,
    onCheck,
    onCall,
    onBetRaise,
    onAllIn,
  };
}
```

---

## Extracción de Lógica Pura (Portable a Vanilla JS)

| Concepto | Implementación en el Hook | Estado en App Actual (`js/engine/game.js` + `js/ai.js`) |
|---|---|---|
| **Configuración por defecto** | `DEFAULT_TABLE_CONFIG` (SB $5, BB $10, 15s, 6-max) | ✅ Parámetros equivalentes en `js/engine/game.js` |
| **Barajado Fisher-Yates** | `createFreshDeck()` usa `Math.random()` | ⚠️ **Flag honesto**: usa `Math.random()` pese a que Stitch recomienda `crypto.getRandomValues()`; app actual también usa `Math.random()` en `cards.js:shuffle()` |
| **Ciegas + Dealer rotation** | `startNewHand()` rota dealer → SB/BB → UTG | ✅ Motor actual ya rota dealer y cobra ciegas (smoke test confirma) |
| **Cartas quemadas (Burn)** | `deck.pop()` antes de Flop/Turn/River | ❌ App actual **no quema cartas** — reparte directo |
| **Fases comunitarias** | `advanceToNextPhase()` preflop→flop→turn→river→showdown | ✅ Motor actual maneja fases completas |
| **Timer 15s + Auto-fold** | `setInterval` decrementa `timeRemaining`; al llegar a 0 → `check` si gratis, `fold` si no | ❌ App actual **no tiene timer de turno** ni auto-fold |
| **Bots IA** | `useEffect` con `thinkingTime` 1.2–2.5s; lógica: 65% check gratis, 2×BB bet; fold 0.6 big-call / 0.25 normal | ✅ App actual tiene IA con personalidades (Tiburón/Maestro/Dama/Forajido/Titán/Sombra/Reina/Rey) — **más rica** que la del hook |
| **Side Pots** | `sidePots: []` declarado pero **nunca poblado** en este snippet; showdown reparte `mainPot` con `Math.floor(pot/n)` | ✅ App actual **sí implementa botes laterales** (`game.js:87-97`: split pot con resto impar al primer ganador) |
| **Min-raise tracking** | `currentMinBet` / `lastRaiseAmount` | ✅ Motor actual maneja min-raise (ver `game.js`) |
| **All-in handling** | `status: 'all_in'` + ajusta `currentMinBet`/`lastRaiseAmount` | ✅ App actual soporta all-in (ver `ui.js:100` branch all-in) |
| **Evaluación pedagógica Hero** | `evaluatePokerHand(heroSeat.cards, communityCards)` → `heroHandEvaluation.nameEs` | ⚠️ **Candidato a port**: nombres en español (`nameEs`) para UI — evaluador actual no los tiene |
| **Sound hooks** | `playCardDeal/Flip`, `playCheckKnock`, `playFold`, `playChipBet/Stack/AllIn`, `playWinCelebration` | ✅ App actual tiene `sound.js` con `chips(n)`, `deal()`, `shuffle()`, `win()`, `toggle()` — **falta** `check_knock`, `fold_whoosh`, `card_flip` |

---

## Flags Honestos (Inconsistencias en el Doc Stitch)

| # | Observación | Severidad |
|---|---|---|
| 1 | **RNG inseguro**: `createFreshDeck()` usa `Math.random()` pese a que Stitch documenta `getSecureRandomInt()` con `crypto.getRandomValues()` | Media |
| 2 | **Side effects en updaters de `setGameState`**: `playCardDeal()`, `playCardFlip()`, `playWinCelebration()`, `setTimeout(() => advanceToNextPhase())`, `setTimeout(() => passTurn())` llamados **dentro** de callbacks de `setGameState` — anti-pattern React (StrictMode doble invoke) | Alta |
| 3 | **`sidePots[]` declarado pero nunca usado**: el showdown solo reparte `mainPot` con división entera `Math.floor(pot/n)` | Media |
| 4 | **Hold'em-only**: el hook no contempla Omaha/Short Deck/Draw/Stud; `evaluatePokerHand` del evaluador Stitch tampoco los soporta | Baja (scope) |
| 5 | **Bot timeout no limpiado al desmontar**: `botTimeoutRef` se limpia en `return` del `useEffect`, pero si `handlePlayerAction` programa otro `setTimeout` (línea 631) antes del cleanup, puede fuga | Baja |
| 6 | **`NodeJS.Timeout` type**: uso de tipo Node en código que corre en navegador — funcionará por polyfill pero no es limpio | Cosmético |

---

## Mapeo a App Actual (Resumen Ejecutivo)

| Feature del Hook | En App Actual | Acción Recomendada |
|---|---|---|
| Burn cards (pre-flop/turn/river) | ❌ No | **Port candidate** — añadir `deck.pop()` antes de cada carta comunitaria |
| 15s timer + auto-fold | ❌ No | **Port candidate** — `setInterval` + auto-check/fold en `js/ui.js` |
| Timer ring SVG (PlayerSeat) | ❌ No | **Port candidate** — SVG `stroke-dashoffset` en `.seat` |
| Dealer/SB/BB badges | ❌ No | **Port candidate** — badges visuales en `.plate` |
| Per-action SFX (check_knock, fold_whoosh, card_flip) | ❌ Faltan | **Port candidate** — extender `sound.js` |
| Crypto shuffle (`crypto.getRandomValues`) | ❌ No (usa `Math.random()`) | **Pendiente aprobación usuario** — migración RNG |
| Pedagogical `nameEs` (kickers en español) | ❌ No | **Port candidate** — solo UI, no lógica |
| Side pots completos | ✅ Sí (mejor que hook) | Mantener motor actual |
| IA con personalidades | ✅ Sí (más rica) | Mantener `ai.js` |

---

## Conclusión

El hook `usePokerGame` es una **especificación funcional completa** para Texas Hold'em 6-max con timer, bots básicos, burn cards y evaluación pedagógica. La app actual **ya implementa la mayoría de la lógica** (fases, ciegas, dealer rotation, side pots, IA rica, evaluador 9 categorías + Short Deck/Omaha/Draw/Stud) en vanilla JS.

**Lo que el hook aporta y la app no tiene**:
1. Burn cards protocol
2. Turn timer (15s) + auto-fold
3. Dealer/SB/BB badges visuales
4. Timer ring SVG por asiento
5. SFX diferenciados por acción
6. Nombres de mano en español (`nameEs`)

**Decisiones pendientes del usuario** (ver lista final en siguiente paso):
- Aprobar migración a `crypto.getRandomValues()` para shuffle
- Aprobar port de `nameEs` pedagógico
- Aprobar burn cards / timer / badges / SFX
- Confirmar si quiere "reglas por juego con ejemplos SVG" y "apuestas tipo fichas en mesa de póker"