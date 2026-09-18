import type { KeyboardEvent, FocusEvent } from 'react';

export function selectScoreOnFocus(event:FocusEvent<HTMLElement>){
  if(event.target instanceof HTMLInputElement)event.target.select();
}
// Enter works down one question's column; Tab works across a team's row.
export function scoreKeyboard(event:KeyboardEvent<HTMLElement>){
  if(!(event.target instanceof HTMLInputElement)||event.ctrlKey||event.metaKey||event.altKey)return;
  const table=event.target.closest('table');if(!table)return;
  const rows=[...table.querySelectorAll('tbody tr')].map(row=>[...row.querySelectorAll<HTMLInputElement>('input:not(:disabled)')]);
  const row=rows.findIndex(inputs=>inputs.includes(event.target as HTMLInputElement));if(row<0)return;
  const col=rows[row].indexOf(event.target);let next:HTMLInputElement|undefined;
  if(event.key==='Enter'){
    const direction=event.shiftKey?-1:1;
    next=rows[row+direction]?.[col]??(direction>0?rows[0]?.[col+1]:rows.at(-1)?.[col-1]);
  }else if(event.key==='ArrowDown')next=rows[row+1]?.[col];
  else if(event.key==='ArrowUp')next=rows[row-1]?.[col];
  else if(event.key==='Tab'){
    const all=rows.flat(),index=all.indexOf(event.target);next=all[index+(event.shiftKey?-1:1)];
    if(!next)return; // Let Tab leave the sheet at its edges.
  }else return;
  event.preventDefault();
  if(next){next.focus();next.select();next.scrollIntoView({block:'nearest',inline:'nearest'});}
}
