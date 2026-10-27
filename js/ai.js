// IA básica: equity por Monte Carlo (juegos con tablero) o heurística (Draw/Stud) + estilo propio.
import {makeDeck,shuffle,evaluate,partial} from './engine/cards.js';
const CAT=[.2,.45,.62,.72,.78,.82,.9,.97,1];
function equity(g,p,N=70){
  const cfg=g.cfg,used=new Set([...p.hole,...g.board].map(c=>c.r+c.s)),pool=makeDeck(cfg.short).filter(c=>!used.has(c.r+c.s)),opp=g.live.length-1;let w=0;
  for(let i=0;i<N;i++){
    const d=shuffle(pool.slice()),need=5-g.board.length,bd=[...g.board,...d.slice(0,need)],mine=evaluate(cfg,p.hole,bd).score;let k=need,win=1;
    for(let o=0;o<opp;o++){if(evaluate(cfg,d.slice(k,k+cfg.hole),bd).score>mine){win=0;break}k+=cfg.hole}
    w+=win;
  }
  return Math.pow(w/N,1/(1+.25*(opp-1)));
}
function strength(g,p){
  if(g.cfg.board)return equity(g,p);
  const cs=[...p.hole,...p.up],e=evaluate(g.cfg,cs);
  if(e)return CAT[e.cat]+(e.cat?0:(Math.max(...cs.map(c=>c.r))-8)/60);
  const gr=partial(cs);return gr[0][1]>=3?.78:gr[0][1]===2?.45+gr[0][0]/60:.2+gr[0][0]/50;
}
export function decide(g,p,o){
  const s=Math.min(1,strength(g,p)*(p.style||1)+(Math.random()-.5)*.12),odds=o.toCall/((g.pot+o.toCall)||1);
  const size=()=>g.cfg.struct==='FL'?o.min:Math.max(o.min,Math.min(o.max,g.cur+Math.round(g.pot*(.5+Math.random()*.5))));
  if(o.canCheck)return o.canRaise&&(s>.66||Math.random()<.05)?{type:'raise',to:size()}:{type:'call'};
  if(o.canRaise&&s>.82)return {type:'raise',to:size()};
  return s>odds+.06||Math.random()<.04?{type:'call'}:{type:'fold'};
}
// Descarte (Draw): conserva pares/tríos; con mano hecha (escalera o mejor) se planta
export function discard(p){
  const e=evaluate({},p.hole);if(e&&e.cat>=4)return new Set();
  const keep=new Set(partial(p.hole).filter(g=>g[1]>1).map(g=>g[0]));
  let idx=p.hole.map((c,k)=>k).filter(k=>!keep.has(p.hole[k].r));
  if(!keep.size)idx=idx.slice(2); // sin pareja: conserva las 2 más altas (mano ordenada desc.)
  return new Set(idx.slice(0,3));
}
