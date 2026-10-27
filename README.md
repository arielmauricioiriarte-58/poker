# Royal Felt · Póker personal (5 variantes)

Web app sin dependencias (HTML + CSS + JavaScript ES Modules), basada en el sistema de diseño "Royal Felt" de Stitch.
Juegas contra 4 bots. Variantes: **Texas Hold'em** (NL), **Omaha** (Pot-Limit), **Short Deck 6+** (NL), **5-Card Draw** y **7-Card Stud** (límite fijo).

## Ejecutar
Los módulos ES requieren un servidor local (no abrir con doble clic):

    cd poker
    python3 -m http.server 8000      # o: npx serve
    # abrir http://localhost:8000

Las fuentes (Space Grotesk, Manrope, JetBrains Mono) se cargan desde Google Fonts; sin internet se usan fuentes del sistema.
Para jugar desde el celular en la misma red: `http://<IP-de-tu-PC>:8000`.

## Hosting Node.js (Hostinger, etc.)
Subir el repo a GitHub e importarlo: se detecta `package.json`; comando de inicio `npm start` (usa la variable PORT). Local: `npm install && npm start` → http://localhost:3000

## Estructura
    index.html            punto de entrada
    css/styles.css        tokens y componentes Royal Felt (vidrio, oro, fieltro)
    js/engine/cards.js    mazo, evaluador de manos (incl. reglas Omaha y Short Deck)
    js/engine/variants.js configuración declarativa de cada variante (agregar una = agregar un objeto)
    js/engine/game.js     una mano completa: reparto, apuestas NL/PL/FL, descarte, Stud, botes laterales
    js/ai.js              bots: equity Monte Carlo + estilo aleatorio; descarte para Draw
    js/ui.js              onboarding, lobby, mesa, consola de apuestas (presets, slider)
    js/main.js            perfil/bankroll en localStorage y bucle de manos
    tests/simulate.mjs    node tests/simulate.mjs → 150 manos por variante verificando conservación de fichas
    tests/ui-smoke.mjs    prueba de UI con jsdom (npm i jsdom)
    docs/diseno/          DESIGN.md y capturas de referencia

## Notas
- Bankroll inicial $10.000, buy-in por mesa según variante; el bot sin fichas recompra solo. Las estadísticas (manos, ganancia neta, % victorias) se guardan en el navegador.
- Los avatares son emojis (el zip solo trae URLs remotas de imágenes, no archivos). Para usar imágenes propias, cambia `AVATARS`/`BOTS` en `ui.js`/`main.js`.
- Simplificaciones: sin temporizador de turno, bring-in de Stud con orden de palos simple, límite de 4 subidas por ronda en límite fijo.
