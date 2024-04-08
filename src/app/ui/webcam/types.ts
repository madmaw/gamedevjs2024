import { type AsyncController } from 'app/ui/async/controller';
import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';

export type WithWebcam = Partial<{
  webcam: HTMLVideoElement,
}>;

export type WebcamInitializerProps<V extends WithWebcam = WithWebcam> = PropsWithChildren<{
  asyncController: AsyncController<V>,
}>;

export type WebcamInitializer<V extends WithWebcam = WithWebcam> = ComponentType<WebcamInitializerProps<V>>;
