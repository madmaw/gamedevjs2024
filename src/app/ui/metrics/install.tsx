import { UnreachableError } from 'base/unreachable_error';
import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  TYPOGRAPHIES,
  type Typography,
} from 'ui/components/typography/types';
import {
  type Metrics,
  MetricsProvider,
  type Size,
  SIZES,
} from 'ui/metrics';
import { comfortable } from './base';
import { Display } from './types';

const BASE_SCALE_DIMENSION_COMFORTABLE = 640;
const BASE_SCALE_WIDTH_COMPACT = 800;
const MIN_SCALE = .5;

function scaleMetrics(metrics: Record<Size, Metrics>, scale: number): Record<Size, Metrics> {
  return SIZES.reduce(function (scaledMetrics, size) {
    const sizeMetrics = metrics[size];
    const scaledTypography = TYPOGRAPHIES.reduce(function (scaledTypography, typography) {
      const {
        fontSize,
        lineHeight,
      } = sizeMetrics.typography[typography];
      scaledTypography[typography] = {
        fontSize: fontSize * scale,
        lineHeight: lineHeight * scale,
      };
      return scaledTypography;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    }, {} as Record<Typography, { fontSize: number, lineHeight: number }>);
    const scaledSizeMetrics: Metrics = {
      ...sizeMetrics,
      borderRadius: sizeMetrics.borderRadius * scale,
      gridBaseline: sizeMetrics.gridBaseline * scale,
      typography: scaledTypography,
    };
    scaledMetrics[size] = scaledSizeMetrics;
    return scaledMetrics;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  }, {} as Record<Size, Metrics>);
}

function computeScale(display: Display): number {
  switch (display) {
    case Display.Compact:
      return Math.max(window.innerWidth / BASE_SCALE_WIDTH_COMPACT, MIN_SCALE);
    case Display.Comfortable:
      return Math.max(
        Math.min(window.innerWidth, window.innerHeight) / BASE_SCALE_DIMENSION_COMFORTABLE,
        MIN_SCALE,
      );
    default:
      throw new UnreachableError(display);
  }
}

export function install() {
  return function ({
    children,
    display,
  }: PropsWithChildren<{ display: Display }>) {
    const [
      scale,
      setScale,
    ] = useState(computeScale(display));
    useEffect(function () {
      // update scale when window size changes
      function listener() {
        const scale = computeScale(display);
        setScale(scale);
      }
      window.addEventListener('resize', listener);
      return function () {
        window.removeEventListener('resize', listener);
      };
    }, [display]);

    const metrics = useMemo(function () {
      // TODO select metrics based on display characteristics
      return scaleMetrics(comfortable, scale);
    }, [scale]);

    return (
      <MetricsProvider metrics={metrics}>
        {children}
      </MetricsProvider>
    );
  };
}
