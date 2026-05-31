import { useState, useEffect } from 'react';
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
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

export default function PaymentLinksPage() {
  const { api, user } = useAuth();
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'M-PESA',
    amount: '',
    merchant: user?.merchantID || '',
    token: ''
  });

  useEffect(() => {
    loadPaymentLinks();
  }, []);

  const loadPaymentLinks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/links/list');
      if (response.data && response.data.paymentLinks) {
        setPaymentLinks(response.data.paymentLinks);
      } else if (response.data && Array.isArray(response.data)) {
        setPaymentLinks(response.data);
      } else {
        setPaymentLinks([]);
      }
    } catch (error) {
      console.error('Error loading payment links:', error);
      setPaymentLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    try {
      const response = await api.post('/api/links/generate', formData);
      if (response.data) {
        setShowCreateDialog(false);
        resetForm();
        loadPaymentLinks();
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
    }
  };

  const handleProcessPayment = async (linkData) => {
    try {
      const processData = {
        token: linkData.token,
        impalaMerchantId: linkData.merchant,
        currency: 'KES',
        amount: linkData.amount,
        payerPhone: '254794940160',
        mobileMoneySP: linkData.type,
        externalId: `PaymentLink${linkData.id}`,
        callbackUrl: 'https://webhook.site/9878e703-812c-4b66-b9b2-68bc3e9d46bb'
      };

      const response = await api.post('/api/links/process', processData);
      if (response.data) {
        alert('Payment processed successfully!');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const resetForm = () => {
    setFormData({
      type: 'M-PESA',
      amount: '',
      merchant: user?.merchantID || '',
      token: ''
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleOutlined />;
      case 'expired':
        return <CloseCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <PageLoader message="Loading payment links..." minHeight={320} />
      </Box>
    );
  }

  const activeLinks = paymentLinks.filter((link) => link.status === 'active').length;
  const totalValue = paymentLinks.reduce((sum, link) => sum + (link.amount || 0), 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Payment Links
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage shareable payment links for your customers
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setShowCreateDialog(true)}>
          Generate Payment Link
        </Button>
      </Stack>

      {/* Statistics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <MainCard>
            <Stack direction="row" spacing={2} alignItems="center">
              <LinkOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Links
                </Typography>
                <Typography variant="h4">{paymentLinks.length}</Typography>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <MainCard>
            <Stack direction="row" spacing={2} alignItems="center">
              <CheckCircleOutlined sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Active Links
                </Typography>
                <Typography variant="h4">{activeLinks}</Typography>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <MainCard>
            <Stack direction="row" spacing={2} alignItems="center">
              <DollarOutlined sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
                <Typography variant="h4">{totalValue.toLocaleString()} KES</Typography>
              </Box>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* Payment Links Grid */}
      <Grid container spacing={3}>
        {paymentLinks.map((link) => (
          <Grid item xs={12} sm={6} md={4} key={link.id}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <LinkOutlined color="primary" sx={{ fontSize: 40 }} />
                  <Box flex={1}>
                    <Typography variant="h5">{link.type}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment Link
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Amount:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {link.amount?.toLocaleString()} KES
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      size="small"
                      icon={getStatusIcon(link.status)}
                      label={link.status}
                      color={getStatusColor(link.status)}
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Created:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {link.createdAt?.toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Stack>

                <Box mt={2}>
                  <TextField
                    fullWidth
                    size="small"
                    value={link.url}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => copyToClipboard(link.url)}>
                            <CopyOutlined style={{ fontSize: '16px' }} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  onClick={() => handleProcessPayment(link)}
                  sx={{ mr: 1 }}
                >
                  Process Payment
                </Button>
                <IconButton size="small" color="error">
                  <DeleteOutlined style={{ fontSize: '16px' }} />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Payment Link</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Payment Type"
              >
                <MenuItem value="M-PESA">M-PESA</MenuItem>
                <MenuItem value="CARD">Card Payment</MenuItem>
                <MenuItem value="BANK">Bank Transfer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="Amount (KES)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="1000"
            />

            <TextField
              fullWidth
              label="Merchant ID"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              placeholder="Merchant ID"
            />

            <TextField
              fullWidth
              label="Token (Optional)"
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              placeholder="Custom token"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowCreateDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreatePaymentLink}>
            Generate Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
