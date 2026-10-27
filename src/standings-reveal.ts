// Rows are sorted highest first; each step reveals (or hides) a whole tied group.
export function stepStandings(rows: readonly {total:number}[], shown:number, delta:number){
  let boundary=rows.length-Math.max(0,Math.min(rows.length,shown));
  for(let step=0;step<Math.abs(delta);step++){
    if(delta>0&&boundary>0){const total=rows[--boundary].total;while(boundary>0&&rows[boundary-1].total===total)boundary--;}
    else if(delta<0&&boundary<rows.length){const total=rows[boundary++].total;while(boundary<rows.length&&rows[boundary].total===total)boundary++;}
    else break;
  }
  return rows.length-boundary;
}
