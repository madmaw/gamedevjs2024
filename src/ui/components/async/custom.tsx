import { UnreachableError } from 'base/unreachable_error';
import { type PropsWithChildren } from 'react';
import {
  type AsyncState,
  AsyncStateType,
} from './types';

export type CustomAsyncProps<Value, Reason, Progress> = PropsWithChildren<{
  state: AsyncState<Value, Reason, Progress>,
  Success: React.ComponentType<PropsWithChildren<{ value: Value }>>,
  Failure: React.ComponentType<{ reason: Reason }>,
  Loading: React.ComponentType<{ progress: Progress }>,
}>;

export function CustomAsync<Value, Progress = void, Reason = void>({
  state,
  children,
  Loading,
  Success,
  Failure,
}: CustomAsyncProps<Value, Progress, Reason>) {
  switch (state.type) {
    case AsyncStateType.Success:
      return (
        <Success {...state}>
          {children}
        </Success>
      );
    case AsyncStateType.Loading:
      return <Loading {...state} />;
    case AsyncStateType.Failure:
      return <Failure {...state} />;
    default:
      throw new UnreachableError(state);
  }
}
