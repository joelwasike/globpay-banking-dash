import { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Stack,
  InputAdornment
} from '@mui/material';
// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import CalculatorOutlined from '@ant-design/icons/CalculatorOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';

export default function ForexPage() {
  const { api } = useAuth();
  const [forexRates, setForexRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    currencyCode: '',
    currencyName: '',
    conversionRate: '',
    supported: 1
  });

  // Calculator state
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');

  useEffect(() => {
    loadForexRates();
  }, []);

  const loadForexRates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/forex/list');
      if (response.data && response.data.forexRates) {
        setForexRates(response.data.forexRates);
      } else {
        setForexRates([]);
      }
    } catch (error) {
      console.error('Error loading forex rates:', error);
      setForexRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (forexRates.length > 0 && !fromCurrency) {
      setFromCurrency(forexRates[0].currencyCode);
      setToCurrency(forexRates[1]?.currencyCode || forexRates[0].currencyCode);
    }
  }, [forexRates]);

  const handleCreateRate = async () => {
    try {
      const response = await api.post('/api/forex/create', { Forex: formData });
      if (response.data) {
        setShowCreateDialog(false);
        resetForm();
        loadForexRates();
      }
    } catch (error) {
      console.error('Error creating forex rate:', error);
    }
  };

  const handleUpdateRate = async () => {
    try {
      const response = await api.put(`/api/forex/update/${editingRate.id}`, formData);
      if (response.data) {
        setEditingRate(null);
        resetForm();
        loadForexRates();
      }
    } catch (error) {
      console.error('Error updating forex rate:', error);
    }
  };

  const handleDeleteRate = async (id) => {
    if (window.confirm('Are you sure you want to delete this forex rate?')) {
      try {
        await api.delete(`/api/forex/delete/${id}`);
        loadForexRates();
      } catch (error) {
        console.error('Error deleting forex rate:', error);
      }
    }
  };

  const openEditDialog = (rate) => {
    setEditingRate(rate);
    setFormData({
      currencyCode: rate.currencyCode,
      currencyName: rate.currencyName,
      conversionRate: rate.conversionRate,
      supported: rate.supported
    });
  };

  const resetForm = () => {
    setFormData({
      currencyCode: '',
      currencyName: '',
      conversionRate: '',
      supported: 1
    });
  };

  const handleCalculate = () => {
    if (!amount || !fromCurrency || !toCurrency) return;

    const fromRate = forexRates.find((r) => r.currencyCode === fromCurrency)?.conversionRate || 1;
    const toRate = forexRates.find((r) => r.currencyCode === toCurrency)?.conversionRate || 1;

    const result = (parseFloat(amount) / fromRate) * toRate;
    setConvertedAmount(result.toFixed(2));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Foreign Exchange Rates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage currency exchange rates and conversions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setShowCreateDialog(true)}>
          Add Currency
        </Button>
      </Stack>

      {/* Exchange Rate Calculator */}
      <MainCard title="Exchange Rate Calculator" sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>From Currency</InputLabel>
              <Select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} label="From Currency">
                {forexRates.map((rate) => (
                  <MenuItem key={rate.currencyCode} value={rate.currencyCode}>
                    {rate.currencyCode} - {rate.currencyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>To Currency</InputLabel>
              <Select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} label="To Currency">
                {forexRates.map((rate) => (
                  <MenuItem key={rate.currencyCode} value={rate.currencyCode}>
                    {rate.currencyCode} - {rate.currencyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="contained" startIcon={<CalculatorOutlined />} onClick={handleCalculate} size="large">
              Calculate
            </Button>
          </Grid>
          {convertedAmount && (
            <Grid item xs={12}>
              <MainCard sx={{ bgcolor: 'primary.lighter', textAlign: 'center' }}>
                <Typography variant="h5" color="primary">
                  {amount} {fromCurrency} = {convertedAmount} {toCurrency}
                </Typography>
              </MainCard>
            </Grid>
          )}
        </Grid>
      </MainCard>

      {/* Forex Rates Grid */}
      <Grid container spacing={3}>
        {forexRates.map((rate) => (
          <Grid item xs={12} sm={6} md={4} key={rate.id}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <DollarOutlined color="primary" sx={{ fontSize: 40 }} />
                  <Box flex={1}>
                    <Typography variant="h5">{rate.currencyCode}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rate.currencyName}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Rate:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {rate.conversionRate.toFixed(4)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      size="small"
                      icon={rate.supported === 1 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      label={rate.supported === 1 ? 'Supported' : 'Not Supported'}
                      color={rate.supported === 1 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Updated:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rate.lastUpdated?.toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
              <CardActions>
                <IconButton size="small" color="primary" onClick={() => openEditDialog(rate)}>
                  <EditOutlined style={{ fontSize: '16px' }} />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteRate(rate.id)}>
                  <DeleteOutlined style={{ fontSize: '16px' }} />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingRate} onClose={() => { setShowCreateDialog(false); setEditingRate(null); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRate ? `Edit ${editingRate.currencyCode}` : 'Add New Currency'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Currency Code"
              value={formData.currencyCode}
              onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
              placeholder="USD"
            />
            <TextField
              fullWidth
              label="Currency Name"
              value={formData.currencyName}
              onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
              placeholder="United States Dollar"
            />
            <TextField
              fullWidth
              type="number"
              label="Conversion Rate"
              value={formData.conversionRate}
              onChange={(e) => setFormData({ ...formData, conversionRate: parseFloat(e.target.value) })}
              inputProps={{ step: '0.0001' }}
              placeholder="1.0000"
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.supported}
                onChange={(e) => setFormData({ ...formData, supported: parseInt(e.target.value) })}
                label="Status"
              >
                <MenuItem value={1}>Supported</MenuItem>
                <MenuItem value={0}>Not Supported</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowCreateDialog(false); setEditingRate(null); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={editingRate ? handleUpdateRate : handleCreateRate}>
            {editingRate ? 'Update' : 'Add'} Currency
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
