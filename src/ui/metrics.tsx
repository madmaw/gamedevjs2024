import { checkExists } from 'base/preconditions';
import { createPartialComponent } from 'base/react/partial';
import {
  createContext,
  type PropsWithChildren,
  useContext,
} from 'react';
import { type Typography } from './components/typography/types';

export const enum Size {
  Small = 0,
  Medium,
  Large,
}

export const SIZES: Size[] = [
  Size.Small,
  Size.Medium,
  Size.Large,
];

export type Metrics = {
  gridBaseline: number,
  typography: Record<Typography, {
    fontSize: number,
    lineHeight: number,
  }>,
  borderWidth: number,
  borderRadius: number,
  strokeWidth: number,
};

const metricsContext = createContext<Record<Size, Metrics> | undefined>(undefined);
const sizeContext = createContext<Size | undefined>(undefined);

export function MetricsProvider({
  metrics,
  children,
}: PropsWithChildren<{ metrics: Record<Size, Metrics> }>) {
  const { Provider } = metricsContext;
  return (
    <Provider value={metrics}>
      {children}
    </Provider>
  );
}

export function SizeProvider({
  size,
  children,
}: PropsWithChildren<{ size: Size }>) {
  const { Provider } = sizeContext;
  return (
    <Provider value={size}>
      {children}
    </Provider>
  );
}

export function Resize({
  children,
  delta,
}: PropsWithChildren<{ delta: number }>) {
  const size = checkExists(useContext(sizeContext), 'no size context set');
  const newSize: Size = Math.max(0, Math.min(size + delta, SIZES.length - 1));

  return (
    <SizeProvider size={newSize}>
      {children}
    </SizeProvider>
  );
}

export const Bigger = createPartialComponent(Resize, { delta: 1 });
export const Smaller = createPartialComponent(Resize, { delta: -1 });

export function useMetrics(): Metrics {
  const metrics = checkExists(useContext(metricsContext), 'no metrics context set');
  const size = checkExists(useContext(sizeContext), 'no size context set');
  return metrics[size];
}
