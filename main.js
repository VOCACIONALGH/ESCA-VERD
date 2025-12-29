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
