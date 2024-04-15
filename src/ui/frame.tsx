import styled from '@emotion/styled';
import {
  Children,
  type PropsWithChildren,
} from 'react';

const FrameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ChildContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export function Frame({ children }: PropsWithChildren) {
  return (
    <FrameContainer>
      {Children.map(children, function (child) {
        return (
          <ChildContainer>
            {child}
          </ChildContainer>
        );
      })}
    </FrameContainer>
  );
}
