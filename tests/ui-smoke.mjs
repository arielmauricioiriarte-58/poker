// Prueba de humo de la UI con jsdom (requiere: npm i jsdom). Juega manos automáticamente en las 5 variantes.
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<div id="app"></div>',{url:'http://localhost/'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage});
const orig=globalThis.setTimeout;globalThis.setTimeout=(f,ms)=>orig(f,Math.min(ms,5)); // acelera animaciones
localStorage.setItem('poker.profile.v1',JSON.stringify({name:'Ariel',avatar:'🎩',bank:10000,stats:{}}));
await import('../js/main.js');
const $=s=>document.querySelector(s),sleep=ms=>new Promise(r=>orig(r,ms));
const click=el=>el.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
for(const id of ['holdem','omaha','short','draw','stud']){
  click($(`[data-g="${id}"]`));let hands=0,t0=Date.now();
  while(hands<3&&Date.now()-t0<30000){
    await sleep(20);const b=$('#con button.call')||$('#con button.raise');
    if(b){if(b.textContent.includes('Siguiente'))hands++;click(b)}
  }
  if(!document.querySelectorAll('.seat').length)throw new Error('sin asientos en '+id);
  console.log('OK',id,'manos jugadas:',hands,'| mensaje:',$('#msg').textContent.slice(0,50));
  click($('#back'));await sleep(300);
}
console.log('Bankroll final:',JSON.parse(localStorage.getItem('poker.profile.v1')).bank);process.exit(0);
