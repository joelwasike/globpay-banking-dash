import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Tab,
  Tabs,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import SyncOutlined from '@ant-design/icons/SyncOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';
import { format } from 'date-fns';

export default function WalletTransfersPage() {
  const { api, user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    merchantId: user?.merchantID || 'app'
  });

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/drawings/view');

      if (response.data && response.data.platformEarnings) {
        setTransfers(response.data.platformEarnings);
      } else {
        setTransfers([]);
      }
    } catch (error) {
      console.error('Error loading transfers:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    try {
      const response = await api.post('/api/v1/drawings/transfer/toPayout', {
        name: formData.name,
        description: formData.description,
        merchantId: formData.merchantId
      });

      if (response.data) {
        setFormData({
          name: '',
          description: '',
          merchantId: user?.merchantID || 'app'
        });
        loadTransfers();
        alert('Transfer initiated successfully!');
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Error creating transfer. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const totalAmount = transfers.reduce((sum, t) => sum + (t.amountTransferred || 0), 0);
  const totalCharges = transfers.reduce((sum, t) => sum + (t.transactionCharges || 0), 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Wallet Transfers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage platform earnings and transfer requests
          </Typography>
        </Box>
      </Stack>

      {/* Statistics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <SyncOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Transfers
                  </Typography>
                  <Typography variant="h4">{transfers.length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <DollarOutlined sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h4">{totalAmount.toLocaleString()} KES</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <DollarOutlined sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Charges
                  </Typography>
                  <Typography variant="h4">{totalCharges.toLocaleString()} KES</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <MainCard>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="All Requests" />
          <Tab label="Initiate Transfer" />
        </Tabs>

        {/* All Requests Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Platform Earnings ({transfers.length})
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transfer Details</TableCell>
                    <TableCell>Amount Transferred</TableCell>
                    <TableCell>Transaction Charges</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Transfer Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <SyncOutlined color="primary" />
                          <Box>
                            <Typography variant="subtitle2">Transfer #{transfer.id}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Merchant: {transfer.impalaMerchantId}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{transfer.amountTransferred?.toLocaleString()} KES</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{transfer.transactionCharges?.toLocaleString()} KES</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" icon={<CheckCircleOutlined />} label="COMPLETED" color="success" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(transfer.transferDate)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <EyeOutlined style={{ fontSize: '16px' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {transfers.length === 0 && (
              <Box textAlign="center" py={6}>
                <SyncOutlined sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No transfers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No platform earnings have been transferred yet.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Initiate Transfer Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Initiate Transfer to Payout
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Transfer your platform earnings to your payout account.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Company"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Technology solutions"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Merchant ID"
                  value={formData.merchantId}
                  onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                  placeholder="app"
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" fullWidth size="large" startIcon={<PlusOutlined />} onClick={handleCreateTransfer}>
                  Initiate Transfer
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </MainCard>
    </Box>
  );
}
