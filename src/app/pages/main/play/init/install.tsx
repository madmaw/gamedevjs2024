import {
  type Play,
  type PlayProps,
} from 'app/pages/main/play/types';
import {
  AsyncModel,
  AsyncPresenter,
} from 'app/ui/async/presenter';
import { type PoseDetectorStreamFactory } from 'app/ui/detector/types';
import { useAsyncEffect } from 'base/react/async';
import { usePartialObserverComponent } from 'base/react/partial';
import { useMemo } from 'react';
import { createCamera } from 'ui/camera';
import { CustomAsync } from 'ui/components/async/custom';
import { PlayFailure } from './failure';
import { PlayLoading } from './loading';

export function install({
  poseDetectorStreamFactory,
  Play,
}: {
  poseDetectorStreamFactory: PoseDetectorStreamFactory,
  Play: Play,
}) {
  const asyncPresenter = new AsyncPresenter<PlayProps>();
  const Async = CustomAsync<PlayProps>;

  function PlaySuccess({ value }: { value: PlayProps }) {
    return <Play {...value} />;
  }

  return function () {
    const asyncModel = useMemo(function () {
      return new AsyncModel<PlayProps>();
    }, []);

    useAsyncEffect(async function () {
      const {
        camera,
        poseStream,
      } = await asyncPresenter.append(
        asyncModel,
        async function () {
          const camera = await createCamera();
          const poseStream = await poseDetectorStreamFactory(camera);
          camera.play();
          return {
            camera,
            poseStream,
          };
        },
        function (_value, result) {
          return result;
        },
      );
      return function () {
        camera.pause();
        poseStream.complete();
      };
    }, [asyncModel]);

    const ObservingAsync = usePartialObserverComponent(
      function () {
        return {
          // TODO is there a better way to force observing changes on model?
          // would be nice to just have `state: asyncModel,`
          state: {
            type: asyncModel.type,
            value: asyncModel.value!,
            // TODO could have progress based on how much of the value is populated
            progress: undefined,
            reason: undefined,
          },
          Loading: PlayLoading,
          Failure: PlayFailure,
          Success: PlaySuccess,
        };
      },
      [asyncModel],
      Async,
    );

    return <ObservingAsync />;
  };
}
