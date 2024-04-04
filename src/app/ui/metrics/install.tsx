import { type PropsWithChildren } from 'react';
import { MetricsProvider } from 'ui/metrics';
import { metrics } from './metrics';
import { type Display } from './types';

export function install() {
  return function ({ children }: PropsWithChildren<{ display: Display }>) {
    // TODO select metrics based on display characteristics
    return (
      <MetricsProvider metrics={metrics}>
        {children}
      </MetricsProvider>
    );
  };
}
