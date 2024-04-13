import { checkExists } from 'base/preconditions';
import { createRoot } from 'react-dom/client';
import { install as installApp } from './app/install';

window.addEventListener('load', function () {
  const elementId = 'app';
  const appNode = document.getElementById(elementId);
  const app = createRoot(
    checkExists(appNode, 'element with id "{0}" not found', elementId),
  );
  const App = installApp(document.location.href);

  app.render(
    <App />,
  );
});
