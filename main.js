const openCameraButton = document.getElementById("openCamera");
const video = document.getElementById("video");

openCameraButton.addEventListener("click", async () => {
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

  } catch (error) {
    console.error("Erro ao abrir a câmera:", error);
  }
});

/*
  Conversão RGB → HSV
  r, g, b no intervalo [0, 255]
  h no intervalo [0, 360)
  s, v no intervalo [0, 1]
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
