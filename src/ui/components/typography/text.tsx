import { type PropsWithChildren } from 'react';
import { Alignment } from 'ui/alignment';
import { useMetrics } from 'ui/metrics';
import { useTheme } from 'ui/theme';
import { StyledText } from './internal/text';
import { Typography } from './types';

export function Text({
  alignment = Alignment.Start,
  type = Typography.Body,
  children,
}: PropsWithChildren<{
  alignment?: Alignment,
  type?: Typography,
}>) {
  const {
    typography: metricsTypography,
  } = useMetrics();
  const {
    fontSize,
    lineHeight,
  } = metricsTypography[type];
  const {
    foreground,
    typography: themeTypography,
  } = useTheme();
  const {
    fontFamily,
    fontStyle,
    fontWeight,
  } = themeTypography[type];

  return (
    <StyledText
      alignment={alignment}
      foreground={foreground}
      fontFamily={fontFamily}
      fontSize={fontSize}
      lineHeight={lineHeight}
      fontStyle={fontStyle}
      fontWeight={fontWeight}
    >
      {children}
    </StyledText>
  );
}
