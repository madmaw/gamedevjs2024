import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type LoggingService } from 'app/services/logging';
import {
  useEffect,
  useMemo,
} from 'react';
import {
  LinguiModel,
  LinguiPresenter,
} from './presenter';
import {
  type LinguiLoader,
  type LinguiLoaderProps,
  type LinguiProvider,
  type LinguiProviderProps,
} from './types';

export function install({
  loggingService,
}: {
  loggingService: LoggingService,
}): {
  LinguiLoader: LinguiLoader,
  LinguiProvider: LinguiProvider,
} {
  const presenter = new LinguiPresenter(loggingService, i18n);

  function LinguiLoader({
    loadMessages,
    locales,
    asyncController,
    children,
  }: LinguiLoaderProps) {
    const model = useMemo(function () {
      return new LinguiModel();
    }, []);
    useEffect(function () {
      if (loadMessages) {
        asyncController.append(
          function () {
            return presenter.loadLocale(model, locales, loadMessages);
          },
        );
      }
    }, [
      model,
      locales,
      loadMessages,
      asyncController,
    ]);
    return (
      <>
        {children}
      </>
    );
  }
  function LinguiProvider({
    children,
    loadMessages,
  }: LinguiProviderProps) {
    return loadMessages
      ? (
        <I18nProvider
          i18n={i18n}
        >
          {children}
        </I18nProvider>
      )
      : (
        <>
          {children}
        </>
      );
  }
  return {
    LinguiLoader,
    LinguiProvider,
  };
}
