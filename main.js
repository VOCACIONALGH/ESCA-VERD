// main.js — atualizado: adicionada detecção do QR Code com conteúdo "Origem".
// Mantive a funcionalidade original inalterada; adicionei apenas o reconhecimento do QR e o log "Origem detectada".

const button = document.getElementById("openCamera");
const video = document.getElementById("video");

// --- Console visível: API simples (mantida) ---
const consoleOutput = document.getElementById("consoleOutput");
const consoleStatus = document.getElementById("consoleStatus");

function timeStamp() {
  return new Date().toISOString();
}

function appendLine(text, type = "info") {
  if (!consoleOutput) return;
  const line = document.createElement("div");
  line.className = `console-line console-${type}`;
  const ts = document.createElement("span");
  ts.className = "console-time";
  ts.textContent = `[${timeStamp()}]`;
  const content = document.createElement("span");
  content.textContent = ` ${text}`;
  line.appendChild(ts);
  line.appendChild(content);
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function logInfo(msg) {
  appendLine(msg, "info");
  console.log("[INFO]", msg);
  updateStatus("OK");
}
function logDebug(msg) {
  appendLine(msg, "debug");
  console.debug("[DEBUG]", msg);
}
function logError(msg) {
  appendLine(msg, "error");
  console.error("[ERROR]", msg);
  updateStatus("ERRO");
}

function updateStatus(text) {
  if (!consoleStatus) return;
  consoleStatus.textContent = `— ${text}`;
}

// Global error handlers (mantidos)
window.addEventListener("error", (event) => {
  try {
    const { message, filename, lineno, colno, error } = event;
    const stack = error && error.stack ? `\nStack: ${error.stack}` : "";
    logError(`Erro capturado: ${message} @ ${filename}:${lineno}:${colno}${stack}`);
  } catch (e) {
    logError(`Erro ao tratar window.onerror: ${String(e)}`);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  try {
    const reason = event.reason;
    const text = typeof reason === "object" ? JSON.stringify(reason) : String(reason);
    logError(`Promise rejeitada sem tratamento: ${text}`);
  } catch (e) {
    logError(`Erro ao tratar unhandledrejection: ${String(e)}`);
  }
});

// --- QR Detection setup ---
// We'll use jsQR (loaded via CDN in index.html). This code only starts scanning after the video stream is set.
let scanning = false;

// Offscreen canvas used to capture video frames for QR processing
const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d");

// Helper: process one frame for QR
function processFrameForQR() {
  try {
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      requestAnimationFrame(processFrameForQR);
      return;
    }

    const w = video.videoWidth;
    const h = video.videoHeight;

    if (!w || !h) {
      requestAnimationFrame(processFrameForQR);
      return;
    }

    // set canvas size to video frame size (cheap)
    if (offCanvas.width !== w || offCanvas.height !== h) {
      offCanvas.width = w;
      offCanvas.height = h;
    }

    // draw current frame
    offCtx.drawImage(video, 0, 0, w, h);

    // get image data
    const imageData = offCtx.getImageData(0, 0, w, h);

    if (typeof jsQR !== "function" && typeof jsQR !== "object") {
      // library not available
      logError("Biblioteca jsQR não encontrada — detecção de QR desativada.");
      scanning = false;
      return;
    }

    // run qr detection
    const qr = jsQR(imageData.data, w, h);

    if (qr && qr.data) {
      // Only act when the content equals exactly "Origem"
      try {
        if (String(qr.data) === "Origem") {
          // Mensagem requisitada: "Origem detectada"
          logInfo("Origem detectada");
          // note: não adicionamos mais comportamentos (sem alteração do programa)
        } else {
          // opcional: log debug do conteúdo detectado (não necessário, mas mantido como debug)
          logDebug(`QR detectado com conteúdo diferente: ${String(qr.data)}`);
        }
      } catch (e) {
        logError(`Erro ao processar QR detectado: ${String(e)}`);
      }
    }

    // continue scanning while scanning flag true
    if (scanning) {
      requestAnimationFrame(processFrameForQR);
    }
  } catch (e) {
    logError(`Erro no loop de processamento de QR: ${String(e)}`);
    // tentar continuar
    if (scanning) requestAnimationFrame(processFrameForQR);
  }
}

// --- Função existente: abrir câmera traseira --- (com logging adicionado)
button.addEventListener("click", async () => {
  logInfo("Botão 'Abrir câmera' clicado. Solicitando permissão para câmera...");
  try {
    const constraints = {
      video: {
        facingMode: { exact: "environment" }
      },
      audio: false
    };

    logDebug(`Constraints solicitadas: ${JSON.stringify(constraints)}`);

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    logInfo("Stream obtido com sucesso.");

    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings ? videoTrack.getSettings() : null;
        const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : null;
        logDebug(`Video track label: ${videoTrack.label || "não disponível"}`);
        logDebug(`Video track settings: ${settings ? JSON.stringify(settings) : "não suportado"}`);
        logDebug(`Video track capabilities: ${capabilities ? JSON.stringify(capabilities) : "não suportado"}`);
      } else {
        logDebug("Nenhuma track de vídeo encontrada no stream.");
      }
    } catch (inner) {
      logError(`Erro ao inspecionar tracks do stream: ${inner && inner.stack ? inner.stack : String(inner)}`);
    }

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      try {
        logInfo(`Video metadata carregada. Resolução estimada: ${video.videoWidth}x${video.videoHeight}`);
        // Ao ter metadata e vídeo rodando, ativamos o scanner de QR (sem alterar mais nada)
        if (!scanning) {
          scanning = true;
          requestAnimationFrame(processFrameForQR);
          logDebug("Scanner de QR iniciado.");
        }
      } catch (e) {
        logError(`Erro ao acessar video metadata: ${String(e)}`);
      }
    };

  } catch (err) {
    const name = err && err.name ? err.name : "Erro desconhecido";
    const message = err && err.message ? err.message : String(err);
    const stack = err && err.stack ? `\nStack: ${err.stack}` : "";
    logError(`Falha ao abrir câmera — ${name}: ${message}${stack}`);

    if (err && err.constraint) {
      logDebug(`Constraint que falhou: ${err.constraint}`);
    }
  }
});

/*
  Conversão RGB → HSV
  r, g, b ∈ [0, 255]
  h ∈ [0, 360)
  s, v ∈ [0, 1]
  (Função mantida sem uso direto para não alterar o fluxo)
*/
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;

  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

// Inicialização: informações básicas
(function initConsoleIntro() {
  logInfo("Console profundo inicializado.");
  try {
    const ua = navigator.userAgent || "userAgent não disponível";
    logDebug(`User agent: ${ua}`);
    const supports = {
      mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      serviceWorker: 'serviceWorker' in navigator
    };
    logDebug(`Suporte detectado: ${JSON.stringify(supports)}`);
  } catch (e) {
    logError(`Erro durante inicialização do console: ${String(e)}`);
  }
})();
