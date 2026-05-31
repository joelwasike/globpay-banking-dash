import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Grid,
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Stack,
  Alert,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import PageLoader from 'components/PageLoader';
import {
  DollarOutlined,
  SwapOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  SendOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  WalletOutlined,
  FileTextOutlined,
  SettingOutlined,
  CopyOutlined
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import { useAuth } from 'contexts/AuthContext';

// Gateway base URL
const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_BASE_URL || 'https://crypto-merchant-api.globpay.ai';

// Create axios instance for crypto gateway
const createGatewayApi = (apiKey) => {
  return axios.create({
    baseURL: GATEWAY_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
      ...(apiKey && { Authorization: `Bearer ${apiKey}` })
    }
  });
};

export default function CryptoMerchantAcquiryPage() {
  const { user: mainUser } = useAuth();
  const [gatewayUser, setGatewayUser] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('crypto_gateway_api_key') || '');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  // Dashboard data
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // Payment initiation
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    expected_amount: '',
    webhook_url: '',
    notes: '',
    deposit_id: ''
  });

  // Merchant Management (Admin only)
  const [merchants, setMerchants] = useState([]);
  const [merchantsPage, setMerchantsPage] = useState(1);
  const [merchantsLimit, setMerchantsLimit] = useState(20);
  const [merchantsPagination, setMerchantsPagination] = useState(null);
  const [merchantDialog, setMerchantDialog] = useState(false);
  const [merchantForm, setMerchantForm] = useState({
    email: '',
    password: '',
    business_name: ''
  });
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [merchantDetailsDialog, setMerchantDetailsDialog] = useState(false);

  // Admin transactions
  const [adminTransactions, setAdminTransactions] = useState([]);
  const [adminTxPage, setAdminTxPage] = useState(1);
  const [adminTxLimit, setAdminTxLimit] = useState(20);
  const [adminTxPagination, setAdminTxPagination] = useState(null);
  const [adminTxFilters, setAdminTxFilters] = useState({ merchant_id: '', status: '' });

  // System stats
  const [systemStats, setSystemStats] = useState(null);


  useEffect(() => {
    const storedApiKey = localStorage.getItem('crypto_gateway_api_key');
    const storedUser = localStorage.getItem('crypto_gateway_user');
    
    if (storedApiKey && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setGatewayUser(userData);
        setApiKey(storedApiKey);
        loadUserData(storedApiKey);
      } catch (e) {
        console.error('Error parsing stored user data', e);
        localStorage.removeItem('crypto_gateway_api_key');
        localStorage.removeItem('crypto_gateway_user');
      }
    }
  }, []);

  const loadUserData = async (key) => {
    if (!key) return;
    
    setLoading(true);
        setError('');
    
    try {
      const gatewayApi = createGatewayApi(key);
      const [balanceRes, txRes] = await Promise.all([
        gatewayApi.get('/api/merchants/balance'),
        gatewayApi.get('/api/merchants/transactions')
        ]);

        setBalance(balanceRes.data);
        setTransactions(txRes.data?.transactions || []);
    } catch (e) {
      console.error('Error loading user data', e);
      if (e.response?.status === 401) {
        handleLogout();
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMerchants = async () => {
    if (!apiKey || !gatewayUser?.is_admin) return;
    
    setLoading(true);
    try {
      const gatewayApi = createGatewayApi(apiKey);
      const response = await gatewayApi.get('/api/admin/merchants', {
        params: { page: merchantsPage, limit: merchantsLimit }
      });
      
      setMerchants(response.data.merchants || []);
      setMerchantsPagination(response.data.pagination || null);
      } catch (e) {
      console.error('Error loading merchants', e);
      setError('Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminTransactions = async () => {
    if (!apiKey || !gatewayUser?.is_admin) return;
    
    setLoading(true);
    try {
      const gatewayApi = createGatewayApi(apiKey);
      const params = { page: adminTxPage, limit: adminTxLimit };
      if (adminTxFilters.merchant_id) params.merchant_id = adminTxFilters.merchant_id;
      if (adminTxFilters.status) params.status = adminTxFilters.status;
      
      const response = await gatewayApi.get('/api/admin/transactions', { params });
      setAdminTransactions(response.data.transactions || []);
      setAdminTxPagination(response.data.pagination || null);
    } catch (e) {
      console.error('Error loading admin transactions', e);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    if (!apiKey || !gatewayUser?.is_admin) return;
    
    try {
      const gatewayApi = createGatewayApi(apiKey);
      const response = await gatewayApi.get('/api/admin/stats');
      setSystemStats(response.data.stats);
    } catch (e) {
      console.error('Error loading system stats', e);
    }
  };


  useEffect(() => {
    if (gatewayUser && activeTab === 1 && gatewayUser.is_admin) {
      loadMerchants();
      loadSystemStats();
    }
  }, [gatewayUser, activeTab, merchantsPage, merchantsLimit]);

  useEffect(() => {
    if (gatewayUser && activeTab === 2 && gatewayUser.is_admin) {
      loadAdminTransactions();
    }
  }, [gatewayUser, activeTab, adminTxPage, adminTxLimit, adminTxFilters]);


  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
      setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${GATEWAY_BASE_URL}/api/merchants/login`, {
        email: loginForm.email,
        password: loginForm.password
      });

      if (response.data && response.data.api_key) {
        const userData = {
          merchant_id: response.data.merchant_id,
          email: response.data.email,
          business_name: response.data.business_name,
          is_admin: response.data.is_admin || false,
          api_key: response.data.api_key
        };

        setGatewayUser(userData);
        setApiKey(userData.api_key);
        localStorage.setItem('crypto_gateway_api_key', userData.api_key);
        localStorage.setItem('crypto_gateway_user', JSON.stringify(userData));
        
        setSuccess('Login successful!');
        await loadUserData(userData.api_key);
      } else {
        setError('Invalid response from server');
      }
    } catch (e) {
      console.error('Login error', e);
      setError(e.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setSuccess('Payment URL copied to clipboard!');
      setTimeout(() => {
        setSuccess('');
        setPaymentUrl('');
      }, 2000);
    } catch (e) {
      console.error('Failed to copy URL', e);
      setError('Failed to copy URL to clipboard');
    }
  };

  const handleLogout = () => {
    setGatewayUser(null);
    setApiKey('');
    setBalance(null);
    setTransactions([]);
    setMerchants([]);
    setAdminTransactions([]);
    setPaymentUrl('');
    localStorage.removeItem('crypto_gateway_api_key');
    localStorage.removeItem('crypto_gateway_user');
    setLoginForm({ email: '', password: '' });
  };

  const handleInitiatePayment = async () => {
    if (!paymentForm.expected_amount) {
      setError('Please enter expected amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const gatewayApi = createGatewayApi(apiKey);
      const response = await gatewayApi.post('/api/merchants/solana/deposit/initiate', {
        expected_amount: parseFloat(paymentForm.expected_amount),
        webhook_url: paymentForm.webhook_url || undefined,
        notes: paymentForm.notes || undefined,
        deposit_id: paymentForm.deposit_id || undefined
      });

      setPaymentUrl(response.data.page_url);
      setSuccess('Payment initiated successfully!');
      setPaymentDialog(false);
      setPaymentForm({ expected_amount: '', webhook_url: '', notes: '', deposit_id: '' });
      await loadUserData(apiKey);
    } catch (e) {
      console.error('Payment initiation error', e);
      setError(e.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMerchant = async () => {
    if (!merchantForm.email || !merchantForm.password || !merchantForm.business_name) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const gatewayApi = createGatewayApi(apiKey);
      const response = await gatewayApi.post('/api/admin/merchants', {
        email: merchantForm.email,
        password: merchantForm.password,
        business_name: merchantForm.business_name
      });

      setSuccess('Merchant created successfully!');
      setMerchantDialog(false);
      setMerchantForm({ email: '', password: '', business_name: '' });
      await loadMerchants();
    } catch (e) {
      console.error('Create merchant error', e);
      setError(e.response?.data?.error || 'Failed to create merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMerchant = async (merchantId) => {
    setLoading(true);
    try {
      const gatewayApi = createGatewayApi(apiKey);
      const response = await gatewayApi.get(`/api/admin/merchants/${merchantId}`);
      setSelectedMerchant(response.data);
      setMerchantDetailsDialog(true);
    } catch (e) {
      console.error('Error loading merchant details', e);
      setError('Failed to load merchant details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateApiKey = async (merchantId) => {
    if (!confirm('Are you sure you want to regenerate the API key? The old key will be invalidated.')) {
      return;
    }

    setLoading(true);
    try {
      const gatewayApi = createGatewayApi(apiKey);
      const response = await gatewayApi.post(`/api/admin/merchants/${merchantId}/regenerate-api-key`);
      setSuccess(`New API Key: ${response.data.api_key}`);
      await loadMerchants();
    } catch (e) {
      console.error('Error regenerating API key', e);
      setError('Failed to regenerate API key');
    } finally {
      setLoading(false);
    }
  };


  // Login Form
  if (!gatewayUser) {
    return (
      <Box>
      <MainCard>
          <Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
              Crypto Gateway Login
          </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Login to access your crypto merchant account
          </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  disabled={loading}
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SwapOutlined />}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Stack>
            </form>
        </Box>
      </MainCard>
      </Box>
    );
  }

  // Main Dashboard
  const tabs = gatewayUser.is_admin 
    ? ['Dashboard', 'Merchant Management', 'All Transactions']
    : ['Dashboard'];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Crypto Merchant Acquiry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome, {gatewayUser.business_name || gatewayUser.email}
            {gatewayUser.is_admin && (
              <Chip label="Admin" size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }} 
          onClose={() => {
            setSuccess('');
            setPaymentUrl('');
          }}
          action={
            paymentUrl && (
              <Button
                color="inherit"
                size="small"
                startIcon={<CopyOutlined />}
                onClick={handleCopyUrl}
              >
                Copy URL
              </Button>
            )
          }
        >
          <Box>
            <Typography>{success}</Typography>
            {paymentUrl && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {paymentUrl}
                </Typography>
              </Box>
            )}
          </Box>
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab} />
        ))}
      </Tabs>

      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ReloadOutlined />}
              onClick={() => loadUserData(apiKey)}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <AnalyticEcommerce
            title="USDT Balance"
            count={balance ? balance.usdt_balance?.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'}
            extra="USDT"
            isLoss={false}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MainCard>
            <Stack direction="row" spacing={2} alignItems="center">
              <DollarOutlined style={{ fontSize: 32, color: '#16a34a' }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                      Solana Address
                </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {balance?.solana_address || 'Not set'}
                </Typography>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MainCard>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlusOutlined />}
                  onClick={() => setPaymentDialog(true)}
                  size="large"
                >
                  Initiate Payment
              </Button>
          </MainCard>
        </Grid>
        </Grid>

          <MainCard title="My Transactions">
            {loading ? (
              <PageLoader message="Loading transactions..." minHeight={160} />
            ) : transactions.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No transactions found.
                        </Typography>
              </Box>
            ) : (
              <>
              <Paper variant="outlined">
                  <Table>
                  <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Deposit ID</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.id}</TableCell>
                          <TableCell>{tx.merchant_deposit_id || tx.deposit_id || '--'}</TableCell>
                          <TableCell>{tx.amount} {tx.asset || 'USDT'}</TableCell>
                        <TableCell>
                            <Chip
                              label={tx.status}
                              size="small"
                              color={
                                tx.status === 'completed' ? 'success' :
                                tx.status === 'pending' ? 'warning' : 'error'
                              }
                            />
                        </TableCell>
                          <TableCell>
                            {tx.created_at ? format(new Date(tx.created_at), 'MMM d, yyyy HH:mm') : '--'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </>
            )}
          </MainCard>
        </>
      )}

      {/* Merchant Management Tab (Admin only) */}
      {activeTab === 1 && gatewayUser.is_admin && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6">Merchant Management</Typography>
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => setMerchantDialog(true)}
            >
              Create Merchant
            </Button>
          </Stack>

          {systemStats && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Total Merchants</Typography>
                    <Typography variant="h4">{systemStats.total_merchants || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Active Merchants</Typography>
                    <Typography variant="h4">{systemStats.active_merchants || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Total Transactions</Typography>
                    <Typography variant="h4">{systemStats.total_transactions || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Total USDT Balance</Typography>
                    <Typography variant="h4">{systemStats.total_usdt_balance || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <MainCard title="All Merchants">
            {loading ? (
              <PageLoader message="Loading merchants..." minHeight={160} />
            ) : (
              <>
                <Paper variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Business Name</TableCell>
                        <TableCell>USDT Balance</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Admin</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {merchants.map((merchant) => (
                        <TableRow key={merchant.id}>
                          <TableCell>{merchant.id}</TableCell>
                          <TableCell>{merchant.email}</TableCell>
                          <TableCell>{merchant.business_name}</TableCell>
                          <TableCell>{merchant.usdt_balance || 0}</TableCell>
                        <TableCell>
                          <Chip
                              label={merchant.is_active ? 'Active' : 'Inactive'}
                            size="small"
                              color={merchant.is_active ? 'success' : 'default'}
                          />
                        </TableCell>
                          <TableCell>
                            {merchant.is_admin && (
                              <Chip label="Admin" size="small" color="primary" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                startIcon={<EyeOutlined />}
                                onClick={() => handleViewMerchant(merchant.id)}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<ReloadOutlined />}
                                onClick={() => handleRegenerateApiKey(merchant.id)}
                              >
                                Regenerate Key
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
                {merchantsPagination && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      Page {merchantsPagination.page} of {merchantsPagination.total_pages} ({merchantsPagination.total} total)
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        select
                        size="small"
                        value={merchantsLimit}
                        onChange={(e) => {
                          setMerchantsLimit(parseInt(e.target.value));
                          setMerchantsPage(1);
                        }}
                        sx={{ minWidth: 80 }}
                      >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </TextField>
                      <Pagination
                        count={merchantsPagination.total_pages}
                        page={merchantsPagination.page}
                        onChange={(e, page) => setMerchantsPage(page)}
                        color="primary"
                      />
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </MainCard>
        </Box>
      )}

      {/* Admin Transactions Tab */}
      {activeTab === 2 && gatewayUser.is_admin && (
        <Box>
          <MainCard title="All Transactions">
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Merchant ID"
                size="small"
                value={adminTxFilters.merchant_id}
                onChange={(e) => setAdminTxFilters({ ...adminTxFilters, merchant_id: e.target.value })}
                sx={{ minWidth: 150 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={adminTxFilters.status}
                  label="Status"
                  onChange={(e) => setAdminTxFilters({ ...adminTxFilters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<ReloadOutlined />}
                onClick={loadAdminTransactions}
              >
                Refresh
              </Button>
            </Stack>

            {loading ? (
              <PageLoader message="Loading admin transactions..." minHeight={160} />
            ) : (
              <>
                <Paper variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Merchant</TableCell>
                        <TableCell>Deposit ID</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {adminTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.id}</TableCell>
                          <TableCell>{tx.merchant_email || tx.merchant_id}</TableCell>
                          <TableCell>{tx.merchant_deposit_id || tx.deposit_id}</TableCell>
                          <TableCell>{tx.amount} {tx.asset}</TableCell>
                        <TableCell>
                          <Chip
                            label={tx.status}
                            size="small"
                              color={
                                tx.status === 'completed' ? 'success' :
                                tx.status === 'pending' ? 'warning' : 'error'
                              }
                          />
                        </TableCell>
                        <TableCell>
                            {tx.created_at ? format(new Date(tx.created_at), 'MMM d, yyyy HH:mm') : '--'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
                {adminTxPagination && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      Page {adminTxPagination.page} of {adminTxPagination.total_pages} ({adminTxPagination.total} total)
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        select
                        size="small"
                        value={adminTxLimit}
                        onChange={(e) => {
                          setAdminTxLimit(parseInt(e.target.value));
                          setAdminTxPage(1);
                        }}
                        sx={{ minWidth: 80 }}
                      >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </TextField>
                      <Pagination
                        count={adminTxPagination.total_pages}
                        page={adminTxPagination.page}
                        onChange={(e, page) => setAdminTxPage(page)}
                        color="primary"
                      />
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </MainCard>
        </Box>
      )}


      {/* Payment Initiation Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Initiate Solana Deposit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Expected Amount (USDT)"
              type="number"
              fullWidth
              required
              value={paymentForm.expected_amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, expected_amount: e.target.value })}
            />
            <TextField
              label="Webhook URL (Optional)"
              type="url"
              fullWidth
              value={paymentForm.webhook_url}
              onChange={(e) => setPaymentForm({ ...paymentForm, webhook_url: e.target.value })}
            />
            <TextField
              label="Deposit ID (Optional)"
              fullWidth
              value={paymentForm.deposit_id}
              onChange={(e) => setPaymentForm({ ...paymentForm, deposit_id: e.target.value })}
            />
            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              fullWidth
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInitiatePayment}
            disabled={loading || !paymentForm.expected_amount}
            startIcon={loading ? <CircularProgress size={20} /> : <SendOutlined />}
          >
            {loading ? 'Initiating...' : 'Initiate Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Merchant Dialog */}
      <Dialog open={merchantDialog} onClose={() => setMerchantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Merchant</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={merchantForm.email}
              onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={merchantForm.password}
              onChange={(e) => setMerchantForm({ ...merchantForm, password: e.target.value })}
            />
            <TextField
              label="Business Name"
              fullWidth
              required
              value={merchantForm.business_name}
              onChange={(e) => setMerchantForm({ ...merchantForm, business_name: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMerchantDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateMerchant}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PlusOutlined />}
          >
            {loading ? 'Creating...' : 'Create Merchant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Merchant Details Dialog */}
      <Dialog open={merchantDetailsDialog} onClose={() => setMerchantDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Merchant Details</DialogTitle>
        <DialogContent>
          {selectedMerchant && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography><strong>ID:</strong> {selectedMerchant.id}</Typography>
              <Typography><strong>Email:</strong> {selectedMerchant.email}</Typography>
              <Typography><strong>Business Name:</strong> {selectedMerchant.business_name}</Typography>
              <Typography><strong>USDT Balance:</strong> {selectedMerchant.usdt_balance || 0}</Typography>
              <Typography><strong>Solana Address:</strong> {selectedMerchant.solana_address || 'Not set'}</Typography>
              <Typography><strong>Status:</strong> {selectedMerchant.is_active ? 'Active' : 'Inactive'}</Typography>
              <Typography><strong>Admin:</strong> {selectedMerchant.is_admin ? 'Yes' : 'No'}</Typography>
              <Typography><strong>Created:</strong> {selectedMerchant.created_at ? format(new Date(selectedMerchant.created_at), 'PPpp') : '--'}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMerchantDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
