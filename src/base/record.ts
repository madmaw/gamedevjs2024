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
