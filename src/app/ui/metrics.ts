import { Typography } from 'ui/components/typography/types';
import {
  type Metrics,
  Size,
} from 'ui/metrics';

// TODO desktop and mobile metrics
export const metrics: Record<Size, Metrics> = {
  [Size.Small]: {
    borderWidth: 1,
    gridBaseline: 8,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 14,
        lineHeight: 20,
      },
      [Typography.Subheading]: {
        fontSize: 16,
        lineHeight: 24,
      },
      [Typography.Heading]: {
        fontSize: 24,
        lineHeight: 32,
      },
    },
    borderRadius: 4,
  },
  [Size.Medium]: {
    borderWidth: 1,
    gridBaseline: 8,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 16,
        lineHeight: 24,
      },
      [Typography.Subheading]: {
        fontSize: 20,
        lineHeight: 28,
      },
      [Typography.Heading]: {
        fontSize: 32,
        lineHeight: 40,
      },
    },
    borderRadius: 8,
  },
  [Size.Large]: {
    borderWidth: 1,
    gridBaseline: 8,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 18,
        lineHeight: 28,
      },
      [Typography.Subheading]: {
        fontSize: 24,
        lineHeight: 32,
      },
      [Typography.Heading]: {
        fontSize: 40,
        lineHeight: 48,
      },
    },
    borderRadius: 12,
  },
};
