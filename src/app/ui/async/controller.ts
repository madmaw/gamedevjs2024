export type AsyncTask<T> = () => Promise<T>;

export type AsyncController<V = void> = {
  append<T>(task: AsyncTask<T>, combiner?: (value: V, result: T) => V): Promise<T>,
};
