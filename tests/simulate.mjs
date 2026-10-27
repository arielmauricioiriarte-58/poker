// Simula manos solo con bots en las 5 variantes y verifica que las fichas se conserven.
import {Game} from '../js/engine/game.js';
import {VARIANTS} from '../js/engine/variants.js';
import {decide} from '../js/ai.js';
import {evaluate} from '../js/engine/cards.js';
const ui={sync:async()=>{},botThink:async(p,o)=>decide(ui.g,p,o)};
const c=(r,s)=>({r,s}),H=(s)=>s.split(' ').map(x=>c({A:14,K:13,Q:12,J:11,T:10}[x[0]]||+x[0],x[1]));
const t=(cfg,s)=>evaluate(cfg,H(s)).name;
console.log(t({},'Ah Kh Qh Jh Th'),'|',t({},'5h 4d 3c 2s Ah'),'|',t({},'Ah Ad Ac Kh Kd'),'|',t({short:true},'Ah 9d 8c 7s 6h'));
for(const v of Object.values(VARIANTS)){
  const P=[...Array(5)].map((_,i)=>({id:i,name:'B'+i,human:false,stack:v.buyin,style:1}));
  const g=new Game(v,P,ui);ui.g=g;const total=v.buyin*5;
  for(let h=0;h<150;h++){
    P.forEach(p=>{if(p.stack<=0)p.stack=1});const before=P.reduce((s,p)=>s+p.stack,0);
    await g.playHand();g.dealer=(g.dealer+1)%5;
    const after=P.reduce((s,p)=>s+p.stack,0);if(after!==before)throw new Error(`${v.id}: fichas ${before}→${after} en mano ${h}`);
  }
  console.log('OK',v.id,P.map(p=>p.stack).join(','));
}
