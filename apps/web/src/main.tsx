import '@skinkey/design/tokens.css';
import './app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Audit } from './routes/Audit';
import { Check } from './routes/Check';
import { How } from './routes/How';
import { Landing } from './routes/Landing';
import { Layout } from './routes/Layout';
import { NotFound } from './routes/NotFound';
import { Rules } from './routes/Rules';
import { SharedResult } from './routes/SharedResult';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/check', element: <Check /> },
      { path: '/audit', element: <Audit /> },
      { path: '/rules', element: <Rules /> },
      { path: '/how', element: <How /> },
      { path: '/r/:token', element: <SharedResult /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
