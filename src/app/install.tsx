import { createPartialObserverComponent } from 'base/react/partial';
import { UnreachableError } from 'base/unreachable_error';
import {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { GenericAsync } from 'ui/components/async/generic';
import {
  Size,
  SizeProvider,
} from 'ui/metrics';
import { install as installPage } from './pages/install';
import {
  type Initializer,
  type InitializerProps,
} from './pages/types';
import { DetectorType } from './services/detector';
import { install as installServices } from './services/install';
import { type ServicesDescriptor } from './services/types';
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

function routeToServicesDescriptor(route: Route): ServicesDescriptor {
  switch (route.type) {
    case RouteType.Main:
      return {
        // only need one pose detector to be embedded, can run other on main
        bodyDetectorService: 'embedded',
        handDetectorService: 'local',
        corticalDetectorService: 'local',
        loggingService: 'local',
      };
    case RouteType.EmbeddedDetector:
      switch (route.detectorType) {
        case DetectorType.Pose:
          return {
            bodyDetectorService: 'local',
            handDetectorService: undefined,
            corticalDetectorService: undefined,
            loggingService: 'local',
          };
        case DetectorType.Hand:
          return {
            bodyDetectorService: undefined,
            handDetectorService: 'local',
            corticalDetectorService: undefined,
            loggingService: 'local',
          };
        case DetectorType.Aggregate:
          // TODO: it's probably pretty easy to do, although there's no reason to do it
          throw new Error('Aggregate detector not supported as embedded detector');
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

  const servicesDescriptor = routeToServicesDescriptor(route);
  const {
    embeds,
    services,
  } = installServices({ descriptors: servicesDescriptor });

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
    context,
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

    const Initializer = useCallback<Initializer>(function ({
      children,
      initialize = () => Promise.resolve(undefined),
    }: InitializerProps) {
      useEffect(function () {
        const releasePromise = asyncController.append(initialize);
        return function () {
          releasePromise.then((release) => {
            release?.();
          });
        };
      });
      return (
        <ObservingGenericAsync>
          <LinguiProvider loadMessages={loadMessages}>
            {children}
          </LinguiProvider>
        </ObservingGenericAsync>
      );
    }, [
      asyncController,
      ObservingGenericAsync,
    ]);

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
              <PageComponent Initializer={Initializer} />
            </LinguiLoader>
          </MetricsContextProvider>
        </ThemeContextProvider>
      </SizeProvider>
    );
  };
}
