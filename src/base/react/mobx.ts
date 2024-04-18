import {
  autorun,
  type IReactionOptions,
  reaction,
  when,
} from 'mobx';
import {
  type DependencyList,
  useEffect,
} from 'react';

export function useWhen(predicate: () => boolean, deps: DependencyList, callback: () => void) {
  useEffect(function () {
    return when(predicate, callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useReaction<T>(
  expression: () => T,
  deps: DependencyList,
  effect: (value: T) => void,
  options?: IReactionOptions<T, boolean>,
) {
  useEffect(function () {
    return reaction(expression, effect, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useAutorun(effect: () => void, deps: DependencyList) {
  useEffect(function () {
    return autorun(effect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
