// main.js — atualizado: adicionada infraestrutura de log visível (console profundo).
// Mantive a funcionalidade original (abrir câmera traseira) inalterada; adicionei logs.

const button = document.getElementById("openCamera");
const video = document.getElementById("video");

// --- Console visível: API simples ---
const consoleOutput = document.getElementById("consoleOutput");
const consoleStatus = document.getElementById("consoleStatus");

function timeStamp() {
  const d = new Date();
  // formato legível com milissegundos
  return d.toISOString();
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
  // Auto-scroll to bottom
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

// Capture erros globais e promessas rejeitadas
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

// --- Função existente: abrir câmera traseira --- (com logging adicionado)
button.addEventListener("click", async () => {
  logInfo("Botão 'Abrir câmera' clicado. Solicitando permissão para câmera...");
  try {
    const constraints = {
      video: {
        // tentativa explícita de abrir câmera traseira
        facingMode: { exact: "environment" }
      },
      audio: false
    };

    logDebug(`Constraints solicitadas: ${JSON.stringify(constraints)}`);

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    logInfo("Stream obtido com sucesso.");
    // informa detalhes da(s) track(s)
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

    // mantém comportamento original intacto
    video.srcObject = stream;

    // registra quando metadata estiver pronta
    video.onloadedmetadata = () => {
      try {
        logInfo(`Video metadata carregada. Resolução estimada: ${video.videoWidth}x${video.videoHeight}`);
      } catch (e) {
        logError(`Erro ao acessar video metadata: ${String(e)}`);
      }
    };

  } catch (err) {
    // captura e loga erros detalhados (ex.: NotAllowedError, NotFoundError, OverconstrainedError)
    const name = err && err.name ? err.name : "Erro desconhecido";
    const message = err && err.message ? err.message : String(err);
    const stack = err && err.stack ? `\nStack: ${err.stack}` : "";
    logError(`Falha ao abrir câmera — ${name}: ${message}${stack}`);

    // Se for OverconstrainedError, logar constraintDetails quando disponível
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
  (Função adicionada anteriormente; mantida aqui sem uso direto para não alterar o programa)
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

// Inicialização: informa versão básica e ambiente
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
