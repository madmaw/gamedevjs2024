import { Scene as DomainScene } from 'app/domain/scene';
import {
  type Initializer,
  type Page,
} from 'app/pages/types';
import { type CorticalDetectorService } from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import {
  StackModel,
  StackPresenter,
} from 'app/ui/stack/presenter';
import {
  createPartialObserverComponent,
  usePartialComponent,
  usePartialObserverComponent,
} from 'base/react/partial';
import {
  useMemo,
  useState,
} from 'react';
import { Stack } from 'ui/components/stack/stack';
import { Frame } from 'ui/frame';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import { install as installHome } from './home/install';
import { install as installPlay } from './play/install';
import { install as installScene } from './scene/install';

export function install({
  loggingService,
  corticalDetectorService,
  debug,
}: {
  loggingService: LoggingService,
  corticalDetectorService: CorticalDetectorService,
  debug: boolean,
}): Page {
  const {
    rendererRegistry,
    Component: Scene,
  } = installScene();
  const Play = installPlay({
    rendererRegistry,
    corticalDetectorService,
    debug,
  });
  const Home = installHome();
  async function loadMessages(locale: string) {
    const [messages] = await Promise.all([import(`./locales/${locale}.po`)]);
    // throw new Error('shit');
    return messages;
  }

  const stackPresenter = new StackPresenter(loggingService);

  const Component = function ({ Initializer }: { Initializer: Initializer }) {
    const [
      scene,
      // not required? Maybe useRef would be better?
      // setWorld,
    ] = useState(new DomainScene());

    const PlayWithScene = usePartialComponent(function () {
      return {
        scene,
      };
    }, [scene], Play);

    const [ObservingStack] = useMemo(function () {
      // hoist stackController
      function HomeLayerComponent() {
        return (
          <Home
            Play={PlayWithScene}
            stackController={stackController}
          />
        );
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
    }, [PlayWithScene]);

    const ObservingScene = usePartialObserverComponent(
      function () {
        return {
          scene,
        };
      },
      [scene],
      Scene,
    );

    return (
      <Initializer>
        <SizeProvider size={Size.Medium}>
          <Frame>
            <ObservingScene />
            <ObservingStack
              animationDurationMillis={300}
            />
          </Frame>
        </SizeProvider>
      </Initializer>
    );
  };

  return {
    Component,
    loadMessages,
  };
}
