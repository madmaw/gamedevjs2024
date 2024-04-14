import {
  type Play,
  type PlayProps,
} from 'app/pages/main/play/types';
import {
  type CorticalDetectorService,
  PoseSourceType,
} from 'app/services/detector';
import {
  AsyncModel,
  AsyncPresenter,
} from 'app/ui/async/presenter';
import { useAsyncEffect } from 'base/react/async';
import { usePartialObserverComponent } from 'base/react/partial';
import { useMemo } from 'react';
import { CustomAsync } from 'ui/components/async/custom';
import { PlayFailure } from './failure';
import { PlayLoading } from './loading';

export function install({
  corticalDetectorService,
  Play,
}: {
  corticalDetectorService: CorticalDetectorService,
  Play: Play,
}) {
  const asyncPresenter = new AsyncPresenter<PlayProps>();
  const Async = CustomAsync<PlayProps>;

  function PlaySuccess({ value }: { value: PlayProps }) {
    return <Play {...value} />;
  }

  return function () {
    const asyncModel = useMemo(function () {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return new AsyncModel<PlayProps>({} as PlayProps);
    }, []);

    useAsyncEffect(async function () {
      const corticalStream = await asyncPresenter.append(
        asyncModel,
        async function () {
          const detector = await corticalDetectorService.loadDetector();
          return detector.detect({
            type: PoseSourceType.Camera,
          });
        },
        function (value, corticalStream) {
          value.corticalStream = corticalStream;
          return value;
        },
      );
      return function () {
        corticalStream.complete();
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
