import { createPartialComponent } from 'base/react/partial';
import {
  Direction,
  LinearLayout,
} from './internal/linear_layout';

export const Row = createPartialComponent(LinearLayout, { direction: Direction.Row });
export const Column = createPartialComponent(LinearLayout, { direction: Direction.Column });
