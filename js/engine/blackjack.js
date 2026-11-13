// Blackjack VIP — lógica pura (valor de mano, zapato de 6 mazos, reglas de la casa).
// Reglas: crupier se planta en 17 · Blackjack paga 3:2 · Doblar = 1 carta extra y se planta.
import {shuffle} from './cards.js';
export const MIN_BET=10, MAX_BET=500;
// Valor de la mano (As vale 11 u 1)
export function handValue(cs){let t=0,a=0;for(const c of cs){if(c.r===14){a++;t+=11}else t+=Math.min(c.r,10)}while(t>21&&a>0){t-=10;a--}return t}
export const isPair=cs=>cs.length===2&&cs[0].r===cs[1].r;
export const isBlackjack=cs=>cs.length===2&&handValue(cs)===21;
export function shoe(decks=6){const d=[];for(let i=0;i<decks;i++)for(const s of 'shdc')for(let r=2;r<15;r++)d.push({r,s});return shuffle(d)}
// Resuelve la mano del crupier (se planta en 17)
export function playDealer(d,cards){const cs=[...cards];while(handValue(cs)<17)cs.push(d.pop());return cs}
// Resultado: 'bj' | 'win' | 'push' | 'lose'
export function settle(p,d){
  const pi=isBlackjack(p),di=isBlackjack(d);
  if(pi&&di)return 'push';
  if(pi)return 'bj';
  if(di)return 'lose';
  const pv=handValue(p),dv=handValue(d);
  if(pv>21)return 'lose';
  if(dv>21||pv>dv)return 'win';
  if(pv===dv)return 'push';
  return 'lose';
}
// Ganancia neta según resultado y apuesta
export function payout(res,bet){return res==='bj'?Math.floor(bet*1.5):res==='win'?bet:res==='push'?0:-bet}
export const total=cs=>handValue(cs);
