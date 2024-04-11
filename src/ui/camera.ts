export async function createCamera(targetWidth: number = 320): Promise<HTMLVideoElement> {
  const camera = document.createElement('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: {
        ideal: targetWidth,
      },
    },
    audio: false,
  });
  camera.srcObject = stream;
  return camera;
}
