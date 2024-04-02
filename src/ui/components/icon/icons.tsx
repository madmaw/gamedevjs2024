import { type ComponentType } from 'react';
import { type Typography } from 'ui/components/typography/types';
import { useMetrics } from 'ui/metrics';
import { useTheme } from 'ui/theme';
import { AlertIcon as InternalAlertIcon } from './internal/alert';
import {
  ExpandedOrCollapsedIcon as InternalExpandedOrCollapsedIcon,
  type ExpandOrCollapseProps,
} from './internal/expanded_or_collapsed';
import { SpinnerIcon as InternalSpinnerIcon } from './internal/spinner';
import { type IconProps as InternalIconProps } from './internal/types';

export type IconProps = {
  type: Typography,
};

export type Icon<T = {}> = ComponentType<IconProps & T>;

function toInline<
  T,
>(InternalIcon: ComponentType<InternalIconProps & T>): ComponentType<IconProps & T> {
  return function ({
    type,
    ...shared
  }: IconProps & T) {
    const {
      typography,
      strokeWidth,
    } = useMetrics();
    const { foreground } = useTheme();
    const { lineHeight } = typography[type];
    return (
      <InternalIcon
        {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          ...shared as T
        }
        color={foreground}
        height={lineHeight}
        strokeWidth={strokeWidth}
      />
    );
  };
}

export const AlertIcon = toInline<{}>(InternalAlertIcon);
export const ExpandOrCollapseIcon = toInline<ExpandOrCollapseProps>(InternalExpandedOrCollapsedIcon);
export const SpinnerIcon = toInline<{}>(InternalSpinnerIcon);
