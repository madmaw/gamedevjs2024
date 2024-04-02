import { createPartialComponent } from 'base/react/partial';
import {
  type FunctionComponent,
  type PropsWithChildren,
  useMemo,
} from 'react';
import { CustomAsync as CustomAsyncImpl } from 'ui/components/async/custom';
import {
  AlertIcon,
  SpinnerIcon,
} from 'ui/components/icon/icons';
import { Information } from 'ui/components/information';
import { RenderChildren } from 'ui/components/render_children';
import { type AsyncStateType } from './types';

export type GenericAsyncProps = PropsWithChildren<{
  state: { type: AsyncStateType },
}>;

// note: has to be typed as FunctionComponent to convince
// TS that it doesn't need an explicit { reason: void } prop
const Failure: FunctionComponent = createPartialComponent(
  Information,
  {
    Icon: AlertIcon,
  },
);

const Loading: FunctionComponent = createPartialComponent(
  Information,
  {
    Icon: SpinnerIcon,
  },
);

export function GenericAsync({
  children,
  state: {
    type,
  },
}: GenericAsyncProps) {
  const CustomAsync = CustomAsyncImpl<void>;
  const state = useMemo(function () {
    return {
      type,
      value: undefined,
      reason: undefined,
      progress: undefined,
    };
  }, [type]);

  return (
    <CustomAsync
      state={state}
      Failure={Failure}
      Loading={Loading}
      Success={RenderChildren}
    >
      {children}
    </CustomAsync>
  );
}
