import { type Page } from 'app/pages/types';
import {
  type DetectorService,
  PoseSourceType,
} from 'app/services/detector';
import { type AsyncController } from 'app/ui/async/controller';
import { useAsyncEffect } from 'base/react/async';

export function install<T>({
  detectorService,
}: {
  detectorService: DetectorService<T>,
}): Page {
  const Component = function ({
    asyncController,
  }: {
    asyncController: AsyncController,
  }) {
    useAsyncEffect(async function () {
      const {
        poseStream,
      } = await asyncController.append(
        async function () {
          const detector = await detectorService.loadDetector();
          const poseStream = await detector.detect({
            type: PoseSourceType.Camera,
          });
          return {
            poseStream,
          };
        },
      );
      // post poses to parent frame
      const subscription = poseStream.subscribe(function (pose) {
        postMessage(pose, document.location.href);
      });
      return function () {
        subscription.unsubscribe();
        poseStream.complete();
      };
    }, [asyncController]);

    return null;
  };

  return { Component };
}
