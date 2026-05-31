import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

// project imports
import MainRoutes from './MainRoutes';
import Loadable from 'components/Loadable';

// render - login
const Login = Loadable(lazy(() => import('pages/authentication/Login')));

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  MainRoutes
], { basename: import.meta.env.VITE_APP_BASE_NAME === './' ? undefined : import.meta.env.VITE_APP_BASE_NAME });

export default router;
