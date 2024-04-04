import { delay } from 'base/delay';
import { useState } from 'react';
import { GenericAsync } from 'ui/components/async/generic';
import { Stack } from 'ui/components/stack/stack';
import { type Layer } from 'ui/components/stack/types';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import { install as installHome } from './home/install';
import { install as installServices } from './services/install';
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
    LingUIContextProvider,
  } = installUI({ loggingService });
  const Home = installHome();
  async function loadMessages(locale: string) {
    const [messages] = await Promise.all([
      import(`./locales/${locale}.po`),
      delay(1000),
    ]);
    // throw new Error('shit');
    return messages;
  }

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

    return (
      <SizeProvider size={Size.Large}>
        <ThemeContextProvider theme={Themes.Light}>
          <MetricsContextProvider display={Display.Comfortable}>
            <LingUIContextProvider
              locale='en'
              Async={GenericAsync}
              loadMessages={loadMessages}
            >
              <SizeProvider size={Size.Medium}>
                <Stack
                  layers={layers}
                  animationDurationMillis={300}
                />
              </SizeProvider>
            </LingUIContextProvider>
          </MetricsContextProvider>
        </ThemeContextProvider>
      </SizeProvider>
    );
  };
}
