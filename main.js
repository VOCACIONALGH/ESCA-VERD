const button = document.getElementById("openCamera");
const video = document.getElementById("video");

/* ================================
   Console profundo de log
================================ */

function logInfo(message, data = null) {
  console.log(
    `[INFO ${new Date().toISOString()}] ${message}`,
    data ?? ""
  );
}

function logError(message, error = null) {
  console.error(
    `[ERROR ${new Date().toISOString()}] ${message}`,
    error ?? ""
  );
}

function logWarn(message, data = null) {
  console.warn(
    `[WARN ${new Date().toISOString()}] ${message}`,
    data ?? ""
  );
}

logInfo("Script main.js carregado");
logInfo("User Agent", navigator.userAgent);
logInfo("MediaDevices disponível", !!navigator.mediaDevices);

/* ================================
   Abertura da câmera
================================ */

button.addEventListener("click", async () => {
  logInfo("Botão 'Abrir câmera' clicado");

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      logError("API mediaDevices não suportada neste navegador");
      return;
    }

    logInfo("Solicitando acesso à câmera traseira");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { exact: "environment" }
      },
      audio: false
    });

    logInfo("Stream de vídeo obtido com sucesso", {
      tracks: stream.getTracks().map(t => ({
        kind: t.kind,
        label: t.label,
        enabled: t.enabled
      }))
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      logInfo("Metadados do vídeo carregados", {
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    video.onerror = (e) => {
      logError("Erro no elemento <video>", e);
    };

  } catch (err) {
    logError("Falha ao acessar a câmera", err);
  }
});

/* ================================
   Monitoramento global de erros
================================ */

window.addEventListener("error", event => {
  logError("Erro global capturado", {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error
  });
});

window.addEventListener("unhandledrejection", event => {
  logError("Promise rejeitada sem tratamento", event.reason);
});

/* ================================
   Conversão RGB → HSV (inalterada)
================================ */

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
