import Format from 'string-format';

export class UnreachableError extends Error {
  constructor(v: never) {
    super(Format('Unreachable value supplied: {0}', v));
  }
}
