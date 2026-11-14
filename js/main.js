// Orquestación: perfil (localStorage), lobby, stats/perfil/invitar/blackjack y el bucle de póker vs 4 bots.
import {UI,AVATARS} from './ui.js';
import {Game} from './engine/game.js';
import {VARIANTS} from './engine/variants.js';
import {stats,perfil,invitar,blackjack} from './views.js';
const KEY='poker.profile.v1',ui=new UI(document.getElementById('app'));
const BOTS=[['El Tiburón','🦈'],['La Dama','👑'],['El Forajido','🤠'],['El Maestro','🎩']];
// S-02: validar todo lo que viene de localStorage (self-XSS / JSON corrupto / valores rotos)
const AV_OK=new Set(AVATARS.map(a=>a[1]));
function validProf(p){
  if(!p||typeof p!=='object'||Array.isArray(p))return null;
  const name=String(p.name??'').replace(/[\u200B-\u200D\u202A-\u202E\u2066-\u2069\uFEFF]/g,'').replace(/[\u0000-\u001F\u007F-\u009F]/g,'').trim().slice(0,16);
  const avatar=AV_OK.has(p.avatar)?p.avatar:AVATARS[0][1];
  const bank=Number.isFinite(+p.bank)?Math.max(0,Math.min(1e12,+p.bank)):10000;
  const stats={};
  if(p.stats&&typeof p.stats==='object'&&!Array.isArray(p.stats))for(const k of [...Object.keys(VARIANTS),'blackjack']){const s=p.stats[k];
    if(s&&typeof s==='object'&&!Array.isArray(s)&&Number.isFinite(+s.h)&&Number.isFinite(+s.n)&&Number.isFinite(+s.w)&&+s.w<=+s.h)stats[k]={h:+s.h,n:+s.n,w:+s.w}}
  return {name:name||'Ariel',avatar,bank,stats};
}
let prof=null;try{prof=validProf(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{prof=null}
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
