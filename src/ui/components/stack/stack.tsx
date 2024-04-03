import { UnreachableError } from 'base/unreachable_error';
import { comparer } from 'mobx';
import { observer } from 'mobx-react';
import {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  StackModel,
  StackPresenter,
} from './internal/presenter';
import { Stack as InternalStack } from './internal/stack';
import {
  type Layer,
  StackState,
} from './types';

export type StackProps = {
  readonly layers: readonly Layer[],
  readonly requestBack: (layer: Layer) => void,
  readonly animationDurationMillis: number,
};

const presenter = new StackPresenter();

function _Stack({
  layers,
  requestBack,
  animationDurationMillis,
}: StackProps) {
  const model = useMemo(function () {
    return new StackModel(layers);
    // only want to create the model once as we keep it up to date manually after this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(function () {
    const previousLayers = model.layers;
    // determine if a push or a pop operation has occurred
    if (!comparer.shallow(previousLayers, layers)) {
      if (
        previousLayers.length === layers.length - 1
        && comparer.shallow(previousLayers, layers.slice(0, -1))
      ) {
        // push
        presenter.pushLayer(model, layers[layers.length - 1], animationDurationMillis);
      } else if (
        previousLayers.length === layers.length + 1
        && comparer.shallow(previousLayers.slice(0, -1), layers)
      ) {
        // pop
        presenter.animatePopLayer(model, previousLayers[previousLayers.length - 1], animationDurationMillis);
      } else {
        presenter.resetLayers(model, layers);
      }
    }
  }, [
    model,
    layers,
    animationDurationMillis,
  ]);
  const animationComplete = useCallback(function (layer: Layer) {
    switch (model.stackState) {
      case StackState.AnimatingIn:
        presenter.stabilizeStack(model, layer);
        break;
      case StackState.AnimatingOut:
        presenter.popLayer(model, layer);
        break;
      case StackState.Stable:
        // should never happen
        break;
      default:
        throw new UnreachableError(model.stackState);
    }
  }, [model]);
  return (
    <InternalStack
      layers={model.layers}
      stackState={model.stackState}
      animationDurationMillis={animationDurationMillis}
      animationComplete={animationComplete}
      requestBack={requestBack}
    />
  );
}

export const Stack = observer(_Stack);
