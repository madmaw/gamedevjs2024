import { install as installLingUI } from './lingui/install';
import { install as installMetrics } from './metrics/install';
import { install as installTheme } from './theme/install';

export function install() {
  const ThemeContextProvider = installTheme();
  const MetricsContextProvider = installMetrics();
  const {
    LinguiProvider,
    LinguiLoader,
  } = installLingUI();
  return {
    ThemeContextProvider,
    MetricsContextProvider,
    LinguiProvider,
    LinguiLoader,
  };
}
