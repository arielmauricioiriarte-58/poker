content = open(r"C:\Users\pc\Desktop\poker\table.html", "r", encoding="utf-8").read()
script = '''
  <!-- Motor del juego conectado -->
  <script type="module">
    import {UI} from './js/ui.js';
    import {Game} from './js/engine/game.js';
    import {VARIANTS} from './js/engine/variants.js';
    const root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);
    const ui = new UI(root);
    const cfg = VARIANTS['holdem'];
    const P = [
      {id:0, name:'ReyDeDiamantes', avatar:'👑', human:true, stack:cfg.buyin, style:1},
      {id:1, name:'El Tiburón', avatar:'🦈', human:false, stack:cfg.buyin, style:.9},
      {id:2, name:'La Dama', avatar:'👑', human:false, stack:cfg.buyin, style:.8},
      {id:3, name:'El Forajido', avatar:'🤠', human:false, stack:cfg.buyin, style:.95},
      {id:4, name:'El Maestro', avatar:'🎩', human:false, stack:cfg.buyin, style:.85},
    ];
    const g = new Game(cfg, P, ui);
    ui.table(g, () => console.log('Salió del juego'));
    g.playHand();
  </script>
'''
content = content.replace('</body></html>', script + '</body></html>')
open(r"C:\Users\pc\Desktop\poker\table.html", "w", encoding="utf-8").write(content)
print('inserted script')
