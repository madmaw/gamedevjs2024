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
}) {
  // install the hands model

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
      return function () {
        poseStream.complete();
      };
    }, []);
  };

  return [Component] as const;
}
