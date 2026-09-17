import type { Question } from '../model';
export interface FinaleQuestion extends Question {source:string;season:number}
// One selected six-answer board per source page. Survey counts are factual,
// preserve the archive's ranking (including ties), and do not determine points.
function board(season:number,text:string,answers:[string,number][]):FinaleQuestion{return {id:`finale-${season}`,text,bonus:true,points:4,timer:60,season,source:`https://mstiescott.neocities.org/feud${season}_6.html`,answers:answers.map(([text,count],i)=>({id:`finale-${season}-${i+1}`,text,count}))};}
export const finaleQuestions:FinaleQuestion[]=[
  board(27,"Name a tool in a toolbox that you'd hate to see your dentist holding.",[['HAMMER',46],['DRILL',17],['SAW',10],['PLIERS',10],['SCREWDRIVER',7],['CHISEL',4]]),
  board(26,'Give me a word that rhymes with "curdle."',[['HURDLE/HURTLE',49],['GIRDLE',26],['TURTLE',12],['MYRTLE',5],['WORDLE',4],['FERTILE',3]]),
  board(25,"Name something you'd buy if vampires moved in next door.",[['GARLIC',57],['NEW HOUSE',13],['CROSS',13],['STAKE/WEAPON',10],['BLOOD WELCOME GIFT',3],['NEW LOCKS',3]]),
  board(24,'Name the first thing to come off when a pirate plays strip poker.',[['EYEPATCH',54],['HAT',28],['PEG LEG',6],['HOOK',4],['FRILLY SHIRT',4],['PARROT',2]]),
  board(22,"Name something that's fun to pop.",[['BUBBLE WRAP',31],['BALLOON',29],['BUBBLEGUM',18],['ZIT',13],['BOTTLE/CHAMPAGNE',4],['FINGERS/KNUCKLES',2]]),
  board(21,'Tell me which one of the Seven Dwarfs would make the worst stripper.',[['BASHFUL',32],['DOPEY',18],['GRUMPY',17],['SNEEZY',14],['SLEEPY',12],['DOC',7]]),
  board(20,"Name the hairiest part of Steve Harvey's body.",[['MUSTACHE/FACE',59],['CHEST',20],['BACK',8],['ARMS/PITS',5],['LEGS',3],['BUTT/CRACK',3]]),
  board(19,'Name something a man cracks open.',[['BEER/CHAMPAGNE',70],['NUTS/PEANUTS',15],['AN EGG',5],['A COCONUT',4],['HIS SKULL',2],['A SODA',2]]),
  board(18,'If Batman went broke, he just might have to sell his bat-what?',[['BATMOBILE',81],['BATCAVE',9],['BAT CAPE',3],['BATPLANE',2],['BATCOPTER',2],['BATCYCLE',2]]),
  board(17,"Name something that's described as sharp.",[['KNIFE',69],['NEEDLE',8],['TACK',7],['PENCIL',5],['RAZOR BLADE',5],['INTELLIGENCE',3]]),
];
