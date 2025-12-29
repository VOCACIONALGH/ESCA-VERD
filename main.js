const b=document.getElementById("openCamera"),v=document.getElementById("video"),
      cOut=document.getElementById("consoleOutput"),cSt=document.getElementById("consoleStatus");
const ts=()=>new Date().toISOString();
function addLine(t,y="info"){if(!cOut)return;const l=document.createElement("div");l.className=`console-line console-${y}`;const m=document.createElement("span");m.className="console-time";m.textContent=`[${ts()}]`;const c=document.createElement("span");c.textContent=` ${t}`;l.appendChild(m);l.appendChild(c);cOut.appendChild(l);cOut.scrollTop=cOut.scrollHeight;}
const logInfo=m=>{addLine(m,"info");console.log("[INFO]",m);if(cSt)cSt.textContent="— OK";}
const logDebug=m=>{addLine(m,"debug");console.debug("[DEBUG]",m);}
const logError=m=>{addLine(m,"error");console.error("[ERROR]",m);if(cSt)cSt.textContent="— ERRO";}

window.addEventListener("error",e=>{try{const{message,filename,lineno,colno,error}=e;const s=error&&error.stack?`\nStack: ${error.stack}`:"";logError(`Erro capturado: ${message} @ ${filename}:${lineno}:${colno}${s}`);}catch(x){logError(`Erro ao tratar window.onerror: ${String(x)}`);} });
window.addEventListener("unhandledrejection",e=>{try{const r=e.reason;const t=typeof r==="object"?JSON.stringify(r):String(r);logError(`Promise rejeitada sem tratamento: ${t}`);}catch(x){logError(`Erro ao tratar unhandledrejection: ${String(x)}`);} });

let scanning=false;
const c=document.createElement("canvas"),cx=c.getContext("2d");
async function frameQR(){
  try{
    if(!v||v.readyState<HTMLMediaElement.HAVE_CURRENT_DATA){ if(scanning)requestAnimationFrame(frameQR); return; }
    const w=v.videoWidth,h=v.videoHeight;
    if(!w||!h){ if(scanning)requestAnimationFrame(frameQR); return; }
    if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
    cx.drawImage(v,0,0,w,h);
    const id=cx.getImageData(0,0,w,h);
    if(typeof jsQR!=="function"&&typeof jsQR!=="object"){logError("Biblioteca jsQR não encontrada — detecção de QR desativada.");scanning=false;return;}
    const qr=jsQR(id.data,w,h);
    if(qr&&qr.data){
      if(String(qr.data)==="Origem"){logInfo("Origem detectada");}
      else logDebug(`QR detectado (conteúdo): ${String(qr.data)}`);
    }
  }catch(e){logError(`Erro no loop de QR: ${String(e)}`);}
  if(scanning)requestAnimationFrame(frameQR);
}

b.addEventListener("click",async()=>{
  logInfo("Botão 'Abrir câmera' clicado. Solicitando permissão para câmera...");
  try{
    const constraints={video:{facingMode:{exact:"environment"}},audio:false};
    logDebug(`Constraints solicitadas: ${JSON.stringify(constraints)}`);
    const stream=await navigator.mediaDevices.getUserMedia(constraints);
    logInfo("Stream obtido com sucesso.");
    try{
      const vt=stream.getVideoTracks()[0];
      if(vt){
        const s=vt.getSettings?vt.getSettings():null,cap=vt.getCapabilities?vt.getCapabilities():null;
        logDebug(`Video track label: ${vt.label||"não disponível"}`);
        logDebug(`Video track settings: ${s?JSON.stringify(s):"não suportado"}`);
        logDebug(`Video track capabilities: ${cap?JSON.stringify(cap):"não suportado"}`);
      } else logDebug("Nenhuma track de vídeo encontrada no stream.");
    }catch(e){logError(`Erro ao inspecionar tracks do stream: ${String(e)}`);}
    v.srcObject=stream;
    v.onloadedmetadata=()=>{
      try{
        logInfo(`Video metadata carregada. Resolução estimada: ${v.videoWidth}x${v.videoHeight}`);
        if(!scanning){scanning=true;requestAnimationFrame(frameQR);logDebug("Scanner de QR iniciado.");}
      }catch(e){logError(`Erro ao acessar video metadata: ${String(e)}`);}
    };
  }catch(err){
    const n=err&&err.name?err.name:"Erro desconhecido",m=err&&err.message?err.message:String(err),st=err&&err.stack?`\nStack: ${err.stack}`:"";
    logError(`Falha ao abrir câmera — ${n}: ${m}${st}`);
    if(err&&err.constraint)logDebug(`Constraint que falhou: ${err.constraint}`);
  }
});

/* RGB->HSV mantido (mesma assinatura) */
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m2=Math.min(r,g,b),d=M-m2;let h=0;if(d!==0){if(M===r)h=((g-b)/d)%6;else if(M===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}const s=M===0?0:d/M,v=M;return{h,s,v};}

/* inicial */
(function(){logInfo("Console profundo inicializado.");try{logDebug(`User agent: ${navigator.userAgent||"n/a"}`);logDebug(`Suporte: ${JSON.stringify({mediaDevices:!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia),serviceWorker:"serviceWorker"in navigator})}`);}catch(e){logError(`Erro init: ${String(e)}`);}})();
