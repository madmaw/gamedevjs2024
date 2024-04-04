import { type PropsWithChildren } from 'react';
import { ThemeProvider } from 'ui/theme';
import {
  darkTheme,
  lightTheme,
} from './themes';
import { Themes } from './types';

export function install() {
  return function ({
    children,
    theme,
  }: PropsWithChildren<{ theme: Themes }>) {
    return (
      <ThemeProvider theme={theme === Themes.Light ? lightTheme : darkTheme}>
        {children}
      </ThemeProvider>
    );
  };
}
