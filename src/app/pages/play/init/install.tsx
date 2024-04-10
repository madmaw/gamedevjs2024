import {
  type Play,
  type PlayInputs,
} from 'app/pages/play/types';
import {
  AsyncModel,
  AsyncPresenter,
} from 'app/ui/async/presenter';
import { type PoseDetectorInitializer } from 'app/ui/detector/types';
import { type WebcamInitializer } from 'app/ui/webcam/types';
import { usePartialObserverComponent } from 'base/react/partial';
import { useMemo } from 'react';
import { CustomAsync } from 'ui/components/async/custom';
import { PlayFailure } from './failure';
import { PlayLoading } from './loading';

export function install({
  PoseDetectorInitializer,
  WebcamInitializer,
  Play,
}: {
  PoseDetectorInitializer: PoseDetectorInitializer,
  WebcamInitializer: WebcamInitializer,
  Play: Play,
}) {
  const asyncPresenter = new AsyncPresenter<PlayInputs>();
  const Async = CustomAsync<PlayInputs>;

  function PlaySuccess({ value }: { value: PlayInputs }) {
    return <Play {...value} />;
  }

  return function () {
    const [
      asyncModel,
      asyncController,
    ] = useMemo(function () {
      const asyncModel = new AsyncModel<PlayInputs>({});
      const asyncController = asyncPresenter.createController(asyncModel);
      return [
        asyncModel,
        asyncController,
      ] as const;
    }, []);

    const ObservingAsync = usePartialObserverComponent(
      function () {
        return {
          // TODO is there a better way to force observing changes on model?
          // would be nice to just have `state: asyncModel,`
          state: {
            type: asyncModel.type,
            value: asyncModel.value,
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

    const ObservingPoseDetectorInitializer = usePartialObserverComponent(
      function () {
        return {
          // TODO value.webcam is not observable so this will probably never rerender!
          webcam: asyncModel.value.webcam,
        };
      },
      [asyncModel],
      PoseDetectorInitializer,
    );

    return (
      <ObservingPoseDetectorInitializer asyncController={asyncController}>
        <WebcamInitializer asyncController={asyncController}>
          <ObservingAsync />
        </WebcamInitializer>
      </ObservingPoseDetectorInitializer>
    );
  };
}
