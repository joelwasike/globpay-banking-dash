import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('merchant_token');
    const storedUser = localStorage.getItem('merchant_user');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          // Prefer stored user (from login) so roleID/admin and full profile persist across reloads.
          // JWT often doesn't include roleID, so decoding alone would drop admin rights.
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              setUser(parsed);
              setLoading(false);
              return;
            } catch (e) {
              // fall back to building from token
            }
          }
          const role = decoded.role || (decoded.admin_id ? 'admin' : 'merchant');
          setUser({
            role,
            adminId: decoded.admin_id,
            merchantId: decoded.merchant_id,
            merchantPortalUserId: decoded.merchant_portal_user_id,
            email: decoded.email,
            name: decoded.name
          });
        } else {
          localStorage.removeItem('merchant_token');
          localStorage.removeItem('merchant_user');
        }
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('merchant_token');
        localStorage.removeItem('merchant_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (mode, email, password) => {
    try {
      const isAdmin = mode === 'admin';

      const response = isAdmin
        ? await api.post('/api/v1/admin/login', { email, password })
        : await api.post('/api/v1/portal/merchant/login', { email, password });

      const token = response.data?.token;
      if (!token) return { success: false, error: 'Invalid response from server - no token received' };

      const decoded = jwtDecode(token);
      const userObject = isAdmin
        ? {
            role: 'admin',
            adminId: response.data?.data?.admin_id ?? decoded.admin_id,
            email: response.data?.data?.email,
            name: response.data?.data?.name
          }
        : {
            role: 'merchant',
            merchantId: response.data?.data?.merchant_id ?? decoded.merchant_id,
            merchantPortalUserId: decoded.merchant_portal_user_id,
            email: response.data?.data?.user?.email ?? response.data?.data?.email,
            name: response.data?.data?.merchant?.name
          };

      localStorage.setItem('merchant_token', token);
      localStorage.setItem('merchant_user', JSON.stringify(userObject));
      setUser(userObject);
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login error:', error);

      // Axios timeout
      if (error.code === 'ECONNABORTED') {
        return { success: false, error: 'Request timed out. Check network/CORS and try again.' };
      }
      
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.message || `Server error: ${error.response.status}` 
        };
      } else if (error.request) {
        return { 
          success: false, 
          error: `No response from server (possible CORS/network issue). API: ${API_BASE_URL}` 
        };
      } else {
        return { 
          success: false, 
          error: 'Login failed. Please check your credentials.' 
        };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
