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
    const asyncModel = useMemo(function () {
      return new AsyncModel<PlayInputs>({});
    }, []);

    const asyncController = useMemo(function () {
      return asyncPresenter.createController(asyncModel);
    }, [asyncModel]);

    const ObservingAsync = usePartialObserverComponent(
      function () {
        return {
          // TODO may not observe changes on this model
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
