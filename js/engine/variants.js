// Configuración declarativa de las 5 variantes (las mismas del diseño de Stitch)
export const VARIANTS={
  holdem:{id:'holdem',name:"Texas Hold'em",icon:'♠',desc:'La variante reina · Sin límite',info:'Ciegas $1/$2',struct:'NL',hole:2,board:true,blinds:[1,2],buyin:200},
  omaha:{id:'omaha',name:'Omaha Pot-Limit',icon:'♦',desc:'4 cartas en mano · Usa exactamente 2',info:'Ciegas $2/$4',struct:'PL',hole:4,board:true,omaha:true,blinds:[2,4],buyin:400},
  short:{id:'short',name:'Short Deck (6+)',icon:'⚡',desc:'Sin 2 a 5 · Color vence al full',info:'Ciegas $1/$2',struct:'NL',hole:2,board:true,short:true,blinds:[1,2],buyin:200},
  draw:{id:'draw',name:'Póker Clásico 5-Card Draw',icon:'♣',desc:'1 descarte · Límite fijo',info:'Ante $1 · Límite $5/$10',struct:'FL',hole:5,draw:true,ante:1,limits:[5,10],buyin:200},
  stud:{id:'stud',name:'7-Card Stud',icon:'♥',desc:'Cartas visibles y ocultas · Límite fijo',info:'Ante $1 · Límite $5/$10',struct:'FL',stud:true,ante:1,bringIn:2,limits:[5,10],buyin:200},
  allin:{id:'allin',name:'All-In Poker',icon:'🔥',desc:'Preflop: all-in o retirarse',info:'Ciegas $1/$2',struct:'NL',hole:2,board:true,allin:true,blinds:[1,2],buyin:200},
  omaha5:{id:'omaha5',name:'5 Card Omaha',icon:'♦',desc:'5 cartas · Usa exactamente 2',info:'Ciegas $2/$4',struct:'PL',hole:5,board:true,omaha:true,blinds:[2,4],buyin:400},
  omaha6:{id:'omaha6',name:'6 Card Omaha',icon:'♦',desc:'6 cartas · Usa exactamente 2',info:'Ciegas $2/$4',struct:'PL',hole:6,board:true,omaha:true,blinds:[2,4],buyin:400},
  courchevel:{id:'courchevel',name:'Courchevel',icon:'♠',desc:'5 cartas · 1ª carta del flop visible',info:'Ciegas $2/$4',struct:'PL',hole:5,board:true,omaha:true,courchevel:true,blinds:[2,4],buyin:400},
};
