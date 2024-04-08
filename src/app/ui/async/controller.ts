export type AsyncTask<T> = () => Promise<T>;

export type AsyncController = {
  append<T>(task: AsyncTask<T>): Promise<T>,
};
