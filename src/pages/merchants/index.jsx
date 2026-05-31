import React, { useState, useEffect } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

// project import
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

const statusColorMap = {
  Live: 'success',
  Pilot: 'warning',
  Sandbox: 'info',
  Discovery: 'default'
};

export default function MerchantsPage() {
  const { api } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    industry: '',
    regions: '',
    status: 'Live',
    accountManager: ''
  });

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/merchants/list');
      if (response.data && response.data.merchants) {
        setMerchants(response.data.merchants);
      } else if (response.data && Array.isArray(response.data)) {
        setMerchants(response.data);
      } else {
        setMerchants([]);
      }
    } catch (error) {
      console.error('Error loading merchants:', error);
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    setFormValues({ ...merchants[index] });
  };

  const handleClose = () => {
    setEditingIndex(null);
  };

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    if (editingIndex === null) return;
    try {
      const merchantId = merchants[editingIndex].id || merchants[editingIndex].merchantId;
      await api.put(`/api/merchants/update/${merchantId}`, formValues);
      loadMerchants();
      handleClose();
    } catch (error) {
      console.error('Error updating merchant:', error);
      alert('Error updating merchant. Please try again.');
    }
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Merchants</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Merchant partners currently connected to the Globpay platform.
        </Typography>
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Active Merchant Accounts</Typography>
              <Typography variant="body2" color="text.secondary">
                Track integration status and account ownership for each merchant relationship.
              </Typography>
            </Box>

            {loading ? (
              <PageLoader message="Loading merchants..." minHeight={220} />
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Merchant</TableCell>
                      <TableCell>Industry</TableCell>
                      <TableCell>Regions</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Account Manager</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {merchants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography variant="h6" color="text.secondary">
                            No merchants found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No merchant accounts are currently registered.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      merchants.map((merchant, index) => (
                        <TableRow key={merchant.id || merchant.name || index} hover>
                      <TableCell>
                        <Typography variant="subtitle1">{merchant.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{merchant.industry}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {merchant.regions}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={merchant.status}
                          color={statusColorMap[merchant.status] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{merchant.accountManager}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button variant="outlined" size="small" onClick={() => handleOpenEdit(index)}>
                          Edit Details
                        </Button>
                      </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </MainCard>
      </Grid>

      <Dialog open={editingIndex !== null} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Merchant Details</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Merchant Name" value={formValues.name} onChange={handleChange('name')} fullWidth />
            <TextField label="Industry" value={formValues.industry} onChange={handleChange('industry')} fullWidth />
            <TextField label="Regions" value={formValues.regions} onChange={handleChange('regions')} fullWidth />
            <TextField
              select
              label="Status"
              value={formValues.status}
              onChange={handleChange('status')}
              fullWidth
            >
              {Object.keys(statusColorMap).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Account Manager"
              value={formValues.accountManager}
              onChange={handleChange('accountManager')}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}


