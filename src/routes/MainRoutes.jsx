import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Box from '@mui/material/Box';
import Loadable from 'components/Loadable';
import PageLoader from 'components/PageLoader';
import DashboardLayout from 'layout/Dashboard';
import { useAuth } from 'contexts/AuthContext';

// render - Dashboard
const OverviewPage = Loadable(lazy(() => import('pages/portal/Overview')));
const PortalTransactionsPage = Loadable(lazy(() => import('pages/portal/Transactions')));
const RatesPage = Loadable(lazy(() => import('pages/portal/Rates')));
const ProfilePage = Loadable(lazy(() => import('pages/portal/Profile')));
const ApiKeysPage = Loadable(lazy(() => import('pages/portal/ApiKeys')));
const SecurityPage = Loadable(lazy(() => import('pages/portal/Security')));
const AdminMerchantsPage = Loadable(lazy(() => import('pages/portal/Merchants')));

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <PageLoader message="Loading..." minHeight={200} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
  children: [
    {
      path: '/',
      element: <Navigate to="/overview" replace />
    },
    {
      path: 'overview',
      element: <OverviewPage />
    },
    {
      path: 'transactions',
      element: <PortalTransactionsPage />
    },
    {
      path: 'rates',
      element: <RatesPage />
    },
    {
      path: 'merchants',
      element: <AdminMerchantsPage />
    },
    {
      path: 'profile',
      element: <ProfilePage />
    },
    {
      path: 'api-keys',
      element: <ApiKeysPage />
    },
    {
      path: 'security',
      element: <SecurityPage />
    },
    // Fallback for any unknown route under "/"
    {
      path: '*',
      element: <Navigate to="/overview" replace />
    }
  ]
};

export default MainRoutes;
