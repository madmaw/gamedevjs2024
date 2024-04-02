import { observer } from 'mobx-react';
import type { ComponentType } from 'react';

export function createPartialComponent<
  ComponentProps,
  CurriedProps,
>(
  Component: ComponentType<ComponentProps>,
  curriedProps: CurriedProps,
) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const C = Component as ComponentType<CurriedProps & RemainingComponentProps<ComponentProps, CurriedProps>>;
  return function (exposedProps: RemainingComponentProps<ComponentProps, CurriedProps>) {
    return (
      <C
        {...curriedProps}
        {...exposedProps}
      />
    );
  };
}

export function createPartialObserverComponent<
  ComponentProps,
  CurriedProps,
  AdditionalProps = {},
>(
  Component: ComponentType<ComponentProps>,
  curriedPropsSource: (additionalProps: AdditionalProps) => CurriedProps,
) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const C = Component as ComponentType<CurriedProps & RemainingComponentProps<ComponentProps, CurriedProps>>;
  return observer(function (exposedProps: RemainingComponentProps<ComponentProps, CurriedProps> & AdditionalProps) {
    return (
      <C
        {...curriedPropsSource(exposedProps)}
        {...exposedProps}
      />
    );
  });
}

type RemainingComponentProps<ComponentProps, CurriedProps> =
  & Omit<ComponentProps, keyof CurriedProps>
  & JSX.IntrinsicAttributes;
