import { type Pose } from '@tensorflow-models/pose-detection';
import { type DetectorService } from 'app/services/detector';
import { useEffect } from 'react';
import { type Observable } from 'rxjs';
import {
  type PoseDetectorInitializerProps,
  type WithPoseStream,
} from './types';

export function install({
  detectorService,
}: {
  detectorService: DetectorService<readonly Pose[]>,
}) {
  return function<V extends WithPoseStream = WithPoseStream> ({
    children,
    asyncController,
    webcam,
  }: PoseDetectorInitializerProps<V>) {
    useEffect(function () {
      if (webcam === undefined) {
        return;
      }
      const poseStreamPromise = asyncController.append<Observable<readonly Pose[]> & {
        complete: () => void,
      }>(
        async function () {
          const detector = await detectorService.loadDetector();
          return detector.detect(webcam);
        },
        function (withDetector: V, stream: Observable<readonly Pose[]>): V {
          withDetector.poseStream = stream;
          return withDetector;
        },
      );
      return function () {
        poseStreamPromise.then(function (poseStream) {
          poseStream.complete();
        });
      };
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
