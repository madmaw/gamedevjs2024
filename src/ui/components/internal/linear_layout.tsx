import styled from '@emotion/styled';
import { type PropsWithChildren } from 'react';
import { type Alignment } from 'ui/alignment';

export enum Direction {
  Row = 'row',
  Column = 'column',
}

export type LinearLayoutProps = PropsWithChildren<{
  direction: Direction,
  alignment?: Alignment,
  crossAlignment?: Alignment,
}>;

export const LinearLayout = styled.div<LinearLayoutProps>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  justify-content: ${({ alignment }) => alignment};
  align-items: ${({ crossAlignment }) => crossAlignment};
`;
