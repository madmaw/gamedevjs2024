import { Typography } from 'ui/components/typography/types';
import {
  type Metrics,
  Size,
} from 'ui/metrics';

export const comfortable: Record<Size, Metrics> = {
  [Size.Small]: {
    borderWidth: 1,
    gridBaseline: 8,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 18,
        lineHeight: 20,
      },
      [Typography.Subheading]: {
        fontSize: 20,
        lineHeight: 24,
      },
      [Typography.Heading]: {
        fontSize: 24,
        lineHeight: 28,
      },
    },
    borderRadius: 2,
  },
  [Size.Medium]: {
    borderWidth: 1,
    gridBaseline: 8,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 24,
        lineHeight: 32,
      },
      [Typography.Subheading]: {
        fontSize: 32,
        lineHeight: 40,
      },
      [Typography.Heading]: {
        fontSize: 40,
        lineHeight: 48,
      },
    },
    borderRadius: 4,
  },
  [Size.Large]: {
    borderWidth: 1,
    gridBaseline: 8,
    strokeWidth: 1,
    typography: {
      [Typography.Body]: {
        fontSize: 40,
        lineHeight: 48,
      },
      [Typography.Subheading]: {
        fontSize: 52,
        lineHeight: 60,
      },
      [Typography.Heading]: {
        fontSize: 60,
        lineHeight: 72,
      },
    },
    borderRadius: 8,
  },
};
