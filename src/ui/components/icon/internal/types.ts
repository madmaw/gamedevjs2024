import type Color from 'colorjs.io';
import { type ComponentType } from 'react';

export type IconProps = {
  color: Color,
  height: number,
  strokeWidth: number,
};

export type Icon = ComponentType<IconProps>;
