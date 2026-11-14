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
// Reglas didácticas por juego + ejemplo visual (cartas reales). Port de DOCUMENT_2 "rules per game".
export const RULES={
  holdem:{txt:'2 cartas privadas + 5 comunitarias (flop, turn, river). Gana la mejor combinación de 5 cartas entre las 7 disponibles.',eg:[[14,'h'],[13,'h'],[12,'h'],[11,'h'],[10,'h']],egName:'Escalera real de corazones'},
  omaha:{txt:'4 cartas privadas. Usa exactamente 2 propias + 3 del tablero. Si combinas 3+ propias, la mano no es válida.',eg:[[14,'h'],[14,'d'],[14,'c'],[13,'h'],[13,'d']],egName:'Full House: A♠A♦A♣ K♥K♦'},
  short:{txt:'Mazo sin 2 al 5 (36 cartas). Aquí el Color vence al Full House. El resto, igual que Hold\'em.',eg:[[14,'s'],[9,'d'],[8,'c'],[7,'s'],[6,'h']],egName:'Escalera A♠9♦8♣7♠6♥'},
  draw:{txt:'5 cartas privadas. Apuestas, descartas 1 vez (1–5 cartas) y apuestas de nuevo. Límite fijo $5/$10.',eg:[[14,'s'],[14,'d'],[13,'h'],[13,'c'],[7,'s']],egName:'Doble pareja A♠A♦ K♥K♣ 7♠'},
  stud:{txt:'7 cartas: 2 ocultas + 3 visibles al reparto y luego 3 más, 1 a 1. Las apuestas de 5ª–7ª calle usan el $10.',eg:[[14,'h'],[14,'c'],[14,'d'],[13,'s'],[12,'c']],egName:'Trío de Ases A♥A♣A♦ + K♠Q♣'},
  allin:{txt:'Preflop: ir all-in o retirarse. Sin apuestas intermedias. Gana quien completa la mejor mano en el showdown.',eg:[[14,'c'],[14,'s'],[13,'h'],[12,'d'],[11,'c']],egName:'Pareja de Ases A♣A♠ + K♥Q♦J♣'},
  omaha5:{txt:'5 cartas privadas. Usa exactamente 2 propias + 3 del tablero. Colores y escaleras solo con tu par.',eg:[[14,'d'],[14,'h'],[14,'c'],[13,'d'],[11,'h']],egName:'Full House: A♦A♥A♣ K♦J♥'},
  omaha6:{txt:'6 cartas privadas. Sigue exigiendo 2 propias + 3 comunitarias. Más combinaciones posibles, misma regla.',eg:[[14,'s'],[14,'c'],[14,'d'],[14,'h'],[13,'c'],[13,'s']],egName:'Póker de Ases A♠A♣A♦A♥ + K♣K♠'},
  courchevel:{txt:'Omaha de 5 cartas, pero la 1ª carta del flop se reparte ANTES de la 1ª ronda de apuestas (carta clave).',eg:[[9,'h'],[10,'h'],[11,'h'],[12,'h'],[13,'h']],egName:'Color A♥K♥Q♥J♥10♥ de corazones'},
  blackjack:{txt:'Llega a 21 sin pasarte. As vale 1 u 11; J/Q/K valen 10. Blackjack natural paga 3:2. Crupier se planta en 17.',eg:[[14,'d'],[13,'d']],egName:'Blackjack: A♦ K♦ (paga 3:2)'},
};
