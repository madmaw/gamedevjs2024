import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { UnreachableError } from 'base/unreachable_error';
import { useCallback } from 'react';
import {
  type Layer,
  LayerBehavior,
  StackState,
} from 'ui/components/stack/types';
import { Text } from 'ui/components/typography/text';
import { Typography } from 'ui/components/typography/types';

type CommonProps = {
  readonly stackState: StackState,
  readonly requestBack: (layer: Layer) => void,
  readonly animationComplete: (layer: Layer) => void,
  readonly animationDurationMillis: number,
};

export type StackProps = {
  readonly layers: readonly Layer[],
} & CommonProps;

function computeStartingMarginLeft({
  stackState,
  layerBehavior,
  layerDepth,
}: { stackState: StackState, layerBehavior: LayerBehavior, layerDepth: number }): -1 | 0 | 1 {
  switch (stackState) {
    case StackState.Stable:
      switch (layerBehavior) {
        case LayerBehavior.Background:
          return 0;
        case LayerBehavior.Displaced:
          return layerDepth === 0 ? 0 : -1;
        default:
          throw new UnreachableError(layerBehavior);
      }
    case StackState.AnimatingIn:
      if (layerDepth === 0) {
        return 1;
      } else {
        switch (layerBehavior) {
          case LayerBehavior.Background:
            return 0;
          case LayerBehavior.Displaced:
            return layerDepth === 1 ? 0 : -1;
          default:
            throw new UnreachableError(layerBehavior);
        }
      }
    case StackState.AnimatingOut:
      if (layerDepth === 0) {
        return 0;
      } else {
        switch (layerBehavior) {
          case LayerBehavior.Background:
            return 0;
          case LayerBehavior.Displaced:
            return -1;
          default:
            throw new UnreachableError(layerBehavior);
        }
      }
    default:
      throw new UnreachableError(stackState);
  }
}

function computeFinalMarginLeft({
  stackState,
  layerBehavior,
  layerDepth,
}: { stackState: StackState, layerBehavior: LayerBehavior, layerDepth: number }): -1 | 0 | 1 {
  switch (stackState) {
    case StackState.Stable:
      switch (layerBehavior) {
        case LayerBehavior.Background:
          return 0;
        case LayerBehavior.Displaced:
          return layerDepth === 0 ? 0 : -1;
        default:
          throw new UnreachableError(layerBehavior);
      }
    case StackState.AnimatingIn:
      if (layerDepth === 0) {
        return 0;
      } else {
        switch (layerBehavior) {
          case LayerBehavior.Background:
            return 0;
          case LayerBehavior.Displaced:
            return -1;
          default:
            throw new UnreachableError(layerBehavior);
        }
      }
    case StackState.AnimatingOut:
      if (layerDepth === 0) {
        return 1;
      } else {
        switch (layerBehavior) {
          case LayerBehavior.Background:
            return 0;
          case LayerBehavior.Displaced:
            return layerDepth === -1 ? 0 : -1;
          default:
            throw new UnreachableError(layerBehavior);
        }
      }
    default:
      throw new UnreachableError(stackState);
  }
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
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

const LayerContainer = styled.div<{
  layerBehavior: LayerBehavior,
  stackState: StackState,
  layerDepth: number,
  animationDurationMillis: number,
}>`
  label: layer;
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translateX(${(props) => computeStartingMarginLeft(props) * 100}%);
  animation: ${(props) => {
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
}} ${({ animationDurationMillis }) => animationDurationMillis}ms ease-in-out;
`;

type LayerComponentProps = { layer: Layer, depth: number } & CommonProps;

function LayerComponent({
  layer,
  requestBack,
  animationComplete,
  stackState,
  depth,
  animationDurationMillis,
}: LayerComponentProps) {
  const {
    title,
    Component,
    behavior,
  } = layer;
  const requestBackOnLayer = useCallback(function () {
    requestBack(layer);
  }, [
    requestBack,
    layer,
  ]);

  const animationCompleteOnLayer = useCallback(function () {
    animationComplete(layer);
  }, [
    animationComplete,
    layer,
  ]);
  return (
    <LayerContainer
      onAnimationEnd={animationCompleteOnLayer}
      layerBehavior={behavior}
      stackState={stackState}
      layerDepth={depth}
      animationDurationMillis={animationDurationMillis}
    >
      <Text type={Typography.Heading}>
        {title}
      </Text>
      <Component />
    </LayerContainer>
  );
}

export function Stack({
  layers,
  requestBack,
  animationComplete,
  stackState,
  animationDurationMillis,
}: StackProps) {
  return (
    <Container>
      {layers.map(function (layer, index) {
        const layerDepth = layers.length - index - 1;
        return (
          <LayerComponent
            key={layer.id}
            depth={layerDepth}
            layer={layer}
            stackState={stackState}
            requestBack={requestBack}
            animationComplete={animationComplete}
            animationDurationMillis={animationDurationMillis}
          />
        );
      })}
    </Container>
  );
}
