// Interfaz: onboarding, lobby y mesa. Se vuelve a pintar la mesa en cada `sync()`;
// las cartas nuevas llevan la clase .deal (animación de reparto) solo la primera vez.
import {SYM,label,evaluate,money} from './engine/cards.js';
import {VARIANTS} from './engine/variants.js';
import {decide} from './ai.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
export const AVATARS=[['El Maestro','🎩'],['El Tiburón','🦈'],['La Dama','👑'],['El Forajido','🤠']];
const POS=[[50,88],[10,56],[27,12],[73,12],[90,56]]; // asientos (% del tapete); 0 = jugador

export class UI{
  constructor(root){this.root=root;this.speed=1;this.quit=false;this.pending=null}
  sleep(ms){return new Promise(r=>setTimeout(r,this.speed?ms:0))}
  hold(def,setup){return new Promise(res=>{this.pending={res,def};setup(v=>{this.pending=null;res(v)})})}
  release(){if(this.pending){const p=this.pending;this.pending=null;p.res(p.def)}}

  onboarding(done){
    this.root.innerHTML=`<main class="screen narrow"><h1>Bienvenido al Tapete Real</h1><p class="mut">Elige tu nombre y tu máscara. Empiezas con $10.000 en fichas.</p>
    <input id="nm" maxlength="16" placeholder="Mi nombre en mesa"><div class="avs">${AVATARS.map(([n,e],i)=>`<button class="av${i?'':' on'}" data-i="${i}">${e}<small>${n}</small></button>`).join('')}</div>
    <button class="cta" id="go">Continuar al Lobby</button></main>`;
    let sel=0;this.root.onclick=e=>{const b=e.target.closest('.av');
      if(b){sel=+b.dataset.i;this.root.querySelectorAll('.av').forEach(x=>x.classList.toggle('on',x===b))}
      if(e.target.id==='go'){const v=$('#nm').value.trim();if(v)done(v,AVATARS[sel][1])}};
  }
  lobby(p,{play,reset}){
    const st=Object.values(p.stats).reduce((a,s)=>({h:a.h+s.h,n:a.n+s.n,w:a.w+s.w}),{h:0,n:0,w:0});
    this.root.innerHTML=`<main class="screen"><header class="top"><div><small class="cap">SALON PRIVÉ</small><h2>Hola, ${esc(p.name)}</h2></div><div class="pill">${p.avatar} ${money(p.bank)}</div></header>
    <section class="stats"><div><small>Manos</small><b>${st.h}</b></div><div><small>Ganancia neta</small><b class="${st.n<0?'neg':'pos'}">${st.n>=0?'+':''}${money(st.n)}</b></div><div><small>% victorias</small><b>${st.h?Math.round(100*st.w/st.h):0}%</b></div></section>
    <h1>Selecciona tu juego</h1><div class="games">${Object.values(VARIANTS).map(v=>`<article class="gc"><div class="ico">${v.icon}</div><div><h3>${v.name}</h3><p class="mut">${v.desc}</p><p class="cap">${v.info} · Buy-in ${money(v.buyin)}</p></div><button class="cta" data-g="${v.id}" ${p.bank<v.buyin?'disabled':''}>Jugar</button></article>`).join('')}</div>
    <button class="ghost" id="rs">Restablecer bankroll a $10.000</button></main>`;
    this.root.onclick=e=>{const b=e.target.closest('[data-g]');if(b)play(b.dataset.g);if(e.target.id==='rs')reset()};
  }
  table(g,onQuit){
    this.g=g;this.quit=false;this.seen=new Set();this.sel=new Set();this.drawing=false;this.speed=1;const c=g.cfg;
    this.root.innerHTML=`<main class="screen tbl"><header class="top"><button class="ghost" id="back">← Lobby</button><div style="text-align:center"><small class="cap">${{NL:'SIN LÍMITE',PL:'POT LIMIT',FL:'LÍMITE FIJO'}[c.struct]}</small><h2>${c.name}</h2></div><div class="pill" id="bk"></div></header>
    <div class="info" id="info"></div><div class="table" id="tb"></div><div class="msg" id="msg"></div><div class="con" id="con"></div></main>`;
    this.root.onclick=e=>{if(e.target.closest('#back')){this.quit=true;this.speed=0;this.release();onQuit()}
      const h=e.target.closest('[data-hc]');if(h&&this.drawing)this.toggle(+h.dataset.hc)};
  }
  say(t){const m=$('#msg');if(m)m.innerHTML=t}
  async sync(){this.render();await this.sleep(450)}
  async botThink(p,o){this.render();await this.sleep(500+Math.random()*500);return decide(this.g,p,o)}

  card(c,hid,cls,key,attr=''){
    const fresh=!this.seen.has(key);this.seen.add(key);
    return `<div class="card ${hid?'back':'hd'.includes(c.s)?'red':''} ${cls} ${fresh?'deal':''}" ${attr}>${hid?'':`<b>${label(c.r)}</b><i>${SYM[c.s]}</i>`}</div>`;
  }
  seat(p,i){
    const g=this.g,[x,y]=POS[i],all=p.human||p.reveal;
    const cs=p.hole.map((c,k)=>this.card(c,!all,'',`${p.id}h${k}${all?c.r+c.s:'b'}`,p.human&&this.drawing?`data-hc="${k}"`:'')
      .replace('class="card ',this.sel.has(k)&&p.human?'class="card sel ':'class="card ')).join('')+p.up.map(c=>this.card(c,0,'',`${p.id}u${c.r}${c.s}`)).join('');
    const bx=x+(50-x)*.4,by=y+(44-y)*.4;
    return `<div class="seat ${p.human?'hero':''} ${p.folded?'fold':''} ${g.turn===p.id?'turn':''} ${p.won?'win':''}" style="left:${x}%;top:${y}%">
      <div class="cards">${p.folded&&!p.up.length?'':cs}</div>
      <div class="plate"><span class="av">${p.avatar}</span><div><b>${esc(p.name)}</b><em>${money(p.stack)}</em></div></div>
      ${p.act?`<span class="act">${p.act}</span>`:''}${p.human&&!p.folded&&p.hole.length?this.handName():''}${g.dealer===i?'<span class="dbtn">D</span>':''}</div>
      ${p.bet?`<div class="bet" style="left:${bx}%;top:${by}%">${money(p.bet)}</div>`:''}`;
  }
  handName(){const h=this.g.players[0],e=evaluate(this.g.cfg,[...h.hole,...h.up],this.g.board);return e?`<span class="hand">${e.name.toUpperCase()}</span>`:''}
  render(){
    const g=this.g,c=g.cfg;if(!$('#tb'))return;
    $('#bk').textContent=money(g.players[0].stack);
    $('#info').textContent=`${c.blinds?'CIEGAS '+c.blinds.join('/'):'ANTE '+c.ante+' · LÍMITES '+c.limits.join('/')} · ${g.phase.toUpperCase()}`;
    $('#tb').innerHTML=`<div class="center"><div class="potcap">BOTE <b>${money(g.pot)}</b></div><div class="board">${g.board.map((x,k)=>this.card(x,0,'',`bd${k}${x.r}${x.s}`)).join('')}</div></div>`+g.players.map((p,i)=>this.seat(p,i)).join('');
  }

  // --- Entradas del jugador humano ---
  askHuman(p,o){
    const g=this.g,fl=g.cfg.struct==='FL',at=v=>Math.max(o.min,Math.min(o.max,v));this.render();
    return this.hold({type:'fold'},done=>{
      const pre=[['Mín',o.min],['½ Bote',at(g.cur+Math.round((o.pot+o.toCall)/2))],['Bote',at(g.cur+o.pot+o.toCall)],['All-In',at(p.bet+p.stack)]],con=$('#con'),sl=o.canRaise&&!fl&&o.max>o.min;
      con.innerHTML=`${sl?`<div class="pre">${pre.map(([n,v])=>`<button data-v="${v}">${n}<small>${money(v)}</small></button>`).join('')}</div><input type="range" id="sl" min="${o.min}" max="${o.max}" value="${o.min}">`:''}
      <div class="btns"><button class="fold" data-a="fold">Retirarse</button><button class="call" data-a="call">${o.canCheck?'Pasar':'Igualar<small>'+money(o.toCall)+'</small>'}</button>${o.canRaise?`<button class="raise" data-a="raise">${g.cur?'Subir a':'Apostar'}<small id="rv">${money(o.min)}</small></button>`:''}</div>`;
      const s=$('#sl');if(s)s.oninput=()=>$('#rv').textContent=money(+s.value);
      con.onclick=e=>{const b=e.target.closest('button');if(!b)return;
        if(b.dataset.v){s.value=b.dataset.v;s.oninput();return}
        con.innerHTML='';done(b.dataset.a==='raise'?{type:'raise',to:s?+s.value:o.min}:{type:b.dataset.a});};
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
    return this.hold(true,done=>{const con=$('#con');con.innerHTML=`<div class="btns"><button class="raise">Siguiente mano</button></div>`;con.onclick=e=>{if(e.target.closest('button')){con.innerHTML='';done(true)}}});
  }
}
