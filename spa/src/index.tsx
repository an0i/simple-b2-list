/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';

import { PathProvider } from './contexts/Path';
import App from './App';

render(
  () => (
    <PathProvider>
      <App />
    </PathProvider>
  ),
  document.getElementById('app')!,
);
