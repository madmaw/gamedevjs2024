import { useCallback } from 'react';

export function useMergedRefs<T>(...refs: React.Ref<T>[]) {
  return useCallback(
    (value: T) => {
      refs.forEach(ref => {
        if (typeof ref === 'function') {
          ref(value);
        } else if (ref != null) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          (ref as React.MutableRefObject<T | null>).current = value;
        }
      });
    },
    [refs],
  );
}
