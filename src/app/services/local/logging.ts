import {
  type LoggingParameters,
  type LoggingService,
} from 'app/services/logging';
import { UnreachableError } from 'base/unreachable_error';

function combineParams(
  fallbackParams: LoggingParameters | undefined,
  overrideParams: LoggingParameters | undefined,
): LoggingParameters {
  const prefix = fallbackParams?.prefix != null
    ? overrideParams?.prefix != null
      ? `${fallbackParams.prefix}.${overrideParams.prefix}`
      : fallbackParams.prefix
    : overrideParams?.prefix;
  return {
    ...(fallbackParams || {}),
    ...(overrideParams || {}),
    prefix,
  };
}

const enum LogLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export class ConsoleLoggingService implements LoggingService {
  constructor(private readonly defaultParameters: LoggingParameters) {
  }

  create(prefix: string, params: Omit<LoggingParameters, 'prefix'> = {}): LoggingService {
    return new ConsoleLoggingService(
      combineParams(this.defaultParameters, {
        ...params,
        prefix,
      }),
    );
  }

  error(message: string, params?: LoggingParameters | undefined): void {
    this.log(LogLevel.Error, message, params);
  }

  errorException(
    error: unknown,
    message?: string | undefined,
    params: Omit<LoggingParameters, 'error'> = {},
  ): void {
    this.log(LogLevel.Error, message, {
      ...params,
      error,
    });
  }

  warn(message: string, params?: LoggingParameters | undefined): void {
    this.log(LogLevel.Warn, message, params);
  }

  info(message: string, params?: LoggingParameters | undefined): void {
    this.log(LogLevel.Info, message, params);
  }

  private log(
    level: LogLevel,
    message: string | undefined,
    params: LoggingParameters | undefined,
  ) {
    const {
      prefix,
      error,
    } = combineParams(this.defaultParameters, params);
    const parts: unknown[] = [];
    if (prefix != null) {
      parts.push(prefix);
    }
    if (message != null) {
      parts.push(message);
    }
    if (error != null) {
      parts.push(error);
    }
    switch (level) {
      case LogLevel.Error:
        // eslint-disable-next-line no-console
        return console.error(...parts);
      case LogLevel.Warn:
        // eslint-disable-next-line no-console
        return console.warn(...parts);
      case LogLevel.Info:
        // eslint-disable-next-line no-console
        return console.info(...parts);
      default:
        throw new UnreachableError(level);
    }
  }
}
