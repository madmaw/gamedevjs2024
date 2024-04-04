import {
  type I18n,
  type Messages,
} from '@lingui/core';
import { type LoggingService } from 'app/services/logging';
import { UnreachableError } from 'base/unreachable_error';
import {
  computed,
  observable,
  runInAction,
} from 'mobx';
import {
  type AsyncState,
  AsyncStateType,
} from 'ui/components/async/types';

export class LinguiPresenter {
  constructor(
    private readonly i18n: I18n,
    private readonly loadMessages: (locale: string) => Promise<Messages>,
    private readonly loggingService: LoggingService,
  ) {
  }

  async requestLoadLocale(model: LinguiModel, locale: string) {
    model.pendingLocale = locale;
    try {
      if (![...(this.i18n.locales || [])].some(installedLocale => installedLocale === locale)) {
        runInAction(function () {
          model.type = AsyncStateType.Loading;
        });
        const messages = await this.loadMessages(locale);
        this.i18n.load(locale, messages);
      }
      if (locale === model.pendingLocale) {
        this.i18n.activate(locale);
        runInAction(function () {
          model.type = AsyncStateType.Success;
        });
      }
    } catch (e) {
      if (locale === model.pendingLocale) {
        runInAction(function () {
          model.type = AsyncStateType.Failure;
        });
      }
      this.loggingService.errorException(e, `unable to load locale: ${locale}`);
    }
  }
}

export class LinguiModel {
  @observable.ref
  accessor type: AsyncStateType = AsyncStateType.Loading;

  @computed
  get state(): AsyncState<void, void, void> {
    switch (this.type) {
      case AsyncStateType.Success:
        return {
          type: AsyncStateType.Success,
          value: undefined,
        };
      case AsyncStateType.Failure:
        return {
          type: AsyncStateType.Failure,
          reason: undefined,
        };
      case AsyncStateType.Loading:
        return {
          type: AsyncStateType.Loading,
          progress: undefined,
        };
      default:
        throw new UnreachableError(this.type);
    }
  }

  pendingLocale: string | undefined;

  constructor() {
  }
}
