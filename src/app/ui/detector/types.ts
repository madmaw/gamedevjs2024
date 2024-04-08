import { type Detector } from 'app/services/detector';
import { type AsyncController } from 'app/ui/async/controller';
import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';

export type WithDetector = Partial<{
  detector: Detector,
}>;

export type DetectorInitializerProps<V extends WithDetector = WithDetector> = PropsWithChildren<{
  asyncController: AsyncController<V>,
}>;

export type DetectorInitializer<V extends WithDetector = WithDetector> = ComponentType<DetectorInitializerProps<V>>;
