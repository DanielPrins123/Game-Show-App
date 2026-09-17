import type { Question } from '../model';
export interface FinaleQuestion extends Question {source:string;season:number}
// One selected six-answer board per source page. Survey counts are factual,
// preserve the archive's ranking (including ties), and do not determine points.
function board(season:number,text:string,answers:[string,number][]):FinaleQuestion{return {id:`finale-${season}${season===27?"":"-balanced"}`,text,bonus:true,points:4,timer:60,season,source:`https://mstiescott.neocities.org/feud${season}_6.html`,answers:answers.map(([text,count],i)=>({id:`finale-${season}${season===27?"":"-balanced"}-${i+1}`,text,count}))};}
export const finaleQuestions:FinaleQuestion[]=[
  board(27,"Name a tool in a toolbox that you'd hate to see your dentist holding.",[['HAMMER',46],['DRILL',17],['SAW',10],['PLIERS',10],['SCREWDRIVER',7],['CHISEL',4]]),
  board(26,'What would a cheapskate bring to your party?',[['LEFTOVERS/CHEAP FOOD',39],['CHEAP LIQUOR',37],['CUPS/PAPER PLATES',8],['BUPKIS',8],['WATER/ICE',4],['PAPER TOWELS',2]]),
  board(25,'What would Bigfoot complain about when campers visit?',[['DIRTY/LITTER',36],['NOISY',29],['FIRES/SMOKE',11],['B.O./THEY SMELL!',9],['INVADE PRIVACY',8],["DON'T SHARE FOOD",5]]),
  board(24,'Your new home has a ghost. What would you do?',[['MOVE!',49],['INVESTIGATE',22],['PRIEST/GHOSTBUSTERS',11],['SELL TICKETS',8],['PRAY',3],['CRY/BE SCARED',3]]),
  board(22,'Imagine being a chicken. What would you be doing?',[['EATING/PECKING',34],['SLEEP/ROOSTING',22],['LAYING EGGS',15],['CLUCKING',13],['BEING FRIED/EATEN',6],['CROSSING THE ROAD',6]]),
  board(21,'What would be dangerous for a naked juggler to juggle?',[['KNIVES/SWORDS',54],['FIRE/TORCHES',22],['BALLS',9],['CHAIN SAWS',5],['BOWLING PINS',3],['AXES/HATCHETS',3]]),
  board(20,'How could a cat ruin everyone’s appetite at a dinner party?',[['PUKE/A HAIRBALL',40],['LICK SELF/BUTT',18],['DROP A DEUCE/SPRAY',16],['HOP ON TABLE/EAT',14],['MEOW/CRY/PURR',5],['BEHEAD A MOUSE',3]]),
  board(19,'On their first parachute jump, what might someone do during the descent?',[['SCREAM/CUSS',55],['PRAY',20],['PEE/FLOAT A DOODY',9],['FAINT',5],['CRY',4],['HURL',3]]),
  board(18,'Which body part might a headless horseman speak through?',[['NECK',52],['BUTT/CHOCOLATE STAR',25],['CHEST/LEFT NIPPLE',12],['HANDS',6],['BELLY BUTTON',2],['ARMPIT',2]]),
  board(17,'A coworker keeps flirting with you. How might you react?',[['FLIRT BACK',36],['TELL THEM TO STOP',29],['IGNORE/DISTANCE',15],['REPORT THEM',11],['ASK OUT ON DATE',4],['KICK/SLAP THEM',2]]),
];
