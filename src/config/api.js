import axios from 'axios';

const API_BASE_URL = 'https://vc.globpay.ai';

console.log('API Configuration:', { API_BASE_URL });

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 20000,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('merchant_token');
  
  // Don't add Authorization header for login endpoints
  const isLoginRequest =
    config.url?.includes('/api/v1/admin/login') ||
    config.url?.includes('/api/v1/portal/merchant/login') ||
    config.url?.includes('/api/v1/admin/register');

  if (token && !isLoginRequest) {
    config.headers.Authorization = `Bearer ${token}`;
    
    if (config.params && config.params.token) {
      delete config.params.token;
    }
  }
  
  console.log('API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    fullURL: config.baseURL + config.url,
    hasToken: !!token
  });
  
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
