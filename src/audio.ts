let context:AudioContext|undefined;
export function unlockAudio(){try{context??=new AudioContext();void context.resume();}catch{/* Audio must never prevent play. */}}
export function sound(type:'reveal'|'strike'|'warning'|'expired'|'extension',volume:number,muted:boolean){if(muted||!context||context.state!=='running')return;
  const notes=(type==='reveal'||type==='extension')?[523,659,784]:type==='strike'?[150,110]:type==='warning'?[880]:[220,164,110];
  notes.forEach((frequency,i)=>{const osc=context!.createOscillator();const gain=context!.createGain();const at=context!.currentTime+i*.12;osc.type=type==='strike'||type==='expired'?'sawtooth':'sine';osc.frequency.setValueAtTime(frequency,at);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume*.18,at+.012);gain.gain.exponentialRampToValueAtTime(.001,at+.22);osc.connect(gain);gain.connect(context!.destination);osc.start(at);osc.stop(at+.25);});
}
