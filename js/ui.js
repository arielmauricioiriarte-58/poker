// UI Royal Felt: personalización, lobby, mesa de póker y navegación inferior.
// La mesa se repinta en cada sync(); las cartas nuevas llevan .deal (animación de reparto).
import {evaluate,money,cardFile} from './engine/cards.js';
import {VARIANTS,RULES} from './engine/variants.js';
import {decide} from './ai.js';
import {deal,shuffle,chips as chipSnd,win,toggle,sound,unlock,fold as sndFold,check as sndCheck,raise as sndRaise,allin as sndAllin} from './sound.js';
export const $=s=>document.querySelector(s);
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const POS=[[50,84],[10,52],[28,17],[72,17],[90,52]]; // asientos en % del tapete; 0 = jugador
export const LEGAL='AVISO LEGAL: Los juegos de este sitio utilizan dinero ficticio. No se otorgan premios ni ganancias, ya que todos los juegos son gratuitos. Juega solo por diversión.';
export const AVATARS=[['El Maestro','🎩'],['El Tiburón','🦈'],['La Dama','👑'],['El Forajido','🤠'],['El Titán','🦍'],['La Sombra','🦇'],['La Reina','👸'],['El Rey','🤴']];
const DEN=[[1000,'#d4a017'],[500,'#7c3aed'],[100,'#1f2937'],[25,'#15803d'],[5,'#dc2626'],[1,'#e2e8f0']];
function chipHTML(n){let out='',k=0;for(const [v,c] of DEN){const q=Math.floor(n/v);n%=v;if(!q||k>=3)continue;k++;const m=Math.min(q,6);out+=`<span class="stk" style="height:calc(var(--chw)*.9 + ${m*3}px)">${Array.from({length:m},(_,i)=>`<i class="chip" style="--c:${c};bottom:${i*3}px"></i>`).join('')}</span>`}return `<span class="stacks">${out}</span>`}
export function navHTML(active){const t=[['lobby','casino','LOBBY'],['stats','analytics','ESTADÍSTICAS'],['perfil','person','PERFIL'],['invitar','group_add','INVITAR']];return `<nav class="bnav"><div class="in">${t.map(([id,ic,l])=>`<button class="nbitem${id===active?' on':''}" data-nav="${id}"><span class="icon">${ic}</span><span class="lbl">${l}</span></button>`).join('')}</div></nav>`}
export function topbarHTML(kicker,title,right=''){return `<header class="topbar"><div class="in"><div class="brand"><div class="bico"><span class="icon">token</span></div><div class="btxt"><small>${kicker}</small><b>${title}</b></div></div><div class="topright" style="display:flex;align-items:center;gap:8px">${right}</div></div></header>`}
export class UI{
  constructor(root){this.root=root;this.speed=1;this.quit=false;this.pending=null;this.nc=0;this.prevBets=0;this.bj=null;this.disabled=false;document.addEventListener('pointerdown',unlock)}
  sleep(ms){return new Promise(r=>setTimeout(r,this.speed?ms:0))}
  hold(def,setup){return new Promise(res=>{this.pending={res,def};setup(v=>{this.pending=null;res(v)})})}
  release(){if(this.pending){const p=this.pending;this.pending=null;p.res(p.def)}}

  onboarding(done){
    this.root.innerHTML=`<main class="screen bare"><div class="sec-head"><span class="chip-status"><i></i>SALÓN PRIVÉ · PÓKER DE ALTA GAMA</span><h1 style="font-size:30px">Bienvenido al<br>Tapete Real</h1><p class="mut">Personaliza tu identidad antes de tomar asiento frente a los mejores jugadores de la sala.</p></div>
    <div class="mesa-box" style="border-style:solid;border-color:rgba(212,160,23,.3)"><span class="cap">BONO EXCLUSIVO</span><b style="font:700 30px var(--font-mono);color:var(--gold-primary)">$10.000</b><span class="mut" style="font-size:12px">fichas gratuitas · válidas en todas las mesas</span></div>
    <div class="field"><label for="nm">Mi nombre en mesa</label><input class="nameinput" id="nm" maxlength="16" placeholder="Ej. El Maestro" autocomplete="off"></div>
    <div class="field"><label>Elige tu máscara VIP</label><div class="avatar-grid">${AVATARS.map(([n,e],i)=>`<button class="av-cell${i?'':' on'}" data-i="${i}">${e}<small>${n}</small></button>`).join('')}</div></div>
    <button class="cta" id="go"><span class="icon" style="font-size:20px">arrow_forward</span>Continuar al Lobby</button><p class="legal">${LEGAL}</p></main>`;
    let sel=0;this.root.onclick=e=>{const b=e.target.closest('.av-cell');if(b){sel=+b.dataset.i;this.root.querySelectorAll('.av-cell').forEach(x=>x.classList.toggle('on',x===b))}
      if(e.target.closest('#go')){const v=$('#nm').value.trim();if(v){this.root.innerHTML=`<main class="screen bare" style="text-align:center"><span class="icon" style="font-size:64px;color:var(--success-win)">check_circle</span><h2>Perfil configurado.<br>Entrando a la sala…</h2></main>`;setTimeout(()=>done(v,AVATARS[sel][1]),900)}}};
  }
  lobby(p,{play,reset,go}){
    this.quit=false;this.speed=1;
    const st=Object.values(p.stats).reduce((a,s)=>({h:a.h+s.h,n:a.n+s.n,w:a.w+s.w}),{h:0,n:0,w:0});
    const bj={id:'blackjack',name:'Blackjack VIP',icon:'playing_cards',desc:'Llega a 21 · Crupier se planta en 17',info:'Mesa VIP · Mínimo $10 · Blackjack paga 3:2',buyin:0,badge:'NUEVO'};
    const games=[...Object.values(VARIANTS).map(v=>({...v,badge:v.id==='holdem'?'TOP':''})),bj];
    this.root.innerHTML=`${topbarHTML('SALÓN PRIVÉ','Game Selection Lobby',`<span class="pill"><span class="icon">monetization_on</span>${money(p.bank)}</span><span class="pill ava" style="padding:6px 10px;font-size:16px">${esc(p.avatar)}</span>`)}
    <main class="screen">
      <section class="greet"><div><div style="display:flex;align-items:center"><h2>Hola, ${esc(p.name)}</h2><span class="chip-status"><i></i>MESA LISTA</span></div><div class="sub">Tu asiento preferencial aguarda</div></div>
      <button class="balpill" id="addChips"><span class="icon">monetization_on</span><b>${money(p.bank)}</b><span class="plusbtn icon">add</span></button></section>
      <section class="sec-head"><div class="h"><span class="icon">playing_cards</span><h1>Selecciona Tu Juego</h1></div><p>Entra directo a la mesa con reparto instantáneo de cartas</p></section>
      <div class="games">${games.map(v=>`<article class="gc"><div class="gc-top"><div class="gc-id"><div class="gico"><span class="icon">${v.icon&&v.icon.length<=4?v.icon:'style'}</span></div><div class="gmeta"><h2>${esc(v.name)}${v.badge?`<span class="top-badge">${v.badge}</span>`:''}</h2><p class="desc">${esc(v.desc)}</p></div></div></div>
        <div class="infobar"><div><small>${v.id==='blackjack'?'REGLAS':'CIEGAS / ANTE'}</small><b>${esc(v.info)}</b></div>${v.buyin?`<div style="text-align:right"><small>Buy-in</small><b>${money(v.buyin)}</b></div>`:`<div style="text-align:right"><small>Min. apuesta</small><b>$10</b></div>`}</div>
        <button class="gplay" data-g="${v.id}"><span class="icon">playing_cards</span>Jugar ${esc(v.name)}</button></article>`).join('')}</div>
      <details class="panel rules"><summary><span class="icon">school</span>Reglas y ejemplos<span class="mut" style="font-weight:400"> · cartas reales del mazo</span></summary>
        ${games.map(v=>`<div class="rule"><div class="rule-head"><span class="rule-name">${esc(v.name)}</span><span class="rule-hint">${esc(RULES[v.id].egName)}</span></div><p>${esc(RULES[v.id].txt)}</p><div class="rule-cards">${RULES[v.id].eg.map(([r,s])=>`<img src="assets/cards/${cardFile(r,s)}" alt="${r===14?'A':r===13?'K':r===12?'Q':r===11?'J':r}${({s:'♠',h:'♥',d:'♦',c:'♣'})[s]}" loading="lazy">`).join('')}</div></div>`).join('')}
        <p class="legal">${LEGAL}</p></details>
      <button class="ghost" id="rs"><span class="icon">restart_alt</span>Restablecer bankroll a $10.000</button>
      <p class="legal">${LEGAL}</p></main>${navHTML('lobby')}`;
    this.root.onclick=e=>{const nav=e.target.closest('[data-nav]');if(nav)return go(nav.dataset.nav);
      const b=e.target.closest('[data-g]');if(b)return play(b.dataset.g);
      if(e.target.closest('#rs'))return reset();
      if(e.target.closest('#addChips'))return go('perfil');};
    void st;
  }
  table(g,onQuit){
    this.g=g;this.quit=false;this.seen=new Set();this.sel=new Set();this.drawing=false;this.speed=1;const c=g.cfg;
    this.root.innerHTML=`${topbarHTML(c.struct==='BJ'?'MESA VIP':({NL:'SIN LÍMITE',PL:'POT LIMIT',FL:'LÍMITE FIJO'})[c.struct],c.name,`<button class="iconbtn" id="mute" aria-label="Sonido">${sound.muted?'🔇':'🔊'}</button><span class="pill" id="bk"></span>`)}
    <main class="screen tbl"><div class="info-strip" id="info"></div><section class="table" id="tb"></section><div class="msg" id="msg"></div><div class="con" id="con"></div><p class="legal">${LEGAL}</p></main>`;
    $('.topbar .brand').insertAdjacentHTML('beforebegin',`<button class="iconbtn" id="back" aria-label="Volver"><span class="icon">arrow_back</span></button>`);
    this.root.onclick=e=>{if(e.target.closest('#mute')){e.target.closest('#mute').textContent=toggle()?'🔇':'🔊';return}
      if(e.target.closest('#back')){this.quit=true;this.speed=0;this.release();onQuit();return}
      const h=e.target.closest('[data-hc]');if(h&&this.drawing)this.toggle(+h.dataset.hc)};
  }
  say(t){const m=$('#msg');if(m)m.innerHTML=t}
  newHand(){this.seen=new Set();this.nc=0;this.prevBets=0;this.sel=new Set();if(this.speed)shuffle()}
  async sync(){this.render();await this.sleep(450)}
  async botThink(p,o){this.render();await this.sleep(500+Math.random()*500);const a=decide(this.g,p,o);
    if(a.type==='fold')sndFold();else if(a.type==='check')sndCheck();else if(a.type==='allin')sndAllin();else if(a.type==='raise'||a.type==='bet')sndRaise();else chipSnd(2);
    return a}
  card(c,hid,cls,key,attr=''){
    const fresh=!this.seen.has(key);this.seen.add(key);if(fresh)this.nc++;
    const src=hid?'assets/cards/back.svg':`assets/cards/${cardFile(c.r,c.s)}`;
    return `<div class="card ${hid?'back':''} ${cls} ${fresh?'deal':''}" ${attr}><img alt="" src="${src}"></div>`;
  }
  seat(p,i){
    const g=this.g,[x,y]=POS[i],all=p.human||p.reveal;
    const cs=p.hole.map((c,k)=>this.card(c,!all,'',`${p.id}h${k}${all?cardFile(c.r,c.s):'b'}`,p.human&&this.drawing?`data-hc="${k}"`:'').replace('class="card ',this.sel.has(k)&&p.human?'class="card sel ':'class="card ')).join('')+p.up.map(c=>this.card(c,0,'',`${p.id}u${cardFile(c.r,c.s)}`)).join('');
    const bx=x+(50-x)*.42,by=y+(40-y)*.42;
    const n=g.players.length,d=g.dealer,sb=(d+1)%n,bb=(d+2)%n;
    return `<div class="seat ${p.human?'hero':''} ${p.folded?'fold':''} ${g.turn===p.id?'turn':''} ${p.won?'win':''}" style="left:${x}%;top:${y}%">
      <div class="cards${p.hole.length>4?' many':''}">${p.folded&&!p.up.length?'':cs}</div>
      <div class="avatar">${p.avatar}${p.human&&g.turn===p.id?'<svg class="tring" viewBox="0 0 36 36" aria-hidden="true"><circle class="tr-b" cx="18" cy="18" r="15"/><circle class="tr-f" id="tr-hero" cx="18" cy="18" r="15"/></svg>':''}</div><div class="plate"><b>${esc(p.name)}</b><em>${money(p.stack)}</em></div>
      ${p.act?`<span class="act">${p.act}</span>`:''}${p.human&&!p.folded&&p.hole.length?this.handName():''}${g.dealer===i?'<span class="dbtn">D</span>':''}${i===sb?'<span class="dbtn sb">SB</span>':''}${i===bb?'<span class="dbtn bb">BB</span>':''}</div>
      ${p.bet?`<div class="bet" style="left:${bx}%;top:${by}%">${chipHTML(p.bet)}<small>${money(p.bet)}</small></div>`:''}`;
  }
  handName(){const h=this.g.players[0],e=evaluate(this.g.cfg,[...h.hole,...h.up],this.g.board);return e?`<span class="hand">${e.name.toUpperCase()}</span>`:''}
  render(){
    const g=this.g,c=g.cfg;if(!$('#tb'))return;
    $('#bk').textContent=money(g.players[0].stack);
    $('#info').textContent=`${c.blinds?'CIEGAS '+c.blinds.join('/'):'ANTE '+c.ante+' · LÍMITES '+c.limits.join('/')} · ${String(g.phase).toUpperCase()}`;
    const bets=g.players.reduce((a,q)=>a+q.bet,0),pile=g.pot-bets;
    $('#tb').innerHTML=`<div class="center"><div class="potcap">BOTE <b>${money(g.pot)}</b></div><div class="pile">${pile>0?chipHTML(pile):''}</div><div class="board">${g.board.map((x,k)=>this.card(x,0,'',`bd${k}${cardFile(x.r,x.s)}`)).join('')}</div></div>`+g.players.map((q,i)=>this.seat(q,i)).join('');
    if(this.speed){for(let k=0;k<Math.min(this.nc,6);k++)setTimeout(deal,k*90);if(bets>this.prevBets)chipSnd(2)}
    this.nc=0;this.prevBets=bets;
  }
  async collect(){const tb=$('#tb');if(!tb||!this.speed)return;const bs=tb.querySelectorAll('.bet');if(!bs.length)return;
    chipSnd(3);bs.forEach(b=>{b.style.left='50%';b.style.top='40%';b.style.opacity='0'});await this.sleep(600)}
  async payout(ws){const tb=$('#tb');if(!tb||!this.speed||!ws.length)return;const pl=tb.querySelector('.pile');if(pl)pl.style.cssText='opacity:0;transition:opacity .6s .2s';
    win();setTimeout(()=>chipSnd(5),500);const raf=f=>typeof requestAnimationFrame==='function'?requestAnimationFrame(f):setTimeout(f,16);
    ws.forEach((q,n)=>{const [x,y]=POS[this.g.players.indexOf(q)];for(let k=0;k<7;k++){const d=document.createElement('i');d.className='chip fly';d.style.cssText=`--c:${['#d4a017','#dc2626','#15803d'][k%3]};left:50%;top:42%;transition-delay:${k*60+n*40}ms`;tb.appendChild(d);raf(()=>raf(()=>{d.style.left=x+'%';d.style.top=(y-3)+'%';d.style.opacity='0'}))}});
    await this.sleep(1200)}
  askHuman(p,o){
    const g=this.g,fl=g.cfg.struct==='FL',at=v=>Math.max(o.min,Math.min(o.max,v));this.render();
    const auto=o.canCheck?{type:'check'}:{type:'fold'}; // tiempo agotado: check si es gratis, fold si no
    let secs=15;const tid=setInterval(()=>{const tr=$('#tr-hero');if(tr)tr.style.strokeDashoffset=94.2*(1-secs/15);if(--secs<=0){clearInterval(tid);if(this.pending){const r=this.pending.res;this.pending=null;r(auto)}}},1000);
    return this.hold({type:'fold'},done=>{
      const end=a=>{clearInterval(tid);done(a)};
      const bb=g.cfg.blinds?g.cfg.blinds[1]:0,
        pre=[['Mín',o.min],...(bb?[['2.5BB',at(Math.round(bb*2.5))]]:[]),['½ Bote',at(g.cur+Math.round((o.pot+o.toCall)/2))],['¾ Bote',at(g.cur+Math.round((o.pot+o.toCall)*.75))],['Bote',at(g.cur+o.pot+o.toCall)],['All-In',at(p.bet+p.stack)]],
        con=$('#con'),sl=o.canRaise&&!fl&&o.max>o.min;
      if(o.allin){con.innerHTML=`<p class="mut" style="text-align:center">All-In Poker: ve all-in o retírate</p><div class="btns"><button class="fold" data-a="fold">Retirarse</button><button class="raise" data-a="allin">All-In<small>${money(p.bet+p.stack)}</small></button></div>`;con.onclick=e=>{const b=e.target.closest('button');if(b){end({type:b.dataset.a})}};return}
      con.innerHTML=`${sl?`<div class="slpan" id="slpan"><div class="slpan-head"><button class="ghost sm" id="slx" aria-expanded="true"><span class="icon">tune</span>Ajustar apuesta</button></div><div class="slpan-body"><div class="pre">${pre.map(([n,v])=>`<button data-v="${v}">${n}<small>${money(v)}</small></button>`).join('')}</div><div class="bbadj">${bb?`<button data-bb="-1" aria-label="Quitar 1 big blind">−1BB</button>`:''}<input type="range" id="sl" min="${o.min}" max="${o.max}" value="${o.min}" aria-label="Control deslizante de apuesta" aria-valuemin="${o.min}" aria-valuemax="${o.max}" aria-valuenow="${o.min}">${bb?`<button data-bb="1" aria-label="Añadir 1 big blind">+1BB</button>`:''}</div></div></div>`:''}
      <div class="btns"><button class="fold" data-a="fold">Retirarse</button><button class="call" data-a="call">${o.canCheck?'Pasar':'Igualar<small>'+money(o.toCall)+'</small>'}</button>${o.canRaise?`<button class="raise" data-a="raise">${g.cur?'Subir a':'Apostar'}<small id="rv">${money(o.min)}</small></button>`:''}</div>`;
      const s=$('#sl');if(s)s.oninput=()=>{$('#rv').textContent=money(+s.value);s.setAttribute('aria-valuenow',+s.value)};
      con.onclick=e=>{const b=e.target.closest('button');if(!b||this.disabled)return;
        if(b.id==='slx'){const pan=$('#slpan');pan.classList.toggle('closed');b.setAttribute('aria-expanded',String(!pan.classList.contains('closed')));return}
        if(b.dataset.bb&&s){s.value=Math.max(o.min,Math.min(o.max,+s.value+bb*+b.dataset.bb));s.oninput();return}
        if(b.dataset.v){s.value=b.dataset.v;s.oninput();return}
        const a=b.dataset.a==='raise'?{type:'raise',to:s?+s.value:o.min}:{type:b.dataset.a};
        if(a.type==='fold')sndFold();else if(a.type==='check')sndCheck();else if(a.type==='allin')sndAllin();else if(a.type==='raise')sndRaise();else chipSnd(2);
        con.innerHTML='';end(a);};
    });
  }
  askDraw(p){
    this.drawing=true;this.sel=new Set();const max=p.hole.some(c=>c.r===14)?4:3;this.render();
    return this.hold(new Set(),done=>{
      const con=$('#con'),paint=()=>{con.innerHTML=`<p class="mut" style="text-align:center">Toca las cartas a descartar (máx. ${max})</p><div class="btns"><button class="call">${this.sel.size?'Cambiar '+this.sel.size:'Servido'}</button></div>`};paint();
      this.toggle=k=>{this.sel.has(k)?this.sel.delete(k):this.sel.size<max&&this.sel.add(k);this.render();paint()};
      con.onclick=e=>{if(e.target.closest('button')){this.drawing=false;const s=new Set(this.sel);this.sel=new Set();con.innerHTML='';done(s)}};
    });
  }
  waitNext(){
    this.render();this.say((this.g.result||[]).map(esc).join('<br>'));
    return this.hold(true,done=>{const con=$('#con');con.innerHTML=`<div class="btns"><button class="raise"><span style="display:flex;align-items:center;gap:8px">Siguiente mano<span class="icon">arrow_forward</span></span></button></div>`;con.onclick=e=>{if(e.target.closest('button')){con.innerHTML='';done(true)}}});
  }
}
