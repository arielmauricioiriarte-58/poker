// Motor de una mano: reparto, rondas de apuestas, descarte, showdown y botes laterales.
// Independiente de la UI: solo habla con `ui` (sync, askHuman, botThink, askDraw).
import {makeDeck,evaluate,pScore,money} from './cards.js';
import {discard} from '../ai.js';
const SO='cdhs';
export class Game{
  constructor(cfg,players,ui){Object.assign(this,{cfg,players,ui,dealer:0,board:[],pot:0,cur:0,last:0,phase:'',turn:-1,result:null,limit:0,raises:0})}
  get live(){return this.players.filter(p=>!p.folded)}
  get able(){return this.players.filter(p=>!p.folded&&!p.allIn)}
  post(p,a){a=Math.min(a,p.stack);p.stack-=a;p.bet+=a;p.total+=a;this.pot+=a;if(!p.stack)p.allIn=true}
  deal(p,n,up){for(let i=0;i<n;i++)(up?p.up:p.hole).push(this.deck.pop())}

  async playHand(){
    const {cfg,players:P,ui}=this,n=P.length,D=i=>(this.dealer+i)%n,L=cfg.limits||[0,0];
    this.deck=makeDeck(cfg.short);this.board=[];this.pot=0;this.result=null;this.cur=0;this.turn=-1;
    P.forEach(p=>Object.assign(p,{hole:[],up:[],folded:p.stack<=0,allIn:false,bet:0,total:0,reveal:false,hand:null,act:'',won:0}));
    if(cfg.blinds){this.post(P[D(1)],cfg.blinds[0]);this.post(P[D(2)],cfg.blinds[1])}
    else this.live.forEach(p=>this.post(p,cfg.ante));
    if(cfg.board){ // Hold'em / Omaha / Short Deck
      P.forEach(p=>this.deal(p,cfg.hole));this.phase='Pre-flop';await ui.sync();
      this.cur=this.last=cfg.blinds[1];await this.street('Pre-flop',D(3),0,true);
      for(const [k,nm] of [[3,'Flop'],[1,'Turn'],[1,'River']]){
        if(this.live.length<2)break;
        this.board.push(...this.deck.splice(-k));await ui.sync();await this.street(nm,D(1),0);
      }
    }else if(cfg.draw){ // 5-Card Draw
      P.forEach(p=>this.deal(p,5));await ui.sync();
      await this.street('Apuestas 1',D(1),L[0]);
      if(this.live.length>1){await this.drawPhase(D);await this.street('Apuestas 2',D(1),L[1])}
    }else{ // 7-Card Stud
      P.forEach(p=>{this.deal(p,2);this.deal(p,1,true)});await ui.sync();
      const low=this.live.reduce((a,b)=>(a.up[0].r-b.up[0].r||SO.indexOf(a.up[0].s)-SO.indexOf(b.up[0].s))<0?a:b);
      this.cur=0;this.last=L[0];this.post(low,cfg.bringIn);this.cur=low.bet;
      await this.street('3ª calle',(P.indexOf(low)+1)%n,L[0],true);
      for(let s=4;s<=7&&this.live.length>1;s++){
        this.live.forEach(p=>this.deal(p,1,s<7));await ui.sync();
        const first=this.live.reduce((a,b)=>pScore(b.up)>pScore(a.up)?b:a);
        await this.street(s+'ª calle',P.indexOf(first),s<5?L[0]:L[1]);
      }
    }
    await this.showdown();
  }
  async street(name,first,limit,keep){
    this.phase=name;this.limit=limit;if(!keep){this.cur=0;this.last=this.cfg.blinds?this.cfg.blinds[1]:limit}
    await this.round(first);
  }
  async drawPhase(D){
    this.phase='Descarte';
    for(let i=1;i<=this.players.length;i++){
      const p=this.players[D(i)];if(p.folded)continue;this.turn=p.id;
      const idx=p.human?await this.ui.askDraw(p):discard(p);
      p.hole=p.hole.filter((_,k)=>!idx.has(k));this.deal(p,idx.size);
      p.hole.sort((a,b)=>b.r-a.r);p.act=idx.size?`Cambia ${idx.size}`:'Servido';await this.ui.sync();
    }
    this.turn=-1;this.players.forEach(p=>{if(!p.folded)p.act=''});
  }
  // Opciones legales para el jugador según la estructura (NL / PL / FL)
  options(p){
    const S=this.cfg.struct,full=p.bet+p.stack,toCall=Math.min(this.cur-p.bet,p.stack);let min,max,can=full>this.cur;
    if(S==='FL'){const t=this.cur<this.limit?this.limit:this.cur+this.limit;min=max=Math.min(t,full);can=can&&this.raises<4}
    else{min=Math.min(this.cur+Math.max(this.last,this.cfg.blinds[1]),full);max=S==='NL'?full:Math.min(full,this.cur+this.pot+(this.cur-p.bet));max=Math.max(max,min)}
    return {toCall,min,max,canRaise:can,canCheck:this.cur<=p.bet,pot:this.pot};
  }
  async round(first){
    const P=this.players,n=P.length;this.raises=0;P.forEach(p=>{if(!p.folded&&!p.allIn)p.act=''});
    let pend=new Set(this.able.map(p=>p.id));
    if(this.able.length<2&&this.able.every(p=>p.bet>=this.cur))pend.clear();
    for(let i=first%n,guard=0;pend.size&&this.live.length>1&&guard++<400;i=(i+1)%n){
      const p=P[i];if(!pend.has(p.id)||p.folded||p.allIn){pend.delete(p.id);continue}
      this.turn=p.id;const o=this.options(p),before=this.cur;
      const a=p.human?await this.ui.askHuman(p,o):await this.ui.botThink(p,o);
      if(a.type==='fold'){p.folded=true;p.act='Se retiró'}
      else if(a.type==='raise'&&o.canRaise){
        const to=Math.max(o.min,Math.min(a.to,o.max));this.post(p,to-p.bet);
        if(p.bet>this.cur){this.last=Math.max(this.last,p.bet-this.cur);this.cur=p.bet;this.raises++}
        p.act=(before?'Sube a ':'Apuesta ')+money(p.bet);
      }else{this.post(p,o.toCall);p.act=o.toCall?'Iguala '+money(o.toCall):'Pasa'}
      if(p.allIn)p.act='All-in';
      pend.delete(p.id);
      if(this.cur>before)pend=new Set(this.able.filter(q=>q!==p).map(q=>q.id));
      await this.ui.sync();
    }
    this.turn=-1;P.forEach(p=>p.bet=0);
  }
  // Showdown con botes laterales; el resto impar va al primer ganador
  async showdown(){
    const P=this.players,live=this.live;this.phase='Showdown';
    if(live.length>1)live.forEach(p=>{p.reveal=true;p.hand=evaluate(this.cfg,[...p.hole,...p.up],this.board)});
    const tot=P.filter(p=>p.total>0),levels=[...new Set(tot.map(p=>p.total))].sort((a,b)=>a-b);let prev=0;
    for(const Lv of levels){
      const pot=tot.reduce((s,p)=>s+Math.min(p.total,Lv)-Math.min(p.total,prev),0);let el=live.filter(p=>p.total>=Lv);prev=Lv;
      if(!el.length){const mx=Math.max(...live.map(p=>p.total));el=live.filter(p=>p.total===mx)} // dinero muerto: va al mejor activo
      if(!pot)continue;
      const top=el.length>1?Math.max(...el.map(p=>p.hand.score)):0,w=el.filter(p=>el.length<2||p.hand.score===top),sh=Math.floor(pot/w.length);
      w.forEach(x=>{x.stack+=sh;x.won+=sh});w[0].stack+=pot-sh*w.length;w[0].won+=pot-sh*w.length;
    }
    this.result=P.filter(p=>p.won>0).map(p=>`${p.name} gana ${money(p.won)}${p.hand?' con '+p.hand.name:''}`);
    this.turn=-1;await this.ui.sync();
  }
}
