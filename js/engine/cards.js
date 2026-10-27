// Cartas, mazo y evaluador de manos (Hold'em, Omaha, Short Deck, Draw, Stud)
export const SYM={s:'♠',h:'♥',d:'♦',c:'♣'};
export const label=r=>({11:'J',12:'Q',13:'K',14:'A'})[r]||String(r);
export const money=n=>(n<0?'-':'')+'$'+(Math.abs(n)>=1e4?(Math.abs(n)/1e3).toFixed(1)+'K':Math.abs(n).toLocaleString('es-AR'));
export function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function makeDeck(short){const d=[];for(const s of 'shdc')for(let r=short?6:2;r<15;r++)d.push({r,s});return shuffle(d)}

const NAMES=['Carta alta','Pareja','Doble pareja','Trío','Escalera','Color','Full House','Póker','Escalera de color'];
// Fuerza por categoría. En Short Deck el color vence al full y el trío a la escalera.
const ORD=[0,1,2,3,4,5,6,7,8], ORD_S=[0,1,2,4,3,6,5,7,8];

function eval5(c,short){
  const rs=c.map(x=>x.r).sort((a,b)=>b-a), fl=c.every(x=>x.s===c[0].s), cnt={};
  rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);
  const g=Object.entries(cnt).map(([r,n])=>[+r,n]).sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
  let st=0; // alto de la escalera (rueda A-2-3-4-5; en Short Deck A-6-7-8-9)
  if(g.length===5){if(rs[0]-rs[4]===4)st=rs[0];else if(rs[0]===14&&rs[1]===(short?9:5)&&rs[4]===(short?6:2))st=rs[1]}
  const cat=st&&fl?8:g[0][1]===4?7:g[0][1]===3&&g[1][1]===2?6:fl?5:st?4:g[0][1]===3?3:g[0][1]===2?(g[1][1]===2?2:1):0;
  const k=(st?[st]:g.flatMap(([r,n])=>Array(n).fill(r))).reduce((a,v)=>a*15+v,0);
  return {cat,score:(short?ORD_S:ORD)[cat]*1e7+k,name:cat===8&&st===14?'Escalera real':NAMES[cat]};
}
function* combos(a,k,s=0,cur=[]){if(cur.length===k){yield cur;return}for(let i=s;i<a.length;i++)yield* combos(a,k,i+1,[...cur,a[i]])}

// Mejor mano de 5 cartas. Omaha: exactamente 2 de la mano + 3 del tablero.
export function evaluate(cfg,cards,board=[]){
  let best=null;const test=h=>{const e=eval5(h,cfg.short);if(!best||e.score>best.score){best=e;best.cards=h}};
  if(cfg.omaha){if(board.length>=3)for(const a of combos(cards,2))for(const b of combos(board,3))test([...a,...b])}
  else{const all=[...cards,...board];if(all.length>=5)for(const h of combos(all,5))test(h)}
  return best;
}
// Agrupa por repetición (manos incompletas y orden de cartas visibles en Stud)
export const partial=cs=>{const c={};cs.forEach(x=>c[x.r]=(c[x.r]||0)+1);return Object.entries(c).map(([r,n])=>[+r,n]).sort((a,b)=>b[1]-a[1]||b[0]-a[0])};
export const pScore=cs=>partial(cs).reduce((a,[r,n])=>a*100+n*15+r,0);
