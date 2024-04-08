import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import {
  type PropsWithChildren,
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
} from './types';

export function install(): {
  LinguiLoader: LinguiLoader,
  LinguiProvider: React.ComponentType<PropsWithChildren>,
} {
  const presenter = new LinguiPresenter(i18n);

  function LinguiLoader({
    loadMessages,
    locale,
    children,
    asyncController,
  }: LinguiLoaderProps) {
    const model = useMemo(function () {
      return new LinguiModel();
    }, []);
    useEffect(function () {
      asyncController.append(function () {
        return presenter.requestLoadLocale(model, locale, loadMessages);
      });
    }, [
      model,
      locale,
      loadMessages,
      asyncController,
    ]);
    return (
      <>
        {children}
      </>
    );
  }
  function LinguiProvider({ children }: PropsWithChildren) {
    return (
      <I18nProvider
        i18n={i18n}
      >
        {children}
      </I18nProvider>
    );
  }
  return {
    LinguiLoader,
    LinguiProvider,
  };
}
