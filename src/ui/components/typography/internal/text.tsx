import styled from '@emotion/styled';
import type Color from 'colorjs.io';
import { type PropsWithChildren } from 'react';
import { type Alignment } from 'ui/alignment';
import {
  type FontStyle,
  type FontWeight,
} from 'ui/components/typography/types';

export type StyledTextProps = PropsWithChildren<{
  fontFamily: string,
  fontSize: number,
  fontStyle: FontStyle,
  fontWeight: FontWeight,
  lineHeight: number,
  foreground: Color,
  alignment: Alignment,
}>;

export const StyledText = styled.span<StyledTextProps>`
  font-family: ${({ fontFamily }) => fontFamily};
  font-size: ${({ fontSize }) => fontSize}vmin;
  font-style: ${({ fontStyle }) => fontStyle};
  font-weight: ${({ fontWeight }) => fontWeight};
  line-height: ${({ lineHeight }) => lineHeight}vmin;
  color: ${({ foreground }) => foreground.toString()};
  text-align: ${({ alignment }) => alignment};
`;
