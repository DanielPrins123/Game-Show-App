import { importPowerPoint } from './pptx';
self.onmessage=(event:MessageEvent<{bytes:ArrayBuffer;name:string}>)=>{try{self.postMessage({deck:importPowerPoint(new Uint8Array(event.data.bytes),event.data.name)});}catch(error){self.postMessage({error:error instanceof Error?error.message:'The PowerPoint could not be imported.'});}};
