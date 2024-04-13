export function reverse<
  Key extends string | number | symbol,
  Value extends string | number | symbol,
>(obj: Record<Key, Value>): Record<Value, Key> {
  return Object.keys(obj).reduce((acc, stringKey) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const key = stringKey as Key;
    const value = obj[key];
    acc[value] = key;
    return acc;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  }, {} as Record<Value, Key>);
}

export function combine<
  R extends Record<K, V>,
  K extends string | number | symbol = keyof R,
  V = R[K],
>(...records: Partial<R>[]): R {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return records.reduce<Partial<R>>((acc, record) => {
    Object.keys(record).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const k = key as K;
      acc[k] = acc[k] ?? record[k];
    });
    return acc;
  }, {}) as R;
}
