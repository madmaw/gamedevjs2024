import {
  useEffect,
  useMemo,
} from 'react';
import {
  type WebcamInitializerProps,
  type WithWebcam,
} from './types';

export function install() {
  return function<V extends WithWebcam = WithWebcam> ({
    children,
    asyncController,
  }: WebcamInitializerProps<V>) {
    const webcam = useMemo(function () {
      return document.createElement('video');
    }, []);

    useEffect(function () {
      asyncController.append<HTMLVideoElement>(
        async function () {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
            },
            audio: false,
          });
          webcam.srcObject = stream;
          webcam.play();
          return webcam;
        },
        function (withWebcam: V, webcam: HTMLVideoElement): V {
          withWebcam.webcam = webcam;
          return withWebcam;
        },
      );
    }, [
      asyncController,
      webcam,
    ]);

    return (
      <>
        {children}
      </>
    );
  };
}
