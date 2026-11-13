// Orquestación: perfil (localStorage), lobby, stats/perfil/invitar/blackjack y el bucle de póker vs 4 bots.
import {UI,AVATARS} from './ui.js';
import {Game} from './engine/game.js';
import {VARIANTS} from './engine/variants.js';
import {stats,perfil,invitar,blackjack} from './views.js';
const KEY='poker.profile.v1',ui=new UI(document.getElementById('app'));
const BOTS=[['El Tiburón','🦈'],['La Dama','👑'],['El Forajido','🤠'],['El Maestro','🎩']];
let prof=JSON.parse(localStorage.getItem(KEY)||'null');
if(prof)prof.stats??={};
const save=()=>localStorage.setItem(KEY,JSON.stringify(prof));
const go=view=>view==='lobby'?lobby():view==='stats'?uiStats():view==='perfil'?uiPerfil():view==='invitar'?uiInvitar():lobby();
function uiStats(){stats(prof,go)}
function uiPerfil(){perfil(prof,{save,go,reset:()=>{prof.bank=10000;save();uiPerfil()}})}
function uiInvitar(){invitar(prof,{save,go})}
function lobby(){ui.speed=1;ui.lobby(prof,{play:sit,reset:()=>{prof.bank=10000;save();lobby()},go})}
async function sit(id){
  if(id==='blackjack')return blackjack(prof,{save,go});
  const cfg=VARIANTS[id];
  const buyIn=cfg.buyin;
  // El buy-in se liquida al salir, no al entrar (evita pérdida al cerrar pestaña)
  const P=[{id:0,name:prof.name,avatar:prof.avatar,human:true,stack:buyIn},
    ...BOTS.map(([name,avatar],i)=>({id:i+1,name,avatar,human:false,stack:buyIn,style:.85+Math.random()*.35}))];
  const g=new Game(cfg,P,ui),st=prof.stats[id]??={h:0,n:0,w:0};let left=false;
  ui.table(g,()=>left=true);
  while(!left){
    const h=P[0];
    if(h.stack<=0){if(prof.bank<buyIn)break;prof.bank-=buyIn;h.stack=buyIn} // recompra automática
    P.slice(1).forEach(b=>{if(b.stack<=0)b.stack=buyIn});
    const before=h.stack;ui.say('');ui.newHand();await g.playHand();
    st.h++;st.n+=h.stack-before;if(h.won>0)st.w++;save();
    if(left)break;await ui.waitNext();g.dealer=(g.dealer+1)%P.length;
  }
  prof.bank+=P[0].stack-buyIn; // devuelve stack menos buy-in
  save();ui.speed=1;lobby();
}
if(prof)lobby();else ui.onboarding((name,avatar)=>{prof={name,avatar,bank:10000,stats:{}};save();lobby()});
