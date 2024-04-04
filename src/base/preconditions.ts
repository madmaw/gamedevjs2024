import Format from 'string-format';

export type Arg = string | number | boolean | null | undefined;

class PreconditionFailedError extends Error {
  constructor(message: string, args: readonly Arg[]) {
    super(Format(message, args));
    this.name = 'PreconditionFailedError';
  }
}

export function checkExists<T>(
  t: T | null | undefined,
  message: string,
  ...args: readonly Arg[]
): NonNullable<T> {
  if (t == null) {
    throw new PreconditionFailedError(message, args);
  }
  return t;
}

export function checkState(
  condition: boolean,
  message: string,
  ...args: readonly Arg[]
): void {
  if (!condition) {
    throw new PreconditionFailedError(message, args);
  }
}
