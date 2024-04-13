import {
  type Initializer,
  type Page,
} from 'app/pages/types';
import {
  type DetectorService,
  PoseSourceType,
} from 'app/services/detector';
import { toUrl } from 'app/to_url';
import {
  RouteType,
  type RoutingContext,
} from 'app/types';
import { useCallback } from 'react';

export function install<T>({
  detectorService,
  context,
}: {
  detectorService: DetectorService<T>,
  context: RoutingContext,
}): Page {
  const Component = function ({
    Initializer,
  }: {
    Initializer: Initializer,
  }) {
    const initialize = useCallback(async function () {
      const detector = await detectorService.loadDetector();
      const poseStream = await detector.detect({
        type: PoseSourceType.Camera,
      });
      // post poses to parent frame
      const path = toUrl({
        type: RouteType.Main,
      }, {
        ...context,
        debug: false,
      });
      const subscription = poseStream.subscribe(function (pose) {
        window.parent.postMessage(pose, path);
      });
      return function () {
        subscription.unsubscribe();
        poseStream.complete();
      };
    }, []);

    return <Initializer initialize={initialize} />;
  };

  return { Component };
}
