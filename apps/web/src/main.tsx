import '@skinkey/design/tokens.css';
import './app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Landing } from './routes/Landing';
import { Layout } from './routes/Layout';
import { NotFound } from './routes/NotFound';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/check', lazy: async () => ({ Component: (await import('./routes/Check')).Check }) },
      { path: '/audit', lazy: async () => ({ Component: (await import('./routes/Audit')).Audit }) },
      { path: '/rules', lazy: async () => ({ Component: (await import('./routes/Rules')).Rules }) },
      { path: '/how', lazy: async () => ({ Component: (await import('./routes/How')).How }) },
      { path: '/r/:token', lazy: async () => ({ Component: (await import('./routes/SharedResult')).SharedResult }) },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
