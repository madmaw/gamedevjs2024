import { createPartialComponent } from 'base/react/partial';
import {
  type FunctionComponent,
  type PropsWithChildren,
  useMemo,
} from 'react';
import { Alignment } from 'ui/alignment';
import { Aligner } from 'ui/components/aligner';
import { CustomAsync as CustomAsyncImpl } from 'ui/components/async/custom';
import {
  AlertIcon,
  SpinnerIcon,
} from 'ui/components/icon/icons';
import { RenderChildren } from 'ui/components/render_children';
import { Typography } from 'ui/components/typography/types';
import { type AsyncStateType } from './types';

export type GenericAsyncProps = PropsWithChildren<{
  state: { type: AsyncStateType },
}>;

// note: has to be typed as FunctionComponent to convince
// TS that it doesn't need an explicit { reason: void } prop
const Failure: FunctionComponent = createPartialComponent(
  Aligner,
  {
    xAlignment: Alignment.Middle,
    yAlignment: Alignment.Middle,
    Icon: <AlertIcon type={Typography.Heading} />,
  },
);

const Loading: FunctionComponent = createPartialComponent(
  Aligner,
  {
    xAlignment: Alignment.Middle,
    yAlignment: Alignment.Middle,
    children: <SpinnerIcon type={Typography.Heading} />,
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
