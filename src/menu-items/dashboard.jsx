// assets
import { DashboardOutlined, AppstoreOutlined, SettingOutlined, KeyOutlined, LockOutlined, DollarCircleOutlined, UserOutlined } from '@ant-design/icons';

const icons = {
  DashboardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  KeyOutlined,
  LockOutlined,
  DollarCircleOutlined,
  UserOutlined
};

export const getMenuGroups = (role) => {
  const base = [
    {
      id: 'group-main',
      title: 'Main',
      type: 'group',
      children: [
        { id: 'overview', title: 'Overview', type: 'item', url: '/overview', icon: icons.DashboardOutlined, breadcrumbs: false },
        { id: 'transactions', title: 'Transactions', type: 'item', url: '/transactions', icon: icons.AppstoreOutlined, breadcrumbs: false },
        { id: 'rates', title: 'Rates', type: 'item', url: '/rates', icon: icons.DollarCircleOutlined, breadcrumbs: false }
      ]
    }
  ];

  if (role === 'admin') {
    base.push({
      id: 'group-admin',
      title: 'Admin',
      type: 'group',
      children: [{ id: 'merchants', title: 'Merchants', type: 'item', url: '/merchants', icon: icons.UserOutlined, breadcrumbs: false }]
    });
  } else {
    base.push({
      id: 'group-account',
      title: 'Account',
      type: 'group',
      children: [
        { id: 'profile', title: 'Profile', type: 'item', url: '/profile', icon: icons.SettingOutlined, breadcrumbs: false },
        { id: 'api-keys', title: 'API Keys', type: 'item', url: '/api-keys', icon: icons.KeyOutlined, breadcrumbs: false },
        { id: 'security', title: 'Security', type: 'item', url: '/security', icon: icons.LockOutlined, breadcrumbs: false }
      ]
    });
  }

  return base;
};

