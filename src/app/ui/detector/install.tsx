import {
  type Detector,
  type DetectorService,
} from 'app/services/detector';
import { useEffect } from 'react';
import {
  type DetectorInitializerProps,
  type WithDetector,
} from './types';

export function install({
  detectorService,
}: {
  detectorService: DetectorService,
}) {
  return function<V extends WithDetector = WithDetector> ({
    children,
    asyncController,
  }: DetectorInitializerProps<V>) {
    useEffect(function () {
      const detectorPromise = asyncController.append<Detector>(
        function () {
          return detectorService.loadDetector();
        },
        function (withDetector: V, detector: Detector): V {
          withDetector.detector = detector;
          return withDetector;
        },
      );
      return function () {
        detectorPromise.then(function (detector) {
          detector.destroy();
        });
      };
    });
    return (
      <>
        {children}
      </>
    );
  };
}
