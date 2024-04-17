export type Node<T> = {
  readonly value: T,
  readonly connections: readonly Node<T>[],
};
