let context:AudioContext|undefined;
export function unlockAudio(){try{context??=new AudioContext();void context.resume();}catch{/* Audio must never prevent play. */}}
export function sound(type:'reveal'|'strike'|'warning'|'expired'|'extension'|'tick',volume:number,muted:boolean){
  if(muted||!context||context.state!=='running')return;
  const frequency=type==='reveal'?880:type==='strike'?240:type==='tick'?660:type==='warning'?740:type==='extension'?784:330;
  const duration=type==='tick'?.045:type==='reveal'?.16:type==='strike'?.14:.28;
  const level=type==='tick'?.025:type==='reveal'?.09:type==='strike'?.11:.13;
  const osc=context.createOscillator(),gain=context.createGain(),at=context.currentTime;
  osc.type='sine';osc.frequency.setValueAtTime(frequency,at);
  if(type==='strike')osc.frequency.exponentialRampToValueAtTime(180,at+duration);
  if(type==='expired')osc.frequency.exponentialRampToValueAtTime(220,at+duration);
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume*level,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(gain);gain.connect(context.destination);osc.start(at);osc.stop(at+duration+.02);
}
