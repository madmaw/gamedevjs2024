import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { UnreachableError } from 'base/unreachable_error';
import {
  type PropsWithChildren,
  useCallback,
} from 'react';
import { Column } from 'ui/components/layout';
import {
  type Layer,
  StackState,
} from 'ui/components/stack/types';

type CommonProps = {
  readonly stackState: StackState,
  readonly animationComplete: (layer: Layer) => void,
  readonly animationDurationMillis: number,
};

export type StackProps = PropsWithChildren<{
  readonly layers: readonly Layer[],
} & CommonProps>;

function computeStartingMarginLeft({
  stackState,
  layerDepth,
}: { stackState: StackState, layerDepth: number }): -1 | 0 | 1 {
  switch (stackState) {
    case StackState.Stable:
      return layerDepth === 0 ? 0 : -1;
    case StackState.AnimatingIn:
      return layerDepth === 0 ? 1 : layerDepth === 1 ? 0 : -1;
    case StackState.AnimatingOut:
      return layerDepth === 0 ? 0 : -1;
    default:
      throw new UnreachableError(stackState);
  }
}

function computeFinalMarginLeft({
  stackState,
  layerDepth,
}: { stackState: StackState, layerDepth: number }): -1 | 0 | 1 {
  switch (stackState) {
    case StackState.Stable:
      return layerDepth === 0 ? 0 : -1;
    case StackState.AnimatingIn:
      return layerDepth === 0 ? 0 : -1;
    case StackState.AnimatingOut:
      return layerDepth === 0 ? 1 : layerDepth === 1 ? 0 : -1;
    default:
      throw new UnreachableError(stackState);
  }
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const layer0To1 = keyframes`
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(100%);
  }
`;

const layer0ToNeg1 = keyframes`
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-100%);
  }
`;

const layer1To0 = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0%);
  }
`;

const layerNeg1To0 = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0%);
  }
`;

const LayerContainer = styled(Column)<{
  stackState: StackState,
  layerDepth: number,
  animationDurationMillis: number,
}>`
  label: layer;
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateX(${(props) => computeStartingMarginLeft(props) * 100}%);
  animation: 
  ${(props) => {
  const startingMarginLeft = computeStartingMarginLeft(props);
  const finalMarginLeft = computeFinalMarginLeft(props);
  return startingMarginLeft === -1 && finalMarginLeft === 0 ? layerNeg1To0 : (
    startingMarginLeft === 0 && finalMarginLeft === 1 ? layer0To1 : (
      startingMarginLeft === 0 && finalMarginLeft === -1 ? layer0ToNeg1 : (
        startingMarginLeft === 1 && finalMarginLeft === 0 ? layer1To0 : (
          null
        )
      )
    )
  );
}}
  ${({ animationDurationMillis }) => animationDurationMillis}ms
  ease-out forwards;
`;

type LayerComponentProps = { layer: Layer, depth: number } & CommonProps;

function LayerComponent({
  layer,
  animationComplete,
  stackState,
  depth,
  animationDurationMillis,
}: LayerComponentProps) {
  const {
    Component,
  } = layer;

  const animationCompleteOnLayer = useCallback(function () {
    animationComplete(layer);
  }, [
    animationComplete,
    layer,
  ]);

  return (
    <LayerContainer
      onAnimationEnd={depth === 0 ? animationCompleteOnLayer : undefined}
      stackState={stackState}
      layerDepth={depth}
      animationDurationMillis={animationDurationMillis}
    >
      <Component />
    </LayerContainer>
  );
}

export function Stack({
  layers,
  animationComplete,
  stackState,
  animationDurationMillis,
  children,
}: StackProps) {
  return (
    <Container>
      {children}
      {layers.map(function (layer, index) {
        const layerDepth = layers.length - index - 1;
        return (
          <LayerComponent
            key={layer.id}
            depth={layerDepth}
            layer={layer}
            stackState={stackState}
            animationComplete={animationComplete}
            animationDurationMillis={animationDurationMillis}
          />
        );
      })}
    </Container>
  );
}
