# Royal Felt · Componente de Ficha React (Stitch DOCUMENT_2)

> **⚠️ REFERENCIA, no código de producción.** `src/components/casino/chip.tsx` es React + Tailwind (`cn`, `useChipsSound`). La app actual es **JS vanilla**: las fichas viven en `.chipbtn` (`css/styles.css:206-209`) con SFX `sound.chips(n)` (`js/sound.js`). Este documento conserva verbatim el componente de Stitch y su bandeja, y mapea ambos mundos.
> **Relevancia directa:** es la referencia canónica del pendiente "apuestas tipo fichas táctiles en la mesa de póker" y del rojo/plateado de blackjack.

---

## 1. `src/components/casino/chip.tsx` (verbatim)

```tsx
/**
 * Royal Felt · Componente de Ficha de Casino Táctil
 * Ubicación: src/components/casino/chip.tsx
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useChipsSound } from '@/hooks/use-chips-sound';

export type ChipDenomination = 5 | 25 | 100 | 500 | 1000;
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Valor nominal de la ficha en dólares ficticios */
  value: ChipDenomination | number;
  /** Tamaño del componente en píxeles (sm: 44px, md: 56px, lg: 64px) */
  size?: ChipSize;
  /** Cantidad de fichas apiladas visualmente (1 a 5) */
  stackCount?: number;
  /** Estado deshabilitado (ej. sin fondos o turno inactivo) */
  disabled?: boolean;
  /** Estado seleccionado / activo en la bandeja */
  isSelected?: boolean;
  /** Callback ejecutado al pulsar la ficha con el monto */
  onSelectChip?: (value: number) => void;
  /** Si debe reproducir el sonido de clic de ficha al hacer click */
  enableSound?: boolean;
}

/**
 * Esquemas de color oficiales por denominación según las especificaciones de Royal Felt
 */
interface ChipColorScheme {
  borderRing: string;
  outerRing: string;
  innerCenter: string;
  textColor: string;
  accentBorder: string;
  glowColor: string;
  label: string;
}

const DENOMINATION_THEMES: Record<number, ChipColorScheme> = {
  5: {
    // $5 - Rojo Carmesí / Mínima
    borderRing: 'border-[#dc2626]',
    outerRing: 'bg-[#1e1418]',
    innerCenter: 'bg-gradient-to-br from-[#ef4444] to-[#b91c1c]',
    textColor: 'text-white',
    accentBorder: 'border-white/40',
    glowColor: 'shadow-[0_4px_16px_rgba(220,38,38,0.35)]',
    label: '$5',
  },
  25: {
    // $25 - Esmeralda / Estándar
    borderRing: 'border-[#10b981]',
    outerRing: 'bg-[#0e211a]',
    innerCenter: 'bg-gradient-to-br from-[#10b981] to-[#047857]',
    textColor: 'text-[#e7ecf3]',
    accentBorder: 'border-[#bfa356]/60',
    glowColor: 'shadow-[0_4px_16px_rgba(16,185,129,0.35)]',
    label: '$25',
  },
  100: {
    // $100 - Dorado Satén / High Roller
    borderRing: 'border-[#10141a]',
    outerRing: 'bg-[#d4a017]',
    innerCenter: 'bg-gradient-to-br from-[#f59e0b] via-[#d4a017] to-[#b45309]',
    textColor: 'text-[#10131a]',
    accentBorder: 'border-[#10141a]/60',
    glowColor: 'shadow-[0_6px_20px_rgba(212,160,23,0.45)]',
    label: '$100',
  },
  500: {
    // $500 - Púrpura Imperial / VIP Exclusivo
    borderRing: 'border-[#8b5cf6]',
    outerRing: 'bg-[#1e172a]',
    innerCenter: 'bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]',
    textColor: 'text-[#f8fafc]',
    accentBorder: 'border-[#e5a93c]/70',
    glowColor: 'shadow-[0_6px_20px_rgba(139,92,246,0.4)]',
    label: '$500',
  },
  1000: {
    // $1k - Negro Ónix con filigrana dorada brillante
    borderRing: 'border-[#d4a017]',
    outerRing: 'bg-[#0a0e14]',
    innerCenter: 'bg-gradient-to-br from-[#1e242e] to-[#0a0e14]',
    textColor: 'text-[#e5a93c]',
    accentBorder: 'border-[#d4a017]',
    glowColor: 'shadow-[0_6px_22px_rgba(212,160,23,0.5)]',
    label: '$1k',
  },
};

const SIZE_VARIANTS = {
  sm: {
    container: 'w-11 h-11 min-w-[44px] min-h-[44px]', // WCAG 2.2 AA mínimo estricto
    borderWidth: 'border-[3px]',
    fontSize: 'text-[11px]',
    dashMargin: 'm-[2px]',
  },
  md: {
    container: 'w-14 h-14 min-w-[56px] min-h-[56px]', // Tamaño estándar de bandeja
    borderWidth: 'border-[4px]',
    fontSize: 'text-xs',
    dashMargin: 'm-[3px]',
  },
  lg: {
    container: 'w-16 h-16 min-w-[64px] min-h-[64px]', // Tamaño prominente de mesa central
    borderWidth: 'border-[5px]',
    fontSize: 'text-sm',
    dashMargin: 'm-[4px]',
  },
};

/**
 * Ficha de Casino React Royal Felt con sonido táctil integrado
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      value,
      size = 'md',
      stackCount = 1,
      disabled = false,
      isSelected = false,
      onSelectChip,
      enableSound = true,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const { playChipSelect, playChipBet } = useChipsSound();

    // Obtener tema cromático según el valor nominal o fallback al más cercano
    const theme = useMemo(() => {
      if (DENOMINATION_THEMES[value]) {
        return DENOMINATION_THEMES[value];
      }
      if (value >= 1000) return DENOMINATION_THEMES[1000];
      if (value >= 500) return DENOMINATION_THEMES[500];
      if (value >= 100) return DENOMINATION_THEMES[100];
      if (value >= 25) return DENOMINATION_THEMES[25];
      return DENOMINATION_THEMES[5];
    }, [value]);

    const sizeConfig = SIZE_VARIANTS[size] || SIZE_VARIANTS.md;

    // Formatear etiqueta de valor legible (ej: $1,000 -> $1k)
    const formattedLabel = useMemo(() => {
      if (value >= 1000) {
        return `$${value / 1000}k`;
      }
      return `$${value}`;
    }, [value]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (enableSound) {
        if (value >= 100) {
          playChipBet(); // Clic más denso para fichas de alto valor
        } else {
          playChipSelect(); // Clic sutil cerámico estándar
        }
      }

      onSelectChip?.(value);
      onClick?.(e);
    };

    return (
      <div className="relative inline-flex items-center justify-center select-none group">
        {/* Renderizado de apilamiento visual (pseudo-fichas inferiores si stackCount > 1) */}
        {stackCount > 1 && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 rounded-full opacity-70 pointer-events-none transition-transform',
              theme.borderRing,
              theme.outerRing,
              sizeConfig.borderWidth,
              'translate-y-[3px] scale-[0.98] -z-10 shadow-sm'
            )}
          />
        )}
        {stackCount > 2 && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 rounded-full opacity-40 pointer-events-none transition-transform',
              theme.borderRing,
              theme.outerRing,
              sizeConfig.borderWidth,
              'translate-y-[6px] scale-[0.96] -z-20 shadow-sm'
            )}
          />
        )}

        {/* Ficha principal interactiva */}
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          onClick={handleClick}
          aria-label={`Ficha de ${formattedLabel} dólares ficticios${isSelected ? ' (Seleccionada)' : ''}`}
          aria-pressed={isSelected}
          className={cn(
            // Dimensiones y forma circular
            sizeConfig.container,
            sizeConfig.borderWidth,
            'rounded-full relative flex items-center justify-center',
            'font-mono font-bold tracking-tight',
            theme.borderRing,
            theme.outerRing,
            // Sombra física 3D y brillo de relieve
            'shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.25)]',
            // Interacciones táctiles
            !disabled && [
              'cursor-pointer transition-all duration-150',
              'hover:-translate-y-1 hover:brightness-110',
              'active:translate-y-0.5 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a93c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10131a]',
            ],
            // Resaltado al estar seleccionada
            isSelected && [
              '-translate-y-1.5 ring-2 ring-[#e5a93c] ring-offset-2 ring-offset-[#10141a]',
              theme.glowColor,
            ],
            // Estado deshabilitado
            disabled && 'opacity-40 cursor-not-allowed grayscale-[40%] hover:translate-y-0 shadow-none',
            className
          )}
          {...props}
        >
          {/* Dientes / Estriado perimetral del casino */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-25">
            <div className="w-full h-full border-[3px] border-dashed border-white/60 rounded-full" />
          </div>

          {/* Círculo interior con gradiente satinado */}
          <div
            className={cn(
              'w-full h-full rounded-full flex items-center justify-center relative overflow-hidden',
              sizeConfig.dashMargin,
              theme.innerCenter,
              'shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_2px_rgba(255,255,255,0.3)]'
            )}
          >
            {/* Anillo de filigrana interior */}
            <div
              className={cn(
                'absolute inset-[2px] rounded-full border border-dashed flex items-center justify-center',
                theme.accentBorder
              )}
            >
              {/* Valor nominal central */}
              <span
                className={cn(
                  sizeConfig.fontSize,
                  theme.textColor,
                  'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-black select-none pointer-events-none'
                )}
              >
                {formattedLabel}
              </span>
            </div>
          </div>
        </button>
      </div>
    );
  }
);

Chip.displayName = 'Chip';

export default Chip;
```

---

## 2. `src/components/casino/chip-tray.tsx` (verbatim)

```tsx
'use client';

import React, { useState } from 'react';
import { Chip, ChipDenomination } from './chip';

interface ChipTrayProps {
  onBetAmountChange?: (totalBet: number) => void;
  playerBalance?: number;
}

export const ChipTray: React.FC<ChipTrayProps> = ({ onBetAmountChange, playerBalance = 2500 }) => {
  const [selectedDenomination, setSelectedDenomination] = useState<ChipDenomination>(25);
  const [currentBet, setCurrentBet] = useState<number>(0);

  const denominations: ChipDenomination[] = [5, 25, 100, 500, 1000];

  const handleChipClick = (value: number) => {
    setSelectedDenomination(value as ChipDenomination);
    const newBet = currentBet + value;
    if (newBet <= playerBalance) {
      setCurrentBet(newBet);
      onBetAmountChange?.(newBet);
    }
  };

  const handleClear = () => {
    setCurrentBet(0);
    onBetAmountChange?.(0);
  };

  return (
    <div className="w-full bg-[#161b24]/90 backdrop-blur-md border border-[#353940]/70 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
      <div className="flex items-center justify-between text-xs">
        <span className="font-heading text-[#94a3b8] uppercase tracking-wider">Bandeja de Fichas</span>
        <div className="flex items-center gap-2">
          <span className="text-[#64748b]">Apuesta activa:</span>
          <span className="font-mono font-bold text-[#e5a93c] text-sm">${currentBet}</span>
          {currentBet > 0 && (
            <button
              onClick={handleClear}
              className="text-[10px] text-[#dc2626] hover:underline uppercase ml-2 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-around gap-2 pt-1">
        {denominations.map((denom) => (
          <Chip
            key={denom}
            value={denom}
            size="md"
            isSelected={selectedDenomination === denom}
            disabled={denom > playerBalance}
            onSelectChip={handleChipClick}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 3. Mapeo con la app actual

| Elemento del doc | Equivalente hoy | Nota |
|---|---|---|
| `DENOMINATION_THEMES` (5/25/100/500/1000) | `.chipbtn.c10/.c25/.c100/.c500` (`styles.css:209`) | **Conflicto de paleta:** doc pone $5 roja, $25 esmeralda, $100 dorada, $500 púrpura, $1k ónix+dorado; hoy $10 gris pizarra, $25 verde, $100 roja, $500 púrpura. Alinear = decisión de producto (preguntar) |
| `stackCount` (apilamiento visual) | No existe | Port directo: 2-3 `span` absolute con `translate-y` + opacidad |
| `isSelected` (anillo dorado + glow) | No existe | `box-shadow: var(--gold-glow)` + `ring` ≈ borde `--gold-active` |
| `aria-pressed` / `aria-label` | Botones nativos `<button>` | Ya accesibles; añadir `aria-pressed` al seleccionar |
| `useChipsSound` (select/bet) | `sound.chips(n)` (`js/sound.js:12`) | Mapeo: select = `chips(1)`, apuesta ≥100 = `chips(2)` |
| Tamaños sm 44 / md 56 / lg 64 | `.chipbtn` fijo 58px | 58px ya supera cualquiera de los tres |
| `playerBalance` deshabilitando fichas | `p.bank` | Ídem; blackjack ya deshabilita si `denom > bank` |

## 4. Observaciones honestas sobre el doc

- El encabezado declara "diámetro ≥ 48px (WCAG 2.2 AA)" pero la variante `sm` es de **44px**: no cumple su propia afirmación de 48 (sí cumple AA real: 2.5.8 exige 24px mínimo; 44px es el nivel AAA 2.5.5). Nuestro `44px` (`--touch-target-min`) y el `.chipbtn` de 58px son coherentes con AA/AAA reales.
- `sound.chips(n)` ya reproduce el "clic más denso" para alto valor si se pasa `n` mayor; el doc lo resuelve con dos SFX distintos (`playChipSelect` / `playChipBet`).
- La bandeja del doc **acumula** apuesta por clic (`currentBet + value`) con "Limpiar"; la mesa de póker hoy usa slider + botones de acción. Decidir modelo (acumular vs slider) antes de portar.

## 5. Para implementar el pendiente "apuestas tipo fichas" (vanilla)

1. Extender `.chipbtn` con los 5 temas oficiales (o mantener la paleta actual — decidir).
2. Bandeja táctil en el tapete: click en ficha = selecciona denominación (anillo dorado + `aria-pressed`); click en el bote/stack = suma; "Limpiar" reinicia.
3. SFX ya existente (`sound.chips`), sin dependencias nuevas.
4. Mismo componente reutilizable en blackjack (apuesta) y mesa de póker (apuesta/subida).
