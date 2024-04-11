import { useEffect } from 'react';

export function useAsyncEffect(
  effect: () => Promise<(() => void) | undefined>,
  deps: ReadonlyArray<unknown>,
) {
  useEffect(
    () => {
      const cleanupPromise = effect();
      return () => {
        cleanupPromise.then((cleanup) => {
          cleanup?.();
        });
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );
}
