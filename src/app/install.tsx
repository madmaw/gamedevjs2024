import { delay } from 'base/delay';
import { usePartialObserverComponent } from 'base/react/partial';
import {
  useMemo,
  useState,
} from 'react';
import { GenericAsync } from 'ui/components/async/generic';
import { Stack } from 'ui/components/stack/stack';
import { type Layer } from 'ui/components/stack/types';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import { install as installHome } from './home/install';
import { install as installServices } from './services/install';
import {
  type AsyncController,
  type AsyncTask,
} from './ui/async/controller';
import {
  AsyncModel,
  AsyncPresenter,
} from './ui/async/presenter';
import { install as installUI } from './ui/install';
import { Display } from './ui/metrics/types';
import { Themes } from './ui/theme/types';

export function install() {
  const services = installServices({
    fake: true,
  });

  const { loggingService } = services;
  const {
    ThemeContextProvider,
    MetricsContextProvider,
    LinguiProvider,
    LinguiLoader,
  } = installUI();
  const Home = installHome();
  async function loadMessages(locale: string) {
    const [messages] = await Promise.all([
      import(`./locales/${locale}.po`),
      delay(1000),
    ]);
    // throw new Error('shit');
    return messages;
  }

  const asyncPresenter = new AsyncPresenter();

  return function () {
    const [
      layers,
      setLayers,
    ] = useState<readonly Layer[]>([
      {
        id: 'home',
        Component: Home,
      },
    ]);

    const asyncModel = useMemo(function () {
      return new AsyncModel();
    }, []);
    const asyncController = useMemo<AsyncController>(function () {
      return {
        append: function<T,> (task: AsyncTask<T>) {
          return asyncPresenter.append<T>(asyncModel, task);
        },
      };
    }, [asyncModel]);

    const ObservingGenericAsync = usePartialObserverComponent(function () {
      return {
        state: {
          type: asyncModel.type,
        },
      };
    }, [asyncModel], GenericAsync);

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
                    <Stack
                      layers={layers}
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
