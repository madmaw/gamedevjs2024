import { createPartialObserverComponent } from 'base/react/partial';
import { UnreachableError } from 'base/unreachable_error';
import { useMemo } from 'react';
import { GenericAsync } from 'ui/components/async/generic';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import { install as installPage } from './pages/install';
import { DetectorType } from './services/detector';
import { install as installServices } from './services/install';
import { type ServiceDescriptor } from './services/types';
import { fromUrl } from './to_url';
import {
  type Route,
  RouteType,
} from './types';
import {
  AsyncModel,
  AsyncPresenter,
} from './ui/async/presenter';
import { Embeds } from './ui/embed';
import { install as installUI } from './ui/install';
import { Display } from './ui/metrics/types';
import { Themes } from './ui/theme/types';

function routeToServiceDescriptor(route: Route): ServiceDescriptor {
  switch (route.type) {
    case RouteType.Main:
      return {
        handDetectorService: 'embedded',
        poseDetectorService: 'embedded',
        loggingService: 'local',
      };
    case RouteType.EmbeddedDetector:
      switch (route.detectorType) {
        case DetectorType.Pose:
          return {
            handDetectorService: undefined,
            poseDetectorService: 'local',
            loggingService: 'local',
          };
        case DetectorType.Hand:
          return {
            handDetectorService: 'local',
            poseDetectorService: undefined,
            loggingService: 'local',
          };
        default:
          throw new UnreachableError(route.detectorType);
      }
    default:
      throw new UnreachableError(route);
  }
}

export function install(url: string) {
  const [
    route,
    context,
  ] = fromUrl(url);

  const serviceDescriptor = routeToServiceDescriptor(route);
  const {
    embeds,
    services,
  } = installServices({ services: serviceDescriptor });

  const {
    ThemeContextProvider,
    MetricsContextProvider,
    LinguiLoader,
    LinguiProvider,
  } = installUI(services);

  const {
    Component: PageComponent,
    loadMessages,
  } = installPage({
    route,
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

    // TODO Component should be allowed to change locale and default theme
    return (
      <SizeProvider size={Size.Large}>
        {/* TODO: theme should also have async loading of fonts */}
        <ThemeContextProvider theme={Themes.Light}>
          <MetricsContextProvider display={Display.Comfortable}>
            <Embeds
              embeds={embeds}
              context={context}
            />
            <LinguiLoader
              asyncController={asyncController}
              loadMessages={loadMessages}
              locales={defaultLocales}
            >
              <ObservingGenericAsync>
                <LinguiProvider loadMessages={loadMessages}>
                  <PageComponent asyncController={asyncController} />
                </LinguiProvider>
              </ObservingGenericAsync>
            </LinguiLoader>
          </MetricsContextProvider>
        </ThemeContextProvider>
      </SizeProvider>
    );
  };
}
