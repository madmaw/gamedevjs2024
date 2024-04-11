import { type Pose } from '@tensorflow-models/pose-detection';
import { type DetectorService } from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import { install as installDetectorInitializer } from 'app/ui/detector/install';
import {
  StackModel,
  StackPresenter,
} from 'app/ui/stack/presenter';
import { delay } from 'base/delay';
import { createPartialObserverComponent } from 'base/react/partial';
import { useMemo } from 'react';
import { Stack } from 'ui/components/stack/stack';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import { install as installHome } from './home/install';
import { install as installPlay } from './play/install';

export function install({
  loggingService,
  detectorService,
}: {
  loggingService: LoggingService,
  detectorService: DetectorService<readonly Pose[]>,
}) {
  const poseDetectorStreamFactory = installDetectorInitializer({
    detectorService,
  });

  const Play = installPlay({
    poseDetectorStreamFactory,
  });
  const Home = installHome({
    Play,
  });
  async function loadMessages(locale: string) {
    const [messages] = await Promise.all([
      import(`./locales/${locale}.po`),
      delay(1000),
    ]);
    // throw new Error('shit');
    return messages;
  }

  const stackPresenter = new StackPresenter(loggingService);

  const Component = function () {
    const [ObservingStack] = useMemo(function () {
      // hoist stackController
      function HomeLayerComponent() {
        return <Home stackController={stackController} />;
      }
      const stackModel = new StackModel({
        id: 'home',
        Component: HomeLayerComponent,
      });
      const stackController = stackPresenter.createController(stackModel);
      const ObservingStack = createPartialObserverComponent(Stack, function () {
        return {
          layers: stackModel.layers,
        };
      });
      return [ObservingStack] as const;
    }, []);

    return (
      <SizeProvider size={Size.Medium}>
        <ObservingStack
          animationDurationMillis={300}
        />
      </SizeProvider>
    );
  };

  return [
    Component,
    loadMessages,
  ] as const;
}
