const video = document.getElementById("video");
const openButton = document.getElementById("openCamera");

openButton.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 9999 },
        height: { ideal: 9999 }
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error("Erro ao abrir a câmera:", err);
  }
});
