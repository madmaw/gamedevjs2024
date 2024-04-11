import { delay } from 'base/delay';
import { createPartialObserverComponent } from 'base/react/partial';
import { useMemo } from 'react';
import { GenericAsync } from 'ui/components/async/generic';
import { Stack } from 'ui/components/stack/stack';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import { install as installHome } from './pages/home/install';
import { install as installPlay } from './pages/play/install';
import { install as installServices } from './services/install';
import {
  AsyncModel,
  AsyncPresenter,
} from './ui/async/presenter';
import { install as installDetectorInitializer } from './ui/detector/install';
import { install as installUI } from './ui/install';
import { Display } from './ui/metrics/types';
import {
  StackModel,
  StackPresenter,
} from './ui/stack/presenter';
import { Themes } from './ui/theme/types';

export function install() {
  const services = installServices({
    fake: true,
  });

  const {
    loggingService,
    detectorService,
  } = services;

  const poseDetectorStreamFactory = installDetectorInitializer({
    detectorService,
  });

  const {
    ThemeContextProvider,
    MetricsContextProvider,
    LinguiProvider,
    LinguiLoader,
  } = installUI();
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

  const asyncPresenter = new AsyncPresenter<void>();
  const stackPresenter = new StackPresenter(loggingService);

  return function () {
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

    const [
      asyncController,
      ObservingGenericAsync,
    ] = useMemo(function () {
      const asyncModel = new AsyncModel<void>(undefined);
      const asyncController = asyncPresenter.createController(asyncModel);
      const ObservingGenericAsync = createPartialObserverComponent(GenericAsync, function () {
        return {
          state: {
            type: asyncModel.type,
          },
        };
      });
      return [
        asyncController,
        ObservingGenericAsync,
      ] as const;
    }, []);

    return (
      <SizeProvider size={Size.Large}>
        <ThemeContextProvider theme={Themes.Light}>
          <MetricsContextProvider display={Display.Comfortable}>
            <LinguiLoader
              locale={'en'}
              loadMessages={loadMessages}
              asyncController={asyncController}
            >
              <ObservingGenericAsync>
                <LinguiProvider>
                  <SizeProvider size={Size.Medium}>
                    <ObservingStack
                      animationDurationMillis={300}
                    />
                  </SizeProvider>
                </LinguiProvider>
              </ObservingGenericAsync>
            </LinguiLoader>
          </MetricsContextProvider>
        </ThemeContextProvider>
      </SizeProvider>
    );
  };
}
