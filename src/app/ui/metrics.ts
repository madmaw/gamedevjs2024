import { Typography } from 'ui/components/typography/types';
import {
  type Metrics,
  Size,
} from 'ui/metrics';

// TODO desktop and mobile metrics
export const metrics: Record<Size, Metrics> = {
  [Size.Small]: {
    borderWidth: 1,
    gridBaseline: 2,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 4,
        lineHeight: 6,
      },
      [Typography.Subheading]: {
        fontSize: 5,
        lineHeight: 8,
      },
      [Typography.Heading]: {
        fontSize: 7,
        lineHeight: 9,
      },
    },
    borderRadius: 4,
  },
  [Size.Medium]: {
    borderWidth: 1,
    gridBaseline: 2,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 6,
        lineHeight: 9,
      },
      [Typography.Subheading]: {
        fontSize: 8,
        lineHeight: 11,
      },
      [Typography.Heading]: {
        fontSize: 10,
        lineHeight: 13,
      },
    },
    borderRadius: 8,
  },
  [Size.Large]: {
    borderWidth: 1,
    gridBaseline: 2,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 8,
        lineHeight: 12,
      },
      [Typography.Subheading]: {
        fontSize: 11,
        lineHeight: 15,
      },
      [Typography.Heading]: {
        fontSize: 14,
        lineHeight: 18,
      },
    },
    borderRadius: 12,
  },
};
