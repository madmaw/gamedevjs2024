import { type LoggingService } from 'app/services/logging';
import { install as installLingUI } from './lingui/install';
import { install as installMetrics } from './metrics/install';
import { install as installTheme } from './theme/install';

export function install({ loggingService }: { loggingService: LoggingService }) {
  const ThemeContextProvider = installTheme();
  const MetricsContextProvider = installMetrics();
  const LingUIContextProvider = installLingUI({ loggingService });
  return {
    ThemeContextProvider,
    MetricsContextProvider,
    LingUIContextProvider,
  };
}
