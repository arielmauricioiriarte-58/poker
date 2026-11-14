# Royal Felt · Componente de Asiento de Jugador (Stitch DOCUMENT_2)

> **⚠️ REFERENCIA, no código de producción.** React + Tailwind (`cn`, `useChipsSound`). La app actual es **JS vanilla**: asientos en `.seat`/`.plate` (`css/styles.css`, `js/views.js`). Verbatim del canvas; enlace al proyecto Stitch no accesible desde aquí.

## `src/components/casino/player-seat.tsx` (verbatim)

```tsx
'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card as CardType } from '@/types/card';
import { useChipsSound } from '@/hooks/use-chips-sound';

export type PlayerRole = 'dealer' | 'small_blind' | 'big_blind' | 'none';

export type PlayerActionStatus =
  | 'idle' | 'acting' | 'folded' | 'all_in' | 'checked' | 'called' | 'raised' | 'winner';

export interface PlayerSeatProps extends React.HTMLAttributes<HTMLDivElement> {
  playerId: string;
  name: string;
  chipStack: number;
  currentBet?: number;
  holeCards?: CardType[];
  showHoleCards?: boolean;
  isHero?: boolean;
  isCurrentTurn?: boolean;
  timeRemainingPercent?: number;
  role?: PlayerRole;
  actionStatus?: PlayerActionStatus;
  statusLabel?: string;
  isEmpty?: boolean;
  initials?: string;
  avatarUrl?: string;
  onSeatClick?: (playerId: string) => void;
}

const STATUS_BADGE_STYLES: Record<PlayerActionStatus, { bg: string; text: string; border: string }> = {
  idle: { bg: 'bg-transparent', text: 'text-transparent', border: 'border-transparent' },
  acting: { bg: 'bg-[#e5a93c]/20', text: 'text-[#e5a93c]', border: 'border-[#e5a93c]/50' },
  folded: { bg: 'bg-[#181c22]/90', text: 'text-[#64748b]', border: 'border-[#353940]/60' },
  all_in: { bg: 'bg-gradient-to-r from-[#dc2626] to-[#991b1b]', text: 'text-white', border: 'border-[#ef4444]' },
  checked: { bg: 'bg-[#0284c7]/25', text: 'text-[#38bdf8]', border: 'border-[#0284c7]/50' },
  called: { bg: 'bg-[#059669]/25', text: 'text-[#34d399]', border: 'border-[#059669]/50' },
  raised: { bg: 'bg-[#d97706]/30', text: 'text-[#fbbf24]', border: 'border-[#f59e0b]/60' },
  winner: { bg: 'bg-gradient-to-r from-[#d4a017] via-[#f59e0b] to-[#b45309]', text: 'text-[#0a0e14]', border: 'border-[#e5a93c]' },
};

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  playerId, name, chipStack, currentBet = 0, holeCards = [], showHoleCards = false,
  isHero = false, isCurrentTurn = false, timeRemainingPercent = 100, role = 'none',
  actionStatus = 'idle', statusLabel, isEmpty = false, initials, avatarUrl, onSeatClick,
  className, ...props
}) => {
  const { playCardFlip } = useChipsSound();

  const computedInitials = useMemo(() => {
    if (initials) return initials.slice(0, 2).toUpperCase();
    if (!name) return 'RF';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name, initials]);

  const formattedStack = useMemo(() => {
    if (chipStack >= 1000000) return `$${(chipStack / 1000000).toFixed(1)}M`;
    if (chipStack >= 1000) return `$${(chipStack / 1000).toFixed(1)}k`;
    return `$${chipStack}`;
  }, [chipStack]);

  const formattedBet = useMemo(() => {
    if (currentBet <= 0) return null;
    if (currentBet >= 1000) return `$${(currentBet / 1000).toFixed(1)}k`;
    return `$${currentBet}`;
  }, [currentBet]);

  if (isEmpty) {
    return (
      <div className={cn('relative flex flex-col items-center justify-center select-none', className)} {...props}>
        <button type="button" onClick={() => onSeatClick?.(playerId)}
          className={cn(
            'w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-dashed border-[#353940]/80',
            'bg-[#10141a]/60 hover:bg-[#181c22] hover:border-[#e5a93c]/70',
            'flex flex-col items-center justify-center text-[#94a3b8] hover:text-[#e5a93c]',
            'transition-all duration-200 cursor-pointer shadow-inner group'
          )}
          aria-label="Asiento disponible, pulsar para unirse a la mesa">
          <span className="text-xl font-light transition-transform group-hover:scale-125">+</span>
          <span className="text-[9px] font-mono tracking-tight uppercase opacity-75">Unirse</span>
        </button>
      </div>
    );
  }

  const isFolded = actionStatus === 'folded';
  const isWinner = actionStatus === 'winner';
  const badgeTheme = STATUS_BADGE_STYLES[actionStatus] || STATUS_BADGE_STYLES.idle;

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeRemainingPercent / 100) * circumference;
  const isTimeCritical = isCurrentTurn && timeRemainingPercent <= 25;

  return (
    <div className={cn('relative flex flex-col items-center select-none transition-all duration-300',
      isFolded && 'opacity-45 grayscale-[40%]', className)} {...props}>
      {/* 1. CARTAS DE MANO (HOLE CARDS) APILADAS SOBRE EL ASIENTO */}
      {holeCards.length > 0 && (
        <div className={cn('flex items-center justify-center -space-x-3 mb-[-14px] z-10 transition-transform duration-200',
          isHero ? 'scale-100 hover:-translate-y-1' : 'scale-85')}>
          {holeCards.map((card, index) => {
            const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
            const showFace = showHoleCards || isHero || card.faceUp;
            return (
              <div key={card.id || `card-${index}`}
                onClick={() => { if (isHero) playCardFlip(); }}
                className={cn('w-9 h-12 md:w-11 md:h-15 rounded-lg border flex flex-col justify-between p-1 shadow-lg transition-transform',
                  index === 0 ? '-rotate-4 origin-bottom-right' : 'rotate-4 origin-bottom-left',
                  showFace ? 'bg-gradient-to-b from-white to-[#f1f5f9] border-[#cbd5e1]'
                           : 'bg-gradient-to-br from-[#1e242e] to-[#0a0e14] border-[#d4a017]/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]')}>
                {showFace ? (
                  <>
                    <div className="flex items-center justify-between leading-none">
                      <span className={cn('font-mono font-black text-[11px] md:text-xs', isRed ? 'text-[#dc2626]' : 'text-[#0f172a]')}>{card.rank}</span>
                      <span className={cn('text-[10px]', isRed ? 'text-[#dc2626]' : 'text-[#0f172a]')}>
                        {card.suit === 'spades' && '♠'}{card.suit === 'hearts' && '♥'}{card.suit === 'diamonds' && '♦'}{card.suit === 'clubs' && '♣'}
                      </span>
                    </div>
                    <div className={cn('text-center text-sm md:text-base font-bold my-auto', isRed ? 'text-[#dc2626]' : 'text-[#0f172a]')}>
                      {card.suit === 'spades' && '♠'}{card.suit === 'hearts' && '♥'}{card.suit === 'diamonds' && '♦'}{card.suit === 'clubs' && '♣'}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full border border-dashed border-[#e5a93c]/40 rounded flex items-center justify-center bg-[#10141a]/80">
                    <span className="font-heading text-[8px] text-[#e5a93c]/70 tracking-widest font-bold">RF</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. AVATAR CIRCULAR CON ANILLO TEMPORIZADOR SVG */}
      <div className="relative flex items-center justify-center">
        {isCurrentTurn && (
          <svg className="absolute -inset-2 w-16 h-16 md:w-18 md:h-18 -rotate-90 pointer-events-none z-0" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r={radius} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3.5" fill="transparent" />
            <circle cx="30" cy="30" r={radius} stroke={isTimeCritical ? '#ef4444' : '#e5a93c'} strokeWidth="3.5" fill="transparent"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-150 ease-linear" />
          </svg>
        )}
        <button type="button" onClick={() => onSeatClick?.(playerId)}
          className={cn('w-13 h-13 md:w-15 md:h-15 rounded-full relative z-10 flex items-center justify-center overflow-hidden',
            'bg-gradient-to-br from-[#1e242e] to-[#10141a] transition-all duration-200',
            isHero ? 'ring-2 ring-[#e5a93c] ring-offset-2 ring-offset-[#0a0e14] shadow-[0_0_15px_rgba(229,169,60,0.4)]'
                   : 'border border-[#353940]/80 shadow-md',
            isCurrentTurn && 'shadow-[0_0_20px_rgba(229,169,60,0.6)] animate-pulse',
            isWinner && 'ring-2 ring-[#d4a017] shadow-[0_0_25px_rgba(212,160,23,0.8)]')}
          aria-label={`Asiento de ${name}, fichas: ${formattedStack}${isHero ? ' (Tú)' : ''}`}>
          {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" /> : (
            <span className={cn('font-mono font-bold text-xs md:text-sm tracking-wider', isHero ? 'text-[#e5a93c]' : 'text-[#cbd5e1]')}>
              {computedInitials}
            </span>
          )}
          <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
        </button>
        {/* 3. BOTÓN DE REPARTIDOR / CIEGAS */}
        {role !== 'none' && (
          <span className={cn('absolute -top-1 -right-1 z-20 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow-md border',
            role === 'dealer' && 'bg-white text-[#10141a] border-[#cbd5e1] font-mono shadow-[0_2px_6px_rgba(0,0,0,0.6)]',
            role === 'small_blind' && 'bg-[#0284c7] text-white border-[#38bdf8]',
            role === 'big_blind' && 'bg-[#d97706] text-white border-[#fbbf24]')}
            title={role === 'dealer' ? 'Dealer Button' : role === 'small_blind' ? 'Small Blind' : 'Big Blind'}>
            {role === 'dealer' ? 'D' : role === 'small_blind' ? 'SB' : 'BB'}
          </span>
        )}
      </div>

      {/* 4. PLACA DE IDENTIFICACIÓN Y BALANCE */}
      <div className={cn('w-20 md:w-24 mt-1 bg-[#10141a]/95 border border-[#353940]/80 rounded-lg px-1.5 py-0.5 text-center shadow-lg',
        'backdrop-blur-sm transition-colors duration-200', isHero && 'border-[#e5a93c]/50 bg-[#141a22]/95')}>
        <div className="truncate text-[10px] md:text-[11px] font-heading font-medium text-[#e2e8f0]">{isHero ? 'Tú (Hero)' : name}</div>
        <div className="font-mono font-bold text-[11px] md:text-xs text-[#e5a93c] tracking-tight tabular-nums">{formattedStack}</div>
      </div>

      {/* 5. INSIGNIA FLOTANTE DE ACCIÓN */}
      {actionStatus !== 'idle' && (
        <div className={cn('absolute -bottom-4 z-20 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border shadow-md',
          badgeTheme.bg, badgeTheme.text, badgeTheme.border, isWinner && 'animate-bounce')}>
          {statusLabel || (actionStatus === 'all_in' ? 'ALL-IN' : actionStatus === 'checked' ? 'CHECK' : actionStatus === 'called' ? 'CALL'
            : actionStatus === 'raised' ? 'RAISE' : actionStatus === 'folded' ? 'FOLD' : actionStatus === 'winner' ? 'GANADOR' : 'TURNO')}
        </div>
      )}

      {/* 6. APUESTA EN CURSO SOBRE EL TAPETE */}
      {formattedBet && (
        <div className="absolute -top-7 md:-top-8 flex items-center gap-1 bg-[#161b24]/90 border border-[#e5a93c]/40 rounded-full px-2 py-0.5 shadow-md">
          <div className="w-3.5 h-3.5 rounded-full border border-[#e5a93c] bg-gradient-to-br from-[#f59e0b] to-[#b45309] shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full border border-dashed border-white/50" />
          </div>
          <span className="font-mono text-[10px] font-bold text-[#e5a93c] tabular-nums">{formattedBet}</span>
        </div>
      )}
    </div>
  );
};

PlayerSeat.displayName = 'PlayerSeat';
export default PlayerSeat;
```

### Ejemplo de uso: cuadrícula alrededor de la mesa (`poker-seats-layout.tsx`, verbatim resumido)

```tsx
// 4 asientos absolutos sobre el tapete: Norte (dealer), Este (turno), Oeste (fold), Sur (Hero)
<PlayerSeat playerId="villain-1" name="LordSterling" chipStack={4800} currentBet={50}
  holeCards={sampleHoleCardsVillain} role="dealer" actionStatus="called" />
<PlayerSeat playerId="villain-2" name="LadyElena" chipStack={1250} currentBet={100}
  isCurrentTurn={true} timeRemainingPercent={45} role="small_blind" actionStatus="acting" />
<PlayerSeat playerId="villain-3" name="BaronG" chipStack={3100} role="big_blind" actionStatus="folded" />
<PlayerSeat playerId="hero-user" name="Alejandro VIP" chipStack={2850} currentBet={200}
  holeCards={sampleHoleCardsHero} isHero={true} actionStatus="raised" />
```

## Mapeo con la app actual

| Del doc | App actual | Nota |
|---|---|---|
| Avatar monograma/foto | Avatar emoji por rival (🎩🦈👑🤠🦍🦇👸🤴) en `.seat .avatar` | Emoji = identidad de marca propia; mantener |
| Anillo SVG temporizador (26px, dorado→carmesí ≤25%) | No existe | Candidato a port (SVG `stroke-dashoffset`, sin React) |
| Badge D/SB/BB | No existe | Candidato; también pedagógico |
| Insignia de acción flotante (CHECK/CALL/RAISE/FOLD/ALL-IN/GANADOR) | Mensaje central en `.msg` | Badge por asiento = candidato |
| `holeCards` + `showHoleCards` + `faceUp` | `.gc`/`.card` con `back.svg` para rivales y hole del crupier | Equivalente resuelto |
| `chipStack` formato `$2.5k` | `money()` en `cards.js` (`$10.0K`) | Equivalente |
| Asiento vacío "+ Unirse" | No aplica (6-max vs 8 AI fijos) | — |
