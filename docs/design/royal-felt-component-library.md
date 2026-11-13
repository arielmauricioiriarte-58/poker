# Royal Felt · Biblioteca de Componentes UI (HTML / Tailwind CSS)

Este documento contiene los fragmentos de código limpios, modulares y accesibles (WCAG 2.2 AA) para los componentes clave de la web y app de **Royal Felt**.

---

## 1. Fichas de Casino Táctil (`.casino-chip`)
Fichas circulares con relieve, sombra 3D, tipografía monoespaciada y área táctil optimizada (≥ 44px).

```html
<!-- Ficha de $25 (Estándar / Esmeralda) -->
<button class="relative w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-xs text-[#e7ecf3] bg-[#161b24] border-4 border-[#10b981] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.2)] hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer" aria-label="Apostar 25 fichas">
  <div class="absolute inset-1 rounded-full border border-dashed border-[#bfa356]/40 flex items-center justify-center">
    <span>$25</span>
  </div>
</button>

<!-- Ficha de $100 (High Roller / Dorado) -->
<button class="relative w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-xs text-[#10131a] bg-[#d4a017] border-4 border-[#10131a] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] hover:translate-y-[-2px] active:translate-y-[1px] transition-all cursor-pointer" aria-label="Apostar 100 fichas">
  <div class="absolute inset-1 rounded-full border border-dashed border-[#10131a]/60 flex items-center justify-center bg-gradient-to-br from-[#e5a93c] to-[#d4a017]">
    <span>$100</span>
  </div>
</button>
```

---

## 2. Naipes Vectoriales de Casino (`.casino-card`)
Cartas con esquinas redondeadas, marfil claro, borde dorado sutil y distinción de palos por color.

```html
<!-- Carta de Poker: As de Picas (A♠) -->
<div class="w-16 h-24 bg-[#f8fafc] text-[#0f172a] rounded-xl border border-[#d4a017]/50 shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between p-2 font-heading select-none">
  <div class="flex flex-col items-start leading-none">
    <span class="text-sm font-bold">A</span>
    <span class="text-xs">♠</span>
  </div>
  <div class="self-center text-xl text-[#0f172a]">♠</div>
  <div class="flex flex-col items-end leading-none rotate-180">
    <span class="text-sm font-bold">A</span>
    <span class="text-xs">♠</span>
  </div>
</div>

<!-- Carta de Corazones (♥ - Rojo Carmesí) -->
<div class="w-16 h-24 bg-[#f8fafc] text-[#dc2626] rounded-xl border border-[#d4a017]/50 shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between p-2 font-heading select-none">
  <div class="flex flex-col items-start leading-none">
    <span class="text-sm font-bold">K</span>
    <span class="text-xs">♥</span>
  </div>
  <div class="self-center text-xl text-[#dc2626]">♥</div>
  <div class="flex flex-col items-end leading-none rotate-180">
    <span class="text-sm font-bold">K</span>
    <span class="text-xs">♥</span>
  </div>
</div>
```

---

## 3. Botones de Acción de Mesa (Táctiles & Accesibles)
Botones de decisión rápida con estados de hover, active y contraste WCAG AA.

```html
<!-- Botón Primario Dorado (All-In / Subir) -->
<button class="min-h-[48px] px-6 rounded-xl bg-gradient-to-r from-[#d4a017] to-[#e5a93c] text-[#10131a] font-heading font-bold text-sm tracking-wide shadow-[0_4px_16px_rgba(212,160,23,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
  <span>ALL-IN</span>
  <span class="font-mono text-xs bg-[#10131a]/10 px-2 py-0.5 rounded">$10,000</span>
</button>

<!-- Botón Secundario / Peligro (Fold / Retirarse) -->
<button class="min-h-[48px] px-6 rounded-xl bg-[#181c22] border border-[#dc2626]/40 text-[#dc2626] font-heading font-semibold text-sm hover:bg-[#dc2626]/10 active:scale-[0.98] transition-all flex items-center justify-center">
  RETIRARSE (FOLD)
</button>
```

---

## 4. Tarjeta de Lobby para Juego (`Game Card`)
Tarjeta contenedora para la sección de modalidad en el lobby del salón privé.

```html
<div class="bg-[#181c22] border border-[#353940] hover:border-[#d4a017]/60 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all group">
  <div>
    <div class="flex items-center justify-between mb-3">
      <div class="w-10 h-10 rounded-xl bg-[#0b3d2e] border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
        <span class="material-symbols-outlined">cards</span>
      </div>
      <span class="text-xs font-mono text-[#bfa356] bg-[#10131a] px-2.5 py-1 rounded-full border border-[#bfa356]/30">Ciegas $5 / $10</span>
    </div>
    <h3 class="font-heading text-lg font-bold text-[#e7ecf3] group-hover:text-[#e5a93c] transition-colors">Texas Hold'em NL</h3>
    <p class="font-body text-xs text-[#94a3b8] mt-1 leading-relaxed">Mesa 6-max de alta estrategia con temporizador de acción y pozo dinámico.</p>
  </div>
  <div class="mt-6 flex items-center justify-between pt-4 border-t border-[#353940]/50">
    <div class="flex flex-col">
      <span class="text-[10px] text-[#64748b] uppercase tracking-wider">Buy-In Mín.</span>
      <span class="font-mono text-sm font-bold text-[#4ede9b]">$500</span>
    </div>
    <button class="min-h-[40px] px-4 rounded-lg bg-[#d4a017] text-[#10131a] font-heading font-bold text-xs hover:bg-[#e5a93c] transition-colors">
      JUGAR
    </button>
  </div>
</div>
```
