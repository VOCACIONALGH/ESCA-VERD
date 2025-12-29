const button = document.getElementById("openCamera");
const video = document.getElementById("video");

/* =========================
   CONSOLE VISÍVEL (EXISTENTE)
========================= */

const consoleOutput = document.getElementById("consoleOutput");
const consoleStatus = document.getElementById("consoleStatus");

function timeStamp() {
  return new Date().toISOString();
}

function appendLine(text, type = "info") {
  const line = document.createElement("div");
  line.className = `console-line console-${type}`;
  line.innerHTML = `<span class="console-time">[${timeStamp()}]</span> ${text}`;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function logInfo(msg) {
  appendLine(msg, "info");
  console.log(msg);
}

function logError(msg) {
  appendLine(msg, "error");
  console.error(msg);
}

/* =========================
   ABRIR CÂMERA (INALTERADO)
========================= */

button.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
      audio: false
    });

    video.srcObject = stream;
    logInfo("Câmera aberta com sucesso.");

    iniciarLeituraQR(video);

  } catch (err) {
    logError("Erro ao abrir câmera: " + err.message);
  }
});

/* =========================
   LEITURA DE QR CODE (ADICIONADO)
========================= */

async function iniciarLeituraQR(videoElement) {
  if (!("BarcodeDetector" in window)) {
    logError("BarcodeDetector não suportado neste navegador.");
    return;
  }

  const detector = new BarcodeDetector({ formats: ["qr_code"] });

  async function scan() {
    try {
      const codes = await detector.detect(videoElement);

      for (const code of codes) {
        if (code.rawValue === "Origem") {
          logInfo("Origem detectada");
        }
      }
    } catch (e) {
      logError("Erro na leitura do QR Code.");
    }

    requestAnimationFrame(scan);
  }

  scan();
}

/* =========================
   RGB → HSV (EXISTENTE)
========================= */

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;

  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}
