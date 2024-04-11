import {
  type I18n,
  type Messages,
} from '@lingui/core';
import { type LoggingService } from 'app/services/logging';
import { exists } from 'base/exists';

class LocalesLoadError extends Error {
  constructor(locales: readonly string[], cause: unknown) {
    super(`unable to load locales: ${locales.join()}`, {
      cause,
    });
  }
}

function cleanLocales(locales: readonly string[]): readonly string[] {
  return locales
    .filter(exists)
    // allow dropping back to parent locales
    .flatMap(locale => {
      return locale
        .split('-')
        // create the full chain of locales
        .map((_, i, arr) => {
          return arr.slice(0, i + 1)
            .join('-');
        })
        // longest to shortest
        .reverse();
    })
    // remove duplicates
    .filter((value, i, arr) => arr.slice(0, i).indexOf(value) === -1);
}

export class LinguiPresenter {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly i18n: I18n,
  ) {
  }

  async loadLocale(
    model: LinguiModel,
    locales: readonly string[],
    loadMessages: (locale: string) => Promise<Messages>,
  ) {
    const cleanedLocales = cleanLocales(locales);
    // try to find a supported message
    for (const locale of cleanedLocales) {
      model.pendingLocale = locale;
      try {
        if (![...(this.i18n.locales || [])].some(installedLocale => installedLocale === locale)) {
          const messages = await loadMessages(locale);
          this.i18n.load(locale, messages);
        }
        if (locale === model.pendingLocale) {
          this.i18n.activate(locale);
        }
        break;
      } catch (e) {
        if (locale === cleanedLocales[cleanedLocales.length - 1]) {
          throw new LocalesLoadError(cleanedLocales, e);
        } else {
          // just keep going
          this.loggingService.warn(`failed to load locale: ${locale}`, {
            error: e,
          });
        }
      }
    }
  }
}

export class LinguiModel {
  pendingLocale: string | undefined;

  constructor() {
  }
}
