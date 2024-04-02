import Format from 'string-format';

export function checkExists<T>(
  t: T | null | undefined,
  message: string,
  ...args: readonly string[]
): NonNullable<T> {
  if (t == null) {
    throw new Error(Format(message, ...args));
  }
  return t;
}
