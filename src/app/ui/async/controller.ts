export type AsyncTask<T> = () => Promise<T>;

export type AsyncController<V> = {
  append<T>(task: AsyncTask<T>, combiner?: (value: V, result: T) => V): Promise<T>,
};
