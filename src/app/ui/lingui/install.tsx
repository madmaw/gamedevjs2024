import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type LoggingService } from 'app/services/logging';
import { usePartialObserverComponent } from 'base/react/partial';
import {
  useEffect,
  useMemo,
} from 'react';
import { GenericAsync } from 'ui/components/async/generic';
import {
  LinguiModel,
  LinguiPresenter,
} from './presenter';
import {
  type LinguiWrapper,
  type LinguiWrapperProps,
} from './types';

export function install({
  loggingService,
}: {
  loggingService: LoggingService,
}): LinguiWrapper {
  return function ({
    loadMessages,
    locale,
    children,
  }: LinguiWrapperProps) {
    const model = useMemo(function () {
      return new LinguiModel();
    }, []);
    const presenter = useMemo(function () {
      return new LinguiPresenter(i18n, loadMessages, loggingService);
    }, [loadMessages]);

    useEffect(function () {
      presenter.requestLoadLocale(model, locale);
    }, [
      model,
      presenter,
      locale,
    ]);

    const ObserverAsync = usePartialObserverComponent(
      function () {
        return {
          state: model.state,
        };
      },
      [model],
      GenericAsync,
    );

    return (
      <ObserverAsync>
        <I18nProvider i18n={i18n}>
          {children}
        </I18nProvider>
      </ObserverAsync>
    );
  };
}
