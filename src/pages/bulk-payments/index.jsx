import { useState, useEffect } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
// project imports
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| BULK PAYMENTS PAGE ||============================== //

export default function BulkPaymentsPage() {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [bulkPayments, setBulkPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBulkPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadBulkPayments = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 0 
        ? '/api/bulk/mobile/list' 
        : '/api/bulk/bank/list';
      
      const response = await api.get(endpoint);
      if (response.data && response.data.bulkPayments) {
        setBulkPayments(response.data.bulkPayments);
      } else {
        setBulkPayments([]);
      }
    } catch (error) {
      console.error('Error loading bulk payments:', error);
      setBulkPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <PageLoader message="Loading bulk payments..." minHeight={320} />
      </Box>
    );
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Bulk Payments</Typography>
          <Button variant="contained" startIcon={<PlusOutlined />}>
            Create Bulk Payment
          </Button>
        </Box>
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Mobile Money" />
            <Tab label="Bank Transfer" />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {bulkPayments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  No bulk payments found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Create your first bulk payment to get started
                </Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Batch ID</TableCell>
                    <TableCell>Recipients</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bulkPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>#{payment.id}</TableCell>
                      <TableCell>{payment.recipients || 0}</TableCell>
                      <TableCell align="right">{payment.totalAmount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={payment.status} size="small" color={payment.status === 'completed' ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell>{payment.date || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

