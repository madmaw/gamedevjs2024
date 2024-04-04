import Color from 'colorjs.io';
import {
  FontStyle,
  FontWeight,
  Typography,
} from 'ui/components/typography/types';
import { type Theme } from 'ui/theme';

export const lightTheme: Theme = {
  foreground: new Color('black'),
  background: new Color('white'),
  typography: {
    [Typography.Body]: {
      fontFamily: 'sans-serif',
      fontStyle: FontStyle.Normal,
      fontWeight: FontWeight.Regular,
    },
    [Typography.Subheading]: {
      fontFamily: 'serif',
      fontStyle: FontStyle.Normal,
      fontWeight: FontWeight.Bold,
    },
    [Typography.Heading]: {
      fontFamily: 'serif',
      fontStyle: FontStyle.Normal,
      fontWeight: FontWeight.Bold,
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  foreground: new Color('white'),
  background: new Color('black'),
};
