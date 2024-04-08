import {
  type I18n,
  type Messages,
} from '@lingui/core';

class LocalLoadError extends Error {
  constructor(locale: string, cause: unknown) {
    super(`unable to load locale: ${locale}`, {
      cause,
    });
  }
}

export class LinguiPresenter {
  constructor(private readonly i18n: I18n) {
  }

  async requestLoadLocale(
    model: LinguiModel,
    locale: string,
    loadMessages: (locale: string) => Promise<Messages>,
  ) {
    model.pendingLocale = locale;
    try {
      if (![...(this.i18n.locales || [])].some(installedLocale => installedLocale === locale)) {
        const messages = await loadMessages(locale);
        this.i18n.load(locale, messages);
      }
      if (locale === model.pendingLocale) {
        this.i18n.activate(locale);
      }
    } catch (e) {
      throw new LocalLoadError(locale, e);
    }
  }
}

export class LinguiModel {
  pendingLocale: string | undefined;

  constructor() {
  }
}
