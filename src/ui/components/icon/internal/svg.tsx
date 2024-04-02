import { type PropsWithChildren } from 'react';
import { type IconProps } from './types';

export function IconSVG({
  width,
  height,
  children,
}: PropsWithChildren<IconProps & { width: number }>) {
  return (
    <svg
      width={width}
      height={height}
      fill='none'
      viewBox={`0 0 ${width} ${height}`}
    >
      {children}
    </svg>
  );
}
