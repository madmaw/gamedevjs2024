export async function createCamera(
  camera: HTMLVideoElement = document.createElement('video'),
  targetWidth: number = 640,
): Promise<HTMLVideoElement> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {
        ideal: 'user',
      },
      width: {
        ideal: targetWidth,
      },
    },
    audio: false,
  });
  camera.srcObject = stream;
  await camera.play();
  camera.width = camera.videoWidth;
  camera.height = camera.videoHeight;
  return camera;
}
