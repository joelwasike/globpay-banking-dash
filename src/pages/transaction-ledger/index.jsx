import { useState, useEffect } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

// project imports
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| TRANSACTION LEDGER PAGE ||============================== //

export default function TransactionLedgerPage() {
  const { api } = useAuth();
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLedgerEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadLedgerEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/transaction/list');
      if (response.data?.Transactions) {
        setLedgerEntries(response.data.Transactions);
      } else if (response.data?.transactions) {
        setLedgerEntries(response.data.transactions);
      } else {
        setLedgerEntries([]);
      }
    } catch (error) {
      console.error('Error loading ledger entries:', error);
      setLedgerEntries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <PageLoader message="Loading ledger..." minHeight={320} />
      </Box>
    );
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Transaction Ledger</Typography>
          <TextField
            select
            label="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="debit">Debit</MenuItem>
          </TextField>
        </Box>
      </Grid>

      <Grid size={12}>
        <MainCard title="Ledger Entries">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Entry ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ledgerEntries.slice(0, 50).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>#{entry.id}</TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.transaction_report || 'Payment'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" color={entry.transaction_report === 'withdraw' ? 'error' : 'success'}>
                      {entry.transaction_report === 'withdraw' ? '-' : '+'}{entry.amount?.toLocaleString()} {entry.currency}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">-</TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.transaction_status} 
                      size="small" 
                      color={entry.transaction_status === 'SUCCESS' || entry.transaction_status === 'COMPLETE' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>{entry.date_added ? new Date(entry.date_added * 1000).toLocaleString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {ledgerEntries.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No ledger entries found
              </Typography>
            </Box>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}

