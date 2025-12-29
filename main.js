const openCameraButton = document.getElementById("openCamera");
const video = document.getElementById("video");
const uiConsole = document.getElementById("uiConsole");
const redSlider = document.getElementById("redSlider");
const redValue = document.getElementById("redValue");

function logUI(message) {
  uiConsole.textContent = message;
}

logUI("Aguardando ação do usuário...");

openCameraButton.addEventListener("click", async () => {
  logUI("Solicitando acesso à câmera...");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 4096 },
        height: { ideal: 2160 }
      },
      audio: false
    });

    video.srcObject = stream;
    logUI("Câmera aberta com sucesso.");

  } catch (error) {
    logUI("Erro ao abrir a câmera.");
    console.error("Erro ao abrir a câmera:", error);
  }
});

/*
  Conversão RGB → HSV
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

// Atualiza valor da barra e exibe no span
redSlider.addEventListener("input", () => {
  redValue.textContent = redSlider.value;
});
