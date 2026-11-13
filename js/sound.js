// Sonidos sintetizados con WebAudio (sin archivos): carta, fichas, barajar y victoria.
let ctx;const AC=()=>{try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}};
export const sound={muted:localStorage.getItem('poker.mute')==='1'};
export const unlock=()=>AC();
function noise(t,dur,f,q,vol){const c=AC();if(!c||sound.muted)return;const n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();
  s.buffer=b;fl.type='bandpass';fl.frequency.value=f;fl.Q.value=q;g.gain.value=vol;s.connect(fl);fl.connect(g);g.connect(c.destination);s.start(c.currentTime+t)}
function ping(t,f,dur,vol){const c=AC();if(!c||sound.muted)return;const o=c.createOscillator(),g=c.createGain(),T=c.currentTime+t;
  o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(vol,T);g.gain.exponentialRampToValueAtTime(.0001,T+dur);o.connect(g);g.connect(c.destination);o.start(T);o.stop(T+dur)}
export const deal=()=>{noise(0,.09,3200,.8,.5);noise(.03,.05,1500,1,.3)};          // "flick" de carta
export const shuffle=()=>{for(let i=0;i<10;i++)noise(i*.055,.06,2400+Math.random()*800,.7,.25)};
export const chips=n=>{for(let i=0;i<Math.min(n,5);i++){ping(i*.06,2300+Math.random()*900,.09,.18);ping(i*.06,3300+Math.random()*600,.06,.1)}};
export const win=()=>[523,659,784,1047].forEach((f,i)=>ping(i*.11,f,.35,.15));
export const toggle=()=>{sound.muted=!sound.muted;localStorage.setItem('poker.mute',sound.muted?'1':'0');return sound.muted};
