import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { type PropsWithChildren } from 'react';
import { Alignment } from 'ui/alignment';
import { Column } from './layout';

export type SpinnerEasing = 'linear' | 'ease-in-out';

export type SpinnerProps = PropsWithChildren<{
  durationMillis?: number,
  easing?: SpinnerEasing,
}>;

const spin = keyframes`
  from {
    transform: rotate(-90deg);
  }
  to {
    transform: rotate(270deg);
  }
`;

const Container = styled(Column)`
  position: relative;
`;

const Animator = styled.div<{ durationMillis: number, easing: SpinnerEasing }>`
  transform-origin: 50% 50%;
  animation: ${spin} ${({ durationMillis }) => durationMillis}ms ${({ easing }) => easing} infinite;
`;

export function Spinner({
  durationMillis = 1000,
  easing = 'ease-in-out',
  children,
}: SpinnerProps) {
  return (
    <Container crossAlignment={Alignment.Middle}>
      <Animator
        durationMillis={durationMillis}
        easing={easing}
      >
        {children}
      </Animator>
    </Container>
  );
}
