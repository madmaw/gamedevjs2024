import styled from '@emotion/styled';
import { type Alignment } from 'ui/alignment';

export const Aligner = styled.div<{ xAlignment: Alignment, yAlignment: Alignment }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: ${({ xAlignment }) => xAlignment};
  align-items: ${({ yAlignment }) => yAlignment};
`;
