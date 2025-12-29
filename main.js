const b=document.getElementById("openCamera"),v=document.getElementById("video"),
cOut=document.getElementById("consoleOutput"),cSt=document.getElementById("consoleStatus");
const ts=()=>new Date().toISOString();
function addLine(t,y="info"){if(!cOut)return;const l=document.createElement("div");l.className=`console-line console-${y}`;const m=document.createElement("span");m.className="console-time";m.textContent=`[${ts()}]`;const c=document.createElement("span");c.textContent=` ${t}`;l.appendChild(m);l.appendChild(c);cOut.appendChild(l);cOut.scrollTop=cOut.scrollHeight;}
const logInfo=m=>{addLine(m,"info");console.log("[INFO]",m);if(cSt)cSt.textContent="— OK";}
const logDebug=m=>{addLine(m,"debug");console.debug("[DEBUG]",m);}
const logError=m=>{addLine(m,"error");console.error("[ERROR]",m);if(cSt)cSt.textContent="— ERRO";}

window.addEventListener("error",e=>{try{const{message,filename,lineno,colno,error}=e;const s=error&&error.stack?`\nStack: ${error.stack}`:"";logError(`Erro capturado: ${message} @ ${filename}:${lineno}:${colno}${s}`);}catch(x){logError(`Erro window.onerror: ${String(x)}`);} });
window.addEventListener("unhandledrejection",e=>{try{const r=e.reason;logError(`Promise rejeitada: ${typeof r==="object"?JSON.stringify(r):String(r)}`);}catch(x){logError(`Erro unhandledrejection: ${String(x)}`);} });

let scanning=false;
const c=document.createElement("canvas"),cx=c.getContext("2d");
function frameQR(){
  try{
    if(!v||v.readyState<2){if(scanning)requestAnimationFrame(frameQR);return;}
    const w=v.videoWidth,h=v.videoHeight;
    if(!w||!h){if(scanning)requestAnimationFrame(frameQR);return;}
    if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
    cx.drawImage(v,0,0,w,h);
    const id=cx.getImageData(0,0,w,h);
    if(typeof jsQR!=="function"){logError("jsQR não encontrado");scanning=false;return;}
    const qr=jsQR(id.data,w,h);
    if(qr&&qr.data){
      if(qr.data==="Origem") logInfo("Origem detectada");
      else if(qr.data==="+X") logInfo("+X detectado");
      else logDebug(`QR detectado: ${qr.data}`);
    }
  }catch(e){logError(`Erro QR loop: ${String(e)}`);}
  if(scanning)requestAnimationFrame(frameQR);
}

b.addEventListener("click",async()=>{
  logInfo("Abrir câmera acionado");
  try{
    const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:"environment"}},audio:false});
    v.srcObject=s;
    v.onloadedmetadata=()=>{logInfo(`Vídeo ativo ${v.videoWidth}x${v.videoHeight}`);if(!scanning){scanning=true;requestAnimationFrame(frameQR);}};
  }catch(e){logError(`Falha câmera: ${e.name||""} ${e.message||e}`);}
});

/* RGB -> HSV (inalterado) */
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m2=Math.min(r,g,b),d=M-m2;let h=0;if(d!==0){if(M===r)h=((g-b)/d)%6;else if(M===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return{h,s:M===0?0:d/M,v:M};}

(()=>{logInfo("Console profundo inicializado");logDebug(`UA: ${navigator.userAgent}`);})();
