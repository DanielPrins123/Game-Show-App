import { unzipSync } from 'fflate';
import { DOMParser, type Document, type Element } from '@xmldom/xmldom';
import type { TriviaCard, TriviaDeck, TriviaImage } from './types';

const nodes=(root:Document|Element,name:string)=>Array.from(root.getElementsByTagNameNS('*',name));
const text=(root:Element)=>nodes(root,'p').map(p=>nodes(p,'t').map(t=>t.textContent??'').join('').trim()).filter(Boolean);
function xml(value:Uint8Array|undefined){
  if(!value)throw Error('This PowerPoint is missing a required document. Try saving a fresh .pptx copy.');
  const source=new TextDecoder().decode(value);
  if(/<!DOCTYPE|<!ENTITY/i.test(source))throw Error('This PowerPoint contains unsupported XML declarations.');
  return new DOMParser({onError:(level,message)=>{if(level!=='warning')throw Error(`Unreadable PowerPoint XML: ${message}`);}}).parseFromString(source,'application/xml');
}
function resolve(base:string,target:string){
  const parts=(target.startsWith('/')?target.slice(1):`${base.slice(0,base.lastIndexOf('/')+1)}${target}`).split('/');const out:string[]=[];
  for(const part of parts){if(part==='..'){if(!out.length)throw Error('Invalid PowerPoint relationship.');out.pop();}else if(part&&part!=='.')out.push(part);}
  return out.join('/');
}
interface Shape { id:string; lines:string[]; y:number; x:number; animation:number }
interface Slide { number:number; shapes:Shape[]; notes:string; images:TriviaImage[]; issues:string[] }
const questionTitle=/^(?:question\s*\d+|(?:final\s+)?bonus\b)/i;
const answerTitle=/^(?:answers?|solutions?)(?:\s*\d+)?\s*:?$/i;
const options=/^\s*(?:[A-D][).:]|[1-4][).])\s+/;
const cleanAnswer=(s:string)=>s.replace(/^\s*(?:answer|solution)\s*:\s*/i,'').trim();

export function convertSlides(slides:Slide[],fileName:string):TriviaDeck {
  const cards:TriviaCard[]=[];let round='Round 1';
  for(const slide of slides){
    const shapes=slide.shapes.filter(s=>s.lines.length).sort((a,b)=>a.y-b.y||a.x-b.x);
    const roundShape=shapes.find(s=>/^round\s+\d+\b/i.test(s.lines[0]));
    const heading=shapes.find(s=>questionTitle.test(s.lines[0]));
    const title=heading?.lines[0]??'';
    const previous=cards.at(-1);
    if(roundShape&&!heading){
      round=roundShape.lines[0].replace(/\s+categories\s*$/i,'').trim();
      cards.push({id:`slide-${slide.number}`,kind:'round',title:round,round,prompt:shapes.filter(s=>s!==roundShape).flatMap(s=>s.lines).join('\n'),answers:[],scoring:'',maxPoints:null,seconds:240,sourceSlides:[slide.number],notes:slide.notes,issues:slide.issues,images:slide.images});continue;
    }
    // A separate answer slide follows an unanswered question. Keep provenance and flag the pairing.
    if(previous?.kind==='question'&&!previous.answers.length&&!roundShape&&(!heading||/^(?:bonus|answers?)\s*$/i.test(title))){
      const lines=shapes.flatMap(s=>s.lines).filter(l=>!questionTitle.test(l)&&!answerTitle.test(l));
      if(lines.length){previous.answers=lines.map(cleanAnswer);previous.sourceSlides.push(slide.number);previous.notes+=slide.notes?'\n'+slide.notes:'';previous.images.push(...slide.images);previous.issues.push(`Answer slide ${slide.number} paired with the preceding question; check the match.`,...slide.issues);continue;}
    }
    const body=shapes.filter(s=>s!==heading);
    let prompt='';let answers:string[]=[];const issues=[...slide.issues];
    if(heading){
      const labelled=body.filter(s=>/^(?:answer|solution)\s*:/i.test(s.lines[0]));
      const candidates=body.filter(s=>!labelled.includes(s));
      const main=[...candidates].sort((a,b)=>b.lines.join(' ').length-a.lines.join(' ').length)[0];
      if(labelled.length){answers=labelled.flatMap(s=>s.lines).map(cleanAnswer);prompt=candidates.flatMap(s=>s.lines).join('\n');}
      else if(main){
        const rest=candidates.filter(s=>s!==main);
        const plausible=rest.length===1&&!rest[0].lines.some(l=>options.test(l))&&!rest[0].lines.join('').includes('?')&&(rest[0].animation>main.animation||rest[0].y>main.y);
        if(plausible){prompt=main.lines.join('\n');answers=rest[0].lines.map(cleanAnswer);issues.push('Answer separated using slide position / animation order. Check it before starting.');}
        else prompt=candidates.flatMap(s=>s.lines).join('\n');
      }
      const noteAnswer=slide.notes.match(/(?:^|\n)\s*(?:answer|solution)\s*:\s*([^\n]+)/i);
      if(!answers.length&&noteAnswer){answers=[noteAnswer[1].trim()];issues.push('Answer read from speaker notes.');}
    }
    const each=title.match(/(\d+)\s*each/i);const count=title.match(/(\d+)\s*answers?/i);const all=title.match(/(\d+)\s*for\s*all/i);
    const maxPoints=all?Number(all[1]):each&&count?Number(each[1])*Number(count[1]):null;
    if(heading&&maxPoints===null)issues.push('No maximum points found. Set the score value if needed.');
    cards.push({id:`slide-${slide.number}`,kind:heading?'question':'info',title:title||`Slide ${slide.number}`,round,prompt:heading?prompt:shapes.flatMap(s=>s.lines).join('\n'),answers,scoring:each||all?title.replace(/^(?:final\s+)?bonus\s*/i,'').replace(/^\(|\)$/g,''):'',maxPoints,seconds:240,sourceSlides:[slide.number],notes:slide.notes,issues:heading?issues:[...issues,'Unclassified slide retained as an information screen. Review its content before showing it.'],images:slide.images});
  }
  for(const card of cards)if(card.kind==='question'&&!card.answers.length)card.issues.push('No answer found. Enter the answer or leave it blank for manual hosting.');
  if(!cards.length)throw Error('No readable slides were found in this PowerPoint.');
  return {version:1,type:'trivia',id:crypto.randomUUID(),title:fileName.replace(/\.(pptx|ppsx)$/i,''),fileName,importedAt:new Date().toISOString(),cards,source:slides.map(s=>({number:s.number,paragraphs:s.shapes.flatMap(sh=>sh.lines),notes:s.notes})),warnings:['This is an editable content conversion, not an exact PowerPoint rendering. Review questions, private answers, point values and images before starting.','Animations, slide-master artwork, charts, embedded video/audio and external links are not reproduced.','Image-only text is not OCR-read. Images on question slides stay private until you assign them to the question or answer.']};
}

export function importPowerPoint(bytes:Uint8Array,fileName:string):TriviaDeck {
  if(!/\.(pptx|ppsx)$/i.test(fileName))throw Error('Use a .pptx PowerPoint file. For an older .ppt file, open it in PowerPoint and choose Save As → PowerPoint Presentation (.pptx).');
  if(bytes.length>40*1024*1024)throw Error('This file is larger than 40 MB. Compress its pictures in PowerPoint and try again.');
  let expanded=0,entries=0;
  const files=unzipSync(bytes,{filter:file=>{expanded+=file.originalSize;entries++;if(expanded>100*1024*1024||entries>10000)throw Error('This PowerPoint is too large to import safely in the browser.');return /^ppt\//.test(file.name)&&(/\.xml(?:\.rels)?$/.test(file.name)||/^ppt\/media\//.test(file.name)||/\.rels$/.test(file.name));}});
  function relationships(path:string){
    const name=`${path.slice(0,path.lastIndexOf('/')+1)}_rels/${path.slice(path.lastIndexOf('/')+1)}.rels`;
    return files[name]?nodes(xml(files[name]),'Relationship').map(r=>({id:r.getAttribute('Id'),type:r.getAttribute('Type')??'',external:r.getAttribute('TargetMode')==='External',path:resolve(path,r.getAttribute('Target')??'')})):[];
  }
  const presentation=xml(files['ppt/presentation.xml']);const rels=relationships('ppt/presentation.xml');
  const ids=nodes(presentation,'sldId');if(ids.length>500)throw Error('Use a deck with at most 500 slides.');
  const slides:Slide[]=ids.map((id,index)=>{
    const path=rels.find(r=>r.id===id.getAttribute('r:id')&&!r.external)?.path;
    if(!path)throw Error(`Slide ${index+1} cannot be located.`);
    const doc=xml(files[path]);const links=relationships(path);
    const animation=nodes(doc,'spTgt').map(n=>n.getAttribute('spid'));
    const shapes=nodes(doc,'sp').map((shape,i)=>{const off=nodes(shape,'off')[0];const shapeId=nodes(shape,'cNvPr')[0]?.getAttribute('id')??String(i);return {id:shapeId,lines:text(shape),y:Number(off?.getAttribute('y')??i),x:Number(off?.getAttribute('x')??0),animation:animation.indexOf(shapeId)};});
    for(const table of nodes(doc,'tbl'))shapes.push({id:`table-${shapes.length}`,lines:nodes(table,'tr').map(row=>nodes(row,'tc').map(cell=>text(cell).join(' ')).join(' | ')),x:0,y:9999999,animation:-1});
    const notePath=links.find(r=>r.type.endsWith('/notesSlide')&&!r.external)?.path;
    const notes=notePath&&files[notePath]?nodes(xml(files[notePath]),'sp').filter(s=>!nodes(s,'ph').some(ph=>['sldNum','hdr','ftr','dt'].includes(ph.getAttribute('type')??''))).flatMap(s=>text(s)).join('\n'):'';
    const images:TriviaImage[]=[];const issues:string[]=[];
    for(const picture of nodes(doc,'pic')){
      const rid=nodes(picture,'blip')[0]?.getAttribute('r:embed');const rel=links.find(r=>r.id===rid&&!r.external);const data=rel?files[rel.path]:undefined;
      const extension=rel?.path.split('.').at(-1)?.toLowerCase();const mime=extension==='jpg'?'jpeg':extension;
      if(data&&mime&&['png','jpeg','gif','webp'].includes(mime)){let binary='';for(let i=0;i<data.length;i+=8192)binary+=String.fromCharCode(...data.subarray(i,i+8192));images.push({id:`slide-${index+1}-image-${images.length}`,data:`data:image/${mime};base64,${btoa(binary)}`,name:nodes(picture,'cNvPr')[0]?.getAttribute('descr')||rel!.path.split('/').at(-1)!,role:'review'});}
      else issues.push('An image could not be converted. Check the original slide.');
    }
    if(images.length)issues.push('Choose where each extracted image may appear; it is private until assigned.');
    if(nodes(doc,'graphicFrame').length||nodes(doc,'videoFile').length||nodes(doc,'audioFile').length||links.some(r=>r.external))issues.push('This slide includes a table, graphic, media or link; check the original for content that needs manual recreation.');
    if(!shapes.some(s=>s.lines.length))issues.push('No text found. Image-only questions need manual transcription.');
    return {number:index+1,shapes,notes,images,issues};
  });
  return convertSlides(slides,fileName);
}
