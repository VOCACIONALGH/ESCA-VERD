const button = document.getElementById("openCamera");
const video = document.getElementById("video");

button.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { exact: "environment" }
    },
    audio: false
  });

  video.srcObject = stream;
});
