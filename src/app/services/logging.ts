export type LoggingParameters = {
  prefix?: string,
  error?: unknown,
};

export type LoggingService = {
  error(
    message: string,
    params?: LoggingParameters,
  ): void,

  errorException(
    error: unknown,
    message?: string,
    params?: Omit<LoggingParameters, 'error'>,
  ): void,

  warn(
    message: string,
    params?: LoggingParameters,
  ): void,

  info(
    message: string,
    params?: LoggingParameters,
  ): void,

  create(
    prefix: string,
    params?: Omit<LoggingParameters, 'prefix'>,
  ): LoggingService,
};
