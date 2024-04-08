import {
  type Play,
  type PlayInputs,
} from 'app/pages/play/types';
import {
  AsyncModel,
  AsyncPresenter,
} from 'app/ui/async/presenter';
import { type DetectorInitializer } from 'app/ui/detector/types';
import { type WebcamInitializer } from 'app/ui/webcam/types';
import { usePartialObserverComponent } from 'base/react/partial';
import { useMemo } from 'react';
import { CustomAsync } from 'ui/components/async/custom';
import { PlayFailure } from './failure';
import { PlayLoading } from './loading';

export function install({
  DetectorInitializer,
  WebcamInitializer,
  Play,
}: {
  DetectorInitializer: DetectorInitializer,
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
          state: {
            type: asyncModel.type,
            value: asyncModel.value,
          },
          Loading: PlayLoading,
          Failure: PlayFailure,
          Success: PlaySuccess,
        };
      },
      [asyncModel],
      Async,
    );

    return (
      <DetectorInitializer asyncController={asyncController}>
        <WebcamInitializer asyncController={asyncController}>
          <ObservingAsync />
        </WebcamInitializer>
      </DetectorInitializer>
    );
  };
}
