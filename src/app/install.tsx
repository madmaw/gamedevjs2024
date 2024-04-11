import { createPartialObserverComponent } from 'base/react/partial';
import { useMemo } from 'react';
import { GenericAsync } from 'ui/components/async/generic';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import {
  install as installPage,
  Mode,
} from './pages/install';
import { install as installServices } from './services/install';
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

  const {
    ThemeContextProvider,
    MetricsContextProvider,
    LinguiLoader,
    LinguiProvider,
  } = installUI(services);
  const [
    Component,
    loadMessages,
  ] = installPage({
    mode: Mode.Main,
    services,
  });

  const asyncPresenter = new AsyncPresenter();

  const defaultLocales = [navigator.language].concat(...(navigator.languages || []), 'en');

  // create a loading component with no text so we can use it while loading
  // fonts and i18n resources
  return function () {
    const [
      asyncController,
      ObservingGenericAsync,
    ] = useMemo(function () {
      const asyncModel = new AsyncModel(undefined);
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

    // TODO Component should be allowed to change locale
    return (
      <SizeProvider size={Size.Large}>
        {/* TODO: theme should also have async loading of fonts */}
        <ThemeContextProvider theme={Themes.Light}>
          <MetricsContextProvider display={Display.Comfortable}>
            <LinguiLoader
              asyncController={asyncController}
              loadMessages={loadMessages}
              locales={defaultLocales}
            >
              <ObservingGenericAsync>
                <LinguiProvider loadMessages={loadMessages}>
                  <Component />
                </LinguiProvider>
              </ObservingGenericAsync>
            </LinguiLoader>
          </MetricsContextProvider>
        </ThemeContextProvider>
      </SizeProvider>
    );
  };
}
