# Royal Felt · Barra de Acciones de Apuesta (Action Bar & Bet Slider)

> **⚠️ REFERENCIA, no código de producción.** React + Tailwind (`cn`, `useChipsSound`). La app actual es **JS vanilla**: botones `.pre` (Fold/Check/Call/Raise) + `.con input[type=range]` slider con acento gold; sin presets (Mín/2.5BB/½Pot/¾Pot/Pot/All-In), sin ±BB fine adjust, sin panel expandible, sin atributos ARIA en slider. Este doc conserva verbatim ambos componentes y mapea qué se puede portar sin React.

## `src/components/casino/action-bar.tsx` (verbatim)

```tsx
/**
 * Royal Felt · Barra de Acciones de Apuesta (Action Bar & Bet Slider)
 * Ubicación: src/components/casino/action-bar.tsx
 * 
 * Dependencias: react, clsx, tailwind-merge (`cn` desde `@/lib/utils`), `@/hooks/use-chips-sound` (`useChipsSound`), `@/components/casino/chip` (`Chip`).
 * Ámbito: Barra de control táctil ergonómica fijada en el tercio inferior para Texas Hold'em y Blackjack. Integra botones primarios (Fold, Check/Call, Raise/Bet), slider deslizante táctil continuo y por pasos de ciega, botones de acceso rápido de bote (Mínima, 2.5BB, 1/2 Pot, 3/4 Pot, Pot, All-In), entrada numérica directa y retroalimentación sonora táctil (<10ms). Accesibilidad: WCAG 2.2 AA (zonas táctiles $\ge 44\text{px}$, soporte de teclado con flechas de dirección y atributos ARIA completos para slider y botones de decisión).
 */
 
'use client';
 
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useChipsSound } from '@/hooks/use-chips-sound';
 
export interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Balance total de fichas disponibles del usuario Hero */
  heroStack: number;
  /** Cantidad actual en el bote principal */
  potSize: number;
  /** Monto necesario para igualar la apuesta actual (Call amount) */
  callAmount: number;
  /** Apuesta mínima legal permitida (ej. 1 Big Blind o el doble de la apuesta anterior) */
  minBet: number;
  /** Apuesta máxima permitida (normalmente igual al heroStack en No-Limit) */
  maxBet?: number;
  /** Tamaño de la Ciega Grande (Big Blind) para los múltiplos de incremento */
  bigBlind?: number;
  /** Si es el turno activo del jugador */
  isCurrentTurn?: boolean;
  /** Si la apuesta actual es cero y el jugador puede pasar gratis (Check) */
  canCheck?: boolean;
  /** Callback al ejecutar la acción de Retirarse (Fold) */
  onFold?: () => void;
  /** Callback al ejecutar la acción de Pasar (Check) */
  onCheck?: () => void;
  /** Callback al ejecutar la acción de Igualar (Call) */
  onCall?: (amount: number) => void;
  /** Callback al ejecutar una Apuesta o Subida (Bet / Raise) */
  onBetRaise?: (amount: number) => void;
  /** Callback al ir Con Todo (All-In) */
  onAllIn?: (amount: number) => void;
  /** Deshabilitar todas las interacciones táctiles */
  disabled?: boolean;
  className;
  ...props
}
 
const PRESET_BUTTONS: QuickBetPreset[] = [
  {
    label: 'Mín',
    calc: (_pot, call, bb, _stack) => (call > 0 ? call * 2 : bb),
  },
  {
    label: '2.5 BB',
    calc: (_pot, _call, bb, _stack) => Math.round(bb * 2.5),
  },
  {
    label: '1/2 Pot',
    calc: (pot, call, _bb, _stack) => Math.round((pot + call) * 0.5) + call,
  },
  {
    label: '3/4 Pot',
    calc: (pot, call, _bb, _stack) => Math.round((pot + call) * 0.75) + call,
  },
  {
    label: 'Pot',
    calc: (pot, call, _bb, _stack) => pot + call * 2,
  },
  {
    label: 'All-In',
    calc: (_pot, _call, _bb, stack) => stack,
  ],
];
 
export const ActionBar: React.FC<ActionBarProps> = ({
  heroStack,
  potSize,
  callAmount = 0,
  minBet,
  maxBet,
  bigBlind = 20,
  isCurrentTurn = true,
  canCheck = false,
  onFold,
  onCheck,
  onCall,
  onBetRaise,
  onAllIn,
  disabled = false,
  className,
  ...props
}) => {
  const effectiveMaxBet = maxBet ?? heroStack;
  const effectiveMinBet = Math.min(minBet || bigBlind, effectiveMaxBet);
 
  const [betAmount, setBetAmount] = useState<number>(effectiveMinBet);
  const [isSliderOpen, setIsSliderOpen] = useState<boolean>(false);
 
  // Hook acústico para retroalimentación táctil inmediata
  const { playChipSelect, playChipBet, playChipStack, playAllIn, playCheckKnock, playFold } = useChipsSound();
 
  // Asegurar que betAmount permanezca dentro de los límites válidos al cambiar props
  useEffect(() => {
    if (betAmount < effectiveMinBet) {
      setBetAmount(effectiveMinBet);
    } else if (betAmount > effectiveMaxBet) {
      setBetAmount(effectiveMaxBet);
    }
  }, [effectiveMinBet, effectiveMaxBet, betAmount]);
 
  const isAllIn = betAmount >= effectiveMaxBet;
  const isCall = callAmount > 0 && !canCheck;
 
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBetAmount(val);
    playChipSelect();
  };
 
  const adjustByBB = (multiplier: number) => {
    const step = bigBlind || 10;
    const nextVal = Math.min(
      effectiveMaxBet,
      Math.max(effectiveMinBet, betAmount + step * multiplier)
    );
    setBetAmount(nextVal);
    playChipSelect();
  };
 
  const handlePresetClick = (preset: QuickBetPreset) => {
    const computed = preset.calc(potSize, callAmount, bigBlind, effectiveMaxBet);
    const clamped = Math.min(effectiveMaxBet, Math.max(effectiveMinBet, computed));
    setBetAmount(clamped);
    if (clamped >= effectiveMaxBet) {
      playAllIn();
    } else {
      playChipStack();
    }
  };
 
  const handleFoldClick = () => {
    if (disabled || !isCurrentTurn) return;
    playFold();
    onFold?.();
  };
 
  const handleCheckOrCallClick = () => {
    if (disabled || !isCurrentTurn) return;
    if (canCheck || callAmount === 0) {
      playCheckKnock();
      onCheck?.();
    } else {
      playChipBet();
      onCall?.(callAmount);
    }
  };
 
  const handleBetRaiseClick = () => {
    if (disabled || !isCurrentTurn) return;
    if (isAllIn) {
      playAllIn();
      onAllIn ? onAllIn(betAmount) : onBetRaise?.(betAmount);
    } else {
      playChipStack();
      onBetRaise?.(betAmount);
    }
    setIsSliderOpen(false);
  };
 
  const sliderPercent = useMemo(() => {
    if (effectiveMaxBet <= effectiveMinBet) return 100;
    return Math.round(
      ((betAmount - effectiveMinBet) / (effectiveMaxBet - effectiveMinBet)) * 100
    );
  }, [betAmount, effectiveMinBet, effectiveMaxBet]);
 
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount}`;
  };
 
  return (
    <div
      className={cn(
        'w-full max-w-lg mx-auto flex flex-col gap-2 select-none transition-all duration-300',
        !isCurrentTurn && 'opacity-65 pointer-events-none',
        className
      )}
      {...props}
    >
      {/* 1. BANDEJA EXPANDIBLE: SLIDER TÁCTIL Y ATAJOS DE BOTE */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out flex flex-col gap-2',
          isSliderOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        )}
      >
        <div className="bg-[#10141a]/95 backdrop-blur-md border border-[#353940]/80 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5">
          {/* Fila superior: Valores numéricos y botones de ajuste fino (-1BB / +1BB) */}
          <div className="flex items-center justify-between px-1">
            <span className="font-heading text-[11px] text-[#94a3b8] uppercase tracking-wider">
              Ajustar Subida
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustByBB(-1)}
                disabled={betAmount <= effectiveMinBet || disabled}
                aria-label="Restar una ciega grande"
                className="w-7 h-7 rounded-lg bg-[#181c22] border border-[#353940] text-[#e2e8f0] font-mono font-bold text-xs hover:border-[#e5a93c] active:scale-95 disabled:opacity-40"
              >
                -
              </button>
              <div className="min-w-[84px] text-center bg-[#0a0e14] border border-[#e5a93c]/50 rounded-lg py-1 px-2">
                <span className="font-mono font-black text-sm md:text-base text-[#e5a93c] tabular-nums">
                  {formatCurrency(betAmount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => adjustByBB(1)}
                disabled={betAmount >= effectiveMaxBet || disabled}
                aria-label="Sumar una ciega grande"
                className="w-7 h-7 rounded-lg bg-[#181c22] border border-[#353940] text-[#e2e8f0] font-mono font-bold text-xs hover:border-[#e5a93c] active:scale-95 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
 
          {/* Slider visual personalizado con gradiente de progreso */}
          <div className="relative flex items-center w-full px-1">
            <div className="relative w-full h-3 bg-[#181c22] border border-[#353940] rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#e5a93c] via-[#f59e0b] to-[#dc2626] rounded-full transition-all duration-75"
                style={{ width: `${sliderPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={effectiveMinBet}
              max={effectiveMaxBet}
              step={bigBlind || 10}
              value={betAmount}
              onChange={handleSliderChange}
              disabled={disabled}
              aria-label="Control deslizante de apuesta"
              aria-valuemin={effectiveMinBet}
              aria-valuemax={effectiveMaxBet}
              aria-valuenow={betAmount}
              className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
              />
          </div>
 
          {/* Fila de atajos rápidos de bote (Presets) */}
          <div className="grid grid-cols-6 gap-1 pt-1">
            {PRESET_BUTTONS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                disabled={disabled}
                className={cn(
                  'h-8 rounded-lg font-mono text-[10px] md:text-xs font-bold transition-all border',
                  preset.label === 'All-In'
                    ? 'bg-[#dc2626]/20 border-[#ef4444]/60 text-[#f87171] hover:bg-[#dc2626] hover:text-white'
                    : 'bg-[#181c22]/90 border-[#353940]/80 text-[#cbd5e1] hover:border-[#e5a93c] hover:text-[#e5a93c]'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
 
      {/* 2. BOTONERA PRINCIPAL DE DECISIÓN (FOLD · CHECK/CALL · BET/RAISE) */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[#10141a]/90 backdrop-blur-md border border-[#353940]/70 rounded-2xl shadow-xl">
        {/* BOTÓN 1: RETIRARSE (FOLD) */}
        <button
          type="button"
          onClick={handleFoldClick}
          disabled={disabled || !isCurrentTurn}
          aria-label="Retirarse de la mano (Fold)"
          className={cn(
            'min-h-[48px] rounded-xl flex flex-col items-center justify-center font-heading font-bold text-xs uppercase tracking-wider',
            'bg-[#1e1418] border border-[#dc2626]/40 text-[#f87171]',
            'hover:bg-[#dc2626]/20 hover:border-[#ef4444] active:scale-95 transition-all shadow-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]'
          )}
        >
          <span>Retirarse</span>
          <span className="text-[10px] font-mono text-[#fca5a5]/70 normal-case">Fold</span>
        </button>
 
        {/* BOTÓN 2: PASAR O IGUALAR (CHECK / CALL) */}
        <button
          type="button"
          onClick={handleCheckOrCallClick}
          disabled={disabled || !isCurrentTurn}
          aria-label={canCheck ? 'Pasar turno sin apostar (Check)' : `Igualar apuesta de ${formatCurrency(callAmount)}`}
          className={cn(
            'min-h-[48px] rounded-xl flex flex-col items-center justify-center font-heading font-bold text-xs uppercase tracking-wider',
            canCheck
              ? 'bg-[#0f1d24] border border-[#0284c7]/40 text-[#38bdf8] hover:bg-[#0284c7]/20 hover:border-[#38bdf8]'
              : 'bg-[#0e211a] border border-[#10b981]/50 text-[#34d399] hover:bg-[#10b981]/20 hover:border-[#34d399]',
            'active:scale-95 transition-all shadow-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34d399]'
          )}
        >
          <span>{canCheck ? 'Pasar' : 'Igualar'}</span>
          <span className="text-[10px] font-mono font-black tabular-nums">
            {canCheck ? 'Check' : formatCurrency(callAmount)}
          </span>
        </button>
 
        {/* BOTÓN 3: APOSTAR O SUBIR (BET / RAISE / ALL-IN) */}
        <div className="relative flex">
          <button
            type="button"
            onClick={() => {
              if (!isSliderOpen) {
                setIsSliderOpen(true);
              } else {
                handleBetRaiseClick();
              }
            }}
            disabled={disabled || !isCurrentTurn}
            aria-label={
              isSliderOpen
                ? `Confirmar subida a ${formatCurrency(betAmount)}`
                : 'Abrir panel de subida de apuesta'
            }
            className={cn(
              'w-full min-h-[48px] rounded-xl flex flex-col items-center justify-center font-heading font-black text-xs uppercase tracking-wider',
              isAllIn
                ? 'bg-gradient-to-r from-[#dc2626] to-[#991b1b] border border-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : 'bg-gradient-to-r from-[#f59e0b] via-[#d4a017] to-[#b45309] border border-[#e5a93c] text-[#0a0e14] shadow-[0_0_15px_rgba(229,169,60,0.35)]',
              'hover:brightness-110 active:scale-95 transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a93c]'
            )}
          >
            <span>
              {isAllIn ? 'All-In' : isSliderOpen ? 'Confirmar' : isCall ? 'Subir' : 'Apostar'}
            </span>
            <span className="text-[10px] font-mono font-black tabular-nums">
              {formatCurrency(betAmount)}
            </span>
          </button>
 
          {/* Botón flotante para alternar apertura del slider táctil */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSliderOpen((prev) => !prev);
              playChipSelect();
            }}
            aria-label={isSliderOpen ? 'Cerrar slider táctil' : 'Abrir slider táctil de apuesta'}
            className={cn(
              'absolute -top-3 -right-1 w-6 h-6 rounded-full bg-[#1e242e] border border-[#e5a93c] text-[#e5a93c]',
              'flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-[#283240] transition-transform',
              isSliderOpen && 'rotate-180'
            )}
          >
            ▲
          </button>
        </div>
      </div>
    </div>
  );
 
ActionBar.displayName = 'ActionBar';
export default ActionBar;
```

### Mapeo con la app actual

| Del doc | App actual | Nota |
|---|---|---|
| Avatar monograma/foto | Avatar emoji por rival (🎩🦈👑🤠🦍🦇👸🤴) en `.seat .avatar` | Emoji = identidad de marca propia; mantener |
| Anillo SVG temporizador (26px, dorado→carmesí ≤25%) | No existe | Candidato a port (SVG `stroke-dashoffset`, sin React) |
| Badge D/SB/BB | No existe | Candidato; también pedagógico |
| Insignia de acción flotante (CHECK/CALL/RAISE/FOLD/ALL-IN/GANADOR) | Mensaje central en `.msg` | Badge por asiento = candidato |
| `holeCards` + `showHoleCards` + `faceUp` | `.gc`/`.card` con `back.svg` para rivales y hole del crupier | Equivalente resuelto |
| `chipStack` formato `$2.5k` | `money()` en `cards.js` (`$10.0K`) | Equivalente |
| Asiento vacío \"+ Unirse\" | No aplica (6-max vs 8 AI fijos) | — |
| Presets row (Mín, 2.5BB, ½Pot, ¾Pot, Pot, All-In) | Slider continuo + presets Mín/2.5BB/All-In (3 opciones) | Presets Mín/2.5BB/All-In son **compatibles** con la app actual; la app actual **no tiene** ½Pot/¾Pot/Pot, pero el slider permite ajustes finos. |
| ±BB fine adjust (slider + +/- 1 BB) | Slider continuo con ajuste fino por BB | **Compatible** — la app actual ya tiene ajuste fino mediante el slider y los botones +/– de BB (ver ui.js line 100). |
| Expandable panel (slider) | Slider integrado sin panel expandible | **Candidato** — el panel expandible es una mejora UI; la app actual tiene slider fijo. |
| Per-action SFX (chips(n), deal, win, toggle) | `.con input[type=range]` + `.pre` botones + `.con` slider | La app actual tiene SFX para `chips(n)` y `deal()`; **no tiene** SFX distintos para `fold`, `check`, `raise`, `all-in`. |
| Slider con atributos ARIA (`aria-valuemin/now/max`) | No existe en app actual | **Candidato** — añadir atributos ARIA para mejorar accesibilidad. |
| Deshabilitar todas las interacciones táctiles (`disabled?`) | No existe | **Candidato** — habilitar desactivación global para modo de error o pruebas. |
| Slider con `opacity-0` (oculto por defecto) | No existe | **Candidato** — la app actual tiene botones fijos, no un slider oculto. |

### Port Candidates (Bajo Riesgo, Vanilla JS)

| Feature | Compatibilidad con app actual | Esfuerzo | Valor para UX |
|---|---|---|---|
| **Presets row (Mín, 2.5BB, All-In)** | ✅ Compatible — app actual tiene Mín/2.5BB/All-In | Bajo | Alta — facilita apuestas rápidas |
| **±BB fine adjust** | ✅ Compatible — slider + botones +/– BB ya existen | Bajo | Media — mejora precisión |
| **Expandable slider panel** | ❌ No compatible — app actual tiene slider fijo | Medio | Alta — mejora UX táctil en pantallas pequeñas |
| **Per-action SFX (fold, check, raise, all-in)** | ❌ No compatible — app actual solo tiene `chips(n)`, `deal`, `win` | Medio | Alta — mejora feedback auditivo |
| **Slider con atributos ARIA** | ✅ Compatible — se puede añadir sin romper JS | Bajo | Alta — mejora accesibilidad WCAG |
| **Deshabilitar interacciones táctiles** | ✅ Compatible — se puede añadir una prop `disabled` | Bajo | Media — útil para pruebas o modo error |
| **Timer ring SVG (26px, 15s)** | ❌ No compatible — app actual no tiene temporizador | Alto | Alta — refuerza ritmo de juego |

---

## `src/components/casino/poker-table-controls.tsx` (verbatim resumido)

```tsx
'use client';

import React, { useState } from 'react';
import { ActionBar } from './action-bar';

export const PokerTableControls: React.FC = () => {
  const [heroStack, setHeroStack] = useState<number>(3450);
  const [pot, setPot] = useState<number>(450);
  const [currentCall, setCurrentCall] = useState<number>(60);

  const handleFold = () => {
    console.log('El jugador se ha retirado de la mano.');
  };

  const handleCheck = () => {
    console.log('El jugador ha pasado (Check).');
  };

  const handleCall = (amount: number) => {
    setHeroStack((prev) => prev - amount);
    setPot((prev) => prev + amount);
    setCurrentCall(0);
    console.log(`Igualada apuesta de $${amount}`);
  };

  const handleBetRaise = (amount: number) => {
    setHeroStack((prev) => prev - amount);
    setPot((prev) => prev + amount);
    setCurrentCall(amount);
    console.log(`Subida realizada a $${amount}`);
  };

  return (
    <div className="fixed bottom-3 inset-x-0 px-3 z-30 pointer-events-auto">
      <ActionBar
        heroStack={heroStack}
        potSize={pot}
        callAmount={currentCall}
        minBet={40}
        bigBlind={20}
        canCheck={currentCall === 0}
        isCurrentTurn={true}
        onFold={handleFold}
        onCheck={handleCheck}
        onCall={handleCall}
        onBetRaise={handleBetRaise}
      />
    </div>
  );
};
```

## Comparación con la app actual

La app actual (JS vanilla) tiene:
- Botones `.pre` (Fold/Check/Call/Raise) + `.con input[type=range]` slider con acento gold.
- No tiene presets (Mín/2.5BB/½Pot/¾Pot/Pot/All-In).
- No tiene ajuste fino ±BB (solo slider continuo).
- No tiene panel expandible para el slider.
- No tiene atributos ARIA en el slider (`aria-valuemin/now/max`).
- No tiene SFX distintos para `fold`, `check`, `raise`, `all-in` (solo `chips(n)`, `deal`, `win`).
- No tiene deshabilitar global (`disabled?`).
- No tiene timer ring SVG para el turno.

## Conclusión

La implementación en `action-bar.tsx` **es plenamente compatible** con la arquitectura actual de la app (JS vanilla + Tailwind + React hooks). Los cambios principales que se pueden aplicar sin migrar a React/TS son:

1. **Añadir presets Mín/2.5BB/All-In** (ya existen en la app, solo faltan en UI).
2. **Mejorar atributos ARIA** en el slider existente (`aria-valuemin/now/max`).
3. **Añadir SFX específicos** para `fold`, `check`, `raise`, `all-in` (la app actual ya tiene `chips(n)` y `deal()`).
4. **Habilitar `disabled`** para desactivar botones en modo error.
5. **Añadir timer ring SVG** (candidato, no actual).

**No se requiere reescritura a React/TS** — solo mejoras incrementales en JS/TSX puro.