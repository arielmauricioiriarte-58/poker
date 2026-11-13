// Vistas secundarias Royal Felt: estadísticas, perfil, invitar y Blackjack VIP.
import {money,cardFile} from './engine/cards.js';
import {VARIANTS} from './engine/variants.js';
import {AVATARS,LEGAL,navHTML,topbarHTML,$,esc} from './ui.js';
import {handValue,isBlackjack,shoe,playDealer,settle,payout,MIN_BET,MAX_BET} from './engine/blackjack.js';
import {deal,chips as chipSnd,win,unlock} from './sound.js';
const ALL={...VARIANTS,blackjack:{name:'Blackjack VIP'}};
function tot(p){return Object.values(p.stats).reduce((a,s)=>({h:a.h+s.h,n:a.n+s.n,w:a.w+s.w}),{h:0,n:0,w:0})}
export function stats(p,go){
  const t=tot(p),net100=t.h?Math.round(t.n/t.h*100):0,wr=t.h?Math.round(100*t.w/t.h):0;
  const rows=Object.entries(ALL).filter(([id,v])=>p.stats[id]).map(([id,v])=>({id,name:v.name,...p.stats[id]}));
  const maxAbs=Math.max(1,...rows.map(r=>Math.abs(r.n)));
  $('#app').innerHTML=`${topbarHTML('SALÓN PRIVÉ','Mis Estadísticas',`<span class="pill"><span class="icon">monetization_on</span>${money(p.bank)}</span>`)}
  <main class="screen">
    <div class="sec-head"><div class="h"><span class="icon">analytics</span><h1>Mis Estadísticas</h1></div><p>Rendimiento real de tu cuenta (fichas ficticias)</p></div>
    <div class="pgrid">
      <div class="metric"><small>Manos jugadas</small><b>${t.h}</b><span class="sub2">${rows.length} variante(s)</span></div>
      <div class="metric"><small>Ganancia neta</small><b class="${t.n<0?'neg':'pos'}">${t.n>=0?'+':''}${money(t.n)}</b><span class="sub2">${money(t.n)} vs buy-ins</span></div>
      <div class="metric"><small>% victorias</small><b>${wr}%</b><span class="sub2">${t.w} ganadas / ${t.h}</span></div>
      <div class="metric"><small>Net / 100 manos</small><b class="${net100<0?'neg':'pos'}">${net100>=0?'+':''}${money(net100)}</b><span class="sub2">media por sesión larga</span></div>
    </div>
    <section class="panel"><h3><span class="icon">tune</span>Variantes de Juego <span class="mut" style="font-weight:400">(volumen y neto)</span></h3>
      ${rows.length?rows.sort((a,b)=>b.h-a.h).map(r=>`<div class="brow"><span class="blabel">${esc(r.name)}</span><span class="btrack"><span class="bfill${r.n<0?' negfill':''}" style="width:${Math.max(4,Math.round(Math.abs(r.n)/maxAbs*100))}%"></span></span><span class="bval ${r.n<0?'neg':'pos'}">${r.n>=0?'+':''}${money(r.n)}</span></div>`).join(''):'<p class="mut">Aún no hay manos registradas. Juega tu primera partida.</p>'}
    </section>
    <div class="mesa-box" style="border-style:solid;border-color:rgba(78,222,163,.25)"><span class="cap">BANKROLL ACTUAL</span><b style="font:700 30px var(--m);color:var(--win)">${money(p.bank)}</b><span class="mut" style="font-size:12px">Se actualiza al instante al cambiar de fichas en la mesa</span></div>
    <p class="legal">${LEGAL}</p></main>${navHTML('stats')}`;
  $('#app').onclick=e=>{const n=e.target.closest('[data-nav]');if(n)go(n.dataset.nav)};
}
export function perfil(p,{save,go,reset}){
  const t=tot(p),rank=Math.floor(t.h/25)+1;
  $('#app').innerHTML=`${topbarHTML('SALÓN PRIVÉ','Personalización',`<span class="pill"><span class="icon">monetization_on</span>${money(p.bank)}</span>`)}
  <main class="screen">
    <div class="sec-head"><div class="h"><span class="icon">badge</span><h1>Mi Nombre en Mesa</h1></div><p>Visible para tus rivales en apuestas y clasificaciones</p></div>
    <div class="field"><label for="nm2">Mi nombre en mesa</label><input class="nameinput" id="nm2" maxlength="16" value="${esc(p.name)}" autocomplete="off"></div>
    <div class="field"><label>Elige tu máscara VIP</label><div class="avatar-grid">${AVATARS.map(([n,e])=>`<button class="av-cell${p.avatar===e?' on':''}" data-av="${e}">${e}<small>${n}</small></button>`).join('')}</div></div>
    <span class="rankbadge"><span class="icon">military_tech</span>Rango: Aspirante Nivel ${rank} · ${t.h} manos</span>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="cta gold slim" id="sv"><span class="icon">save</span>Guardar perfil</button><button class="ghost" id="rs"><span class="icon">restart_alt</span>Restablecer bankroll</button></div>
    <p class="legal">${LEGAL}</p></main>${navHTML('perfil')}`;
  $('#app').onclick=e=>{const nav=e.target.closest('[data-nav]');if(nav)return go(nav.dataset.nav);
    const a=e.target.closest('[data-av]');if(a){p.avatar=a.dataset.av;save();return perfil(p,{save,go,reset})}
    if(e.target.closest('#sv')){const v=$('#nm2').value.trim();if(v){p.name=v;save()}go('lobby');return}
    if(e.target.closest('#rs'))reset()};
}
export function invitar(p,{save,go}){
  if(!p.mesa){p.mesa='RF-'+Math.random().toString(36).slice(2,6).toUpperCase();save()}
  const link=`${location.origin}${location.pathname}#mesa=${p.mesa}`;
  $('#app').innerHTML=`${topbarHTML('SALÓN PRIVÉ','Invitar Amigos',`<span class="pill"><span class="icon">monetization_on</span>${money(p.bank)}</span>`)}
  <main class="screen">
    <div class="sec-head"><div class="h"><span class="icon">group_add</span><h1>Tu Mesa Privada</h1></div><p>Comparte tu código para que un amigo entre a tu mesa en Royal Felt</p></div>
    <div class="mesa-box"><span class="cap">CÓDIGO DE MESA</span><div class="mesa-code">${p.mesa}</div><button class="cta gold slim" id="sh"><span class="icon">share</span>Compartir invitación</button><button class="ghost" id="cp"><span class="icon">content_copy</span>Copiar enlace</button></div>
    <div class="panel"><h3><span class="icon">help</span>¿Cómo funciona?</h3><ol class="howto"><li>Comparte tu código o enlace con un amigo.</li><li>Él abre Royal Felt en su dispositivo y entra a tu mesa.</li><li>Ambos juegan contra la sala en partidas privadas (fichas ficticias).</li></ol></div>
    <p class="legal">${LEGAL}</p></main>${navHTML('invitar')}`;
  $('#app').onclick=async e=>{const nav=e.target.closest('[data-nav]');if(nav)return go(nav.dataset.nav);
    if(e.target.closest('#cp')){try{await navigator.clipboard.writeText(link);e.target.closest('#cp').innerHTML='<span class="icon">check</span>Enlace copiado'}catch{}return}
    if(e.target.closest('#sh')){if(navigator.share){try{await navigator.share({title:'Mesa Royal Felt',text:`Únete a mi mesa privada ${p.mesa} en Royal Felt`,url:link})}catch{}}else{try{await navigator.clipboard.writeText(link)}catch{}}}};
}
// Mesa de Blackjack VIP: apuesta → reparto → pedir/plantarse/doblar → liquidación. Crupier se planta en 17.
export function blackjack(p,{save,go}){
  let st={phase:'bet',bet:0,lastBet:MIN_BET,shoe:shoe(),p:[],d:[],res:null,delta:0};
  function render(){
    const pot=st.bet;
    const cardEl=(c,hid)=>`<div class="card${hid?' back':''}" style="--cw:clamp(44px,13vw,64px)"><img alt="" src="assets/cards/${hid?'back':cardFile(c.r,c.s)}"></div>`;
    const pT=handValue(st.p),dT=handValue(st.d),hideHole=st.phase==='play';
    $('#app').innerHTML=`${topbarHTML('MESA VIP','Blackjack',`<span class="pill"><span class="icon">monetization_on</span>${money(p.bank)}</span>`)}
    <main class="screen">
      <div class="bj-felt">
        <div class="bj-insc"><span class="l1">Blackjack Paga 3 a 2</span><span class="l2">El crupier debe pedir con 16 y plantarse en 17</span></div>
        <div class="bj-shoe"><span class="icon">view_carousel</span>Zapato: 6 Mazos</div>
        <div class="bj-zone"><div class="bj-label">CRUPIER <span class="bj-total">${st.p.length?(hideHole?handValue([st.d[0]]):dT):'—'}</span></div>
          <div class="bj-hand">${st.d.map((c,i)=>cardEl(c,hideHole&&i===1)).join('')||'<span class="mut">Esperando apuesta…</span>'}</div></div>
        <div class="bj-divider"></div>
        <div class="bj-zone"><div class="bj-label">TU MANO <span class="bj-total gold">${st.p.length?pT:'—'}</span></div>
          <div class="bj-hand">${st.p.map(c=>cardEl(c,false)).join('')||'<span class="mut">Haz tu apuesta para repartir</span>'}</div></div>
      </div>
      ${st.phase==='bet'?`<div class="panel bj-panel"><div class="bj-betrow"><div><small class="uc">Apuesta</small><div class="bj-betamount">${money(st.bet)}</div></div><div class="bj-quick"><button class="ghost sm" data-min="1">Mín ${money(MIN_BET)}</button><button class="ghost sm" data-clr="1">Limpiar</button>${st.lastBet>0?`<button class="ghost sm" data-reb="1">Reapostar ${money(st.lastBet)}</button>`:''}</div></div>
        <div class="bj-chips">${[10,25,100,500].map(v=>`<button class="chipbtn c${v}" data-chip="${v}" ${p.bank<v||st.bet+v>MAX_BET?'disabled':''}>${v>=100?v/100+'00':v}</button>`).join('')}</div>
        <button class="cta ${st.bet<MIN_BET?'disabled look-off':''}" id="deal" ${st.bet<MIN_BET?'disabled':''}><span class="icon">casino</span>Repartir cartas</button>
        <div class="bj-rules"><span class="icon">info</span>Mín ${money(MIN_BET)} · Máx ${money(MAX_BET)} · Blackjack paga 3:2 · Doblar = 1 carta y plantarse</div></div>`
      :st.phase==='play'?`<div class="panel bj-panel"><div class="bj-betrow"><div><small class="uc">EN JUEGO · Apuesta</small><div class="bj-betamount gold">${money(st.bet)}</div></div></div>
        <div class="btns bj-actions"><button class="call" id="hit"><span class="icon">add</span>PEDIR<small>toma una carta</small></button><button class="ghost" id="stand"><span class="icon">front_hand</span>PLANTARSE<small>conservar ${pT}</small></button>${st.p.length===2&&p.bank>=st.bet?`<button class="raise" id="dbl"><span class="icon">exposure_plus_1</span>DOBLAR<small>${money(st.bet*2)}</small></button>`:''}</div></div>`
      :`<div class="panel bj-panel"><div class="bj-result ${st.res==='lose'?'lose':st.res==='push'?'push':'win'}">${({bj:'¡BLACKJACK! Pagado 3:2',win:'¡Ganaste la mano!',push:'Empate: apuesta devuelta',lose:'Perdiste la mano'})[st.res]}</div><div class="bj-betrow"><div><small class="uc">RESOLUCIÓN</small><div class="bj-betamount ${st.delta<0?'neg':'pos'}">${st.delta>=0?'+':''}${money(st.delta)}</div></div></div>
        <div class="btns"><button class="call" id="again"><span class="icon">replay</span>NUEVA MANO</button><button class="ghost" id="lobby"><span class="icon">casino</span>Lobby</button></div></div>`}
      <details class="panel bj-guide"><summary><span class="icon">school</span>Reglas y estrategia</summary><ol class="howto"><li>Supera al crupier sin pasarte de 21. As vale 1 u 11; J/Q/K valen 10.</li><li>Si te pasas de 21 (bust), pierdes automáticamente.</li><li>Crupier pide hasta sumar 17 y se planta en 17+.</li><li>Tu Blackjack natural (As+10) paga 3:2.</li></ol></details>
      <p class="legal">${LEGAL}</p></main>`;
  }
  function payoutApply(res){
    const delta=res==='bj'?Math.floor(st.bet*1.5):res==='win'?st.bet:res==='push'?0:-st.bet;
    p.bank+=st.bet+delta; // devuelve apuesta + resultado neto
    st.delta=delta;
    const s=p.stats.blackjack??={h:0,n:0,w:0};s.h++;s.n+=delta;if(res==='win'||res==='bj')s.w++;
    save();
  }
  function finish(res){st.res=res;st.phase='done';payoutApply(res);if(res==='win'||res==='bj')win();deal(2);render()}
  function settleNow(){st.d=playDealer(st.shoe,st.d);finish(settle(st.p,st.d))}
  function dealNow(){
    st.lastBet=st.bet;p.bank-=st.bet;save();
    st.shoe=shoe();st.p=[st.shoe.pop(),st.shoe.pop()];st.d=[st.shoe.pop(),st.shoe.pop()];st.res=null;
    deal(4);chipSnd(2);
    const pb=isBlackjack(st.p);
    if(pb||isBlackjack(st.d)){st.d=playDealer(st.shoe,st.d);return finish(settle(st.p,st.d))}
    if(handValue(st.p)===21)return settleNow();
    st.phase='play';render();
  }
  function stand(){st.d=playDealer(st.shoe,st.d);finish(settle(st.p,st.d))}
  render();
  $('#app').onclick=e=>{
    const add=v=>{if(p.bank>=v&&st.bet+v<=MAX_BET){st.bet+=v;render()}};
    if(e.target.closest('#bjExit')||e.target.closest('#lobby'))return go('lobby');
    const back=e.target.closest('[data-back="1"]');if(back)return go('lobby');
    const c=e.target.closest('[data-chip]');if(c)return add(+c.dataset.chip);
    if(e.target.closest('[data-min]')){st.bet=Math.min(MIN_BET,p.bank);render();return}
    if(e.target.closest('[data-clr]')){st.bet=0;render();return}
    if(e.target.closest('[data-reb]')){st.bet=Math.min(st.lastBet,p.bank);render();return}
    if(e.target.closest('#deal'))return dealNow();
    if(e.target.closest('#hit')){st.p.push(st.shoe.pop());deal(1);if(handValue(st.p)>21)return finish('lose');if(handValue(st.p)===21)return stand();render();return}
    if(e.target.closest('#stand'))return stand();
    if(e.target.closest('#dbl')){if(p.bank>=st.bet){p.bank-=st.bet;save();st.bet*=2;st.p.push(st.shoe.pop());deal(2);render();return finish(handValue(st.p)>21?'lose':settle(st.p,playDealer(st.shoe,st.d)))}return}
    if(e.target.closest('#again')){st.phase='bet';st.bet=Math.min(st.lastBet,p.bank);if(st.bet>p.bank)st.bet=0;st.p=[];st.d=[];st.res=null;render();return}
  };
  // back arrow in topbar para salir al lobby
  const tb=$('.topbar .in');tb.insertAdjacentHTML('afterbegin','<button class="iconbtn" data-back="1" aria-label="Volver al Lobby"><span class="icon">arrow_back</span></button>');
}
