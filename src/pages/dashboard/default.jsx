import { useState, useEffect } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import ReportAreaChart from 'sections/dashboard/default/ReportAreaChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import SaleReportCard from 'sections/dashboard/default/SaleReportCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import BlockedSection from 'sections/dashboard/default/BlockedSection';

// assets
import FilterOutlined from '@ant-design/icons/FilterOutlined';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';

// Context
import { useAuth } from 'contexts/AuthContext';

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const { api } = useAuth();
  const [payoutBalance, setPayoutBalance] = useState({ totalBalance: 0, baseCurrency: 'USD' });
  const [payinBalance, setPayinBalance] = useState({ totalBalance: 0, baseCurrency: 'USD' });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Track all loaded transactions
  const [totalCount, setTotalCount] = useState(0); // Total from pagination
  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Helper function to calculate stats from transactions
  const calculateStats = (txns, total) => {
    return {
      total: total || txns.length,
      successful: txns.filter(t => 
        t.transaction_status === 'SUCCESS' || 
        t.transaction_status === 'COMPLETED' || 
        t.transaction_status === 'COMPLETE'
      ).length,
      pending: txns.filter(t => t.transaction_status === 'PENDING').length,
      failed: txns.filter(t => t.transaction_status === 'FAILED').length,
    };
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load payout balance
      try {
        const balanceResponse = await api.get('/api/v1/transaction/read/balance');
        if (balanceResponse.data && balanceResponse.data.Balances) {
          const b = balanceResponse.data.Balances;
          setPayoutBalance({ totalBalance: b.totalBalance || 0, baseCurrency: 'USD' });
        }
      } catch (error) {
        console.error('Error loading payout balance:', error);
      }

      // Load payin balance
      try {
        const payinResp = await api.get('/api/v1/transaction/read/payins/balance');
        if (payinResp.data && payinResp.data.Balances) {
          const b = payinResp.data.Balances;
          setPayinBalance({ totalBalance: b.totalBalance || 0, baseCurrency: 'USD' });
        }
      } catch (error) {
        console.error('Error loading payin balance:', error);
      }

      // Load transactions list for stats and recent (using paginated endpoint)
      try {
        // STEP 1: Load first page immediately for fast initial display
        const firstPageResponse = await api.get('/api/v1/merchants/transaction/list', {
          params: {
            page: 1,
            limit: 100
          }
        });
        
        let recentTxns = [];
        let initialTotalCount = 0;
        let totalPages = 1;
        
        if (firstPageResponse.data?.transactions) {
          recentTxns = firstPageResponse.data.transactions;
          if (firstPageResponse.data.pagination) {
            initialTotalCount = firstPageResponse.data.pagination.total || 0;
            totalPages = firstPageResponse.data.pagination.total_pages || 1;
          }
        } else if (firstPageResponse.data?.Transactions) {
          // Fallback for old API format
          recentTxns = firstPageResponse.data.Transactions;
          initialTotalCount = recentTxns.length;
        }
        
        // Set initial state
        setRecentTransactions(recentTxns);
        setAllTransactions(recentTxns);
        setTotalCount(initialTotalCount);
        setTransactionStats(calculateStats(recentTxns, initialTotalCount));
        
        // STEP 2: Stop loading to show initial data quickly
        setLoading(false);
        
        // STEP 3: Load additional pages incrementally in background
        if (totalPages > 1) {
          // Load up to 100 pages (10,000 transactions) for better accuracy
          // This balances accuracy with performance - can be adjusted based on needs
          const maxPagesToFetch = Math.min(totalPages, 100);
          
          // Load in smaller batches (2 pages) for more frequent updates
          // This will result in ~50 updates (100 pages / 2 per batch)
          const batchSize = 2;
          
          for (let batchStart = 2; batchStart <= maxPagesToFetch; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize - 1, maxPagesToFetch);
            // Load each batch in parallel
            const batchPromises = [];
            for (let page = batchStart; page <= batchEnd; page++) {
              batchPromises.push(
                api.get('/api/v1/merchants/transaction/list', {
                  params: {
                    page: page,
                    limit: 100
                  }
                }).catch(error => {
                  console.error(`Error loading page ${page}:`, error);
                  return { data: { transactions: [] } };
                })
              );
            }
            
            // Wait for batch to complete, then update
            const batchResponses = await Promise.all(batchPromises);
            const batchTxns = [];
            batchResponses.forEach(response => {
              if (response.data?.transactions) {
                batchTxns.push(...response.data.transactions);
              } else if (response.data?.Transactions) {
                batchTxns.push(...response.data.Transactions);
              }
            });
            
            if (batchTxns.length > 0) {
              // Update state with new batch incrementally
              setAllTransactions(prev => {
                const updated = [...prev, ...batchTxns];
                // Recalculate stats with updated transactions
                setTransactionStats(calculateStats(updated, initialTotalCount));
                return updated;
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <PageLoader message="Loading dashboard..." minHeight={320} />
      </Box>
    );
  }

  // Calculate total of ALL transactions (regardless of status)
  // Use allTransactions for accurate totals as they load
  const calculateAllTransactionsTotal = () => {
    return allTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
  };

  const totalAllTransactions = calculateAllTransactionsTotal();

  // Calculate total of all successful/completed transactions
  const calculateSuccessfulTransactionsTotal = () => {
    return allTransactions
      .filter(txn => {
        const isSuccessful = txn.transaction_status === 'SUCCESS' || txn.transaction_status === 'COMPLETED' || txn.transaction_status === 'COMPLETE';
        return isSuccessful;
      })
      .reduce((sum, txn) => sum + (txn.amount || 0), 0);
  };

  const totalSuccessfulTransactions = calculateSuccessfulTransactionsTotal();

  // Calculate values from API data
  const successRate = transactionStats.total > 0 
    ? ((transactionStats.successful / transactionStats.total) * 100).toFixed(1) 
    : 0;

  // Calculate weekly successful transactions total
  // Use allTransactions for accurate weekly totals as they load
  const calculateWeeklySuccessfulTotal = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return allTransactions
      .filter(txn => {
        const txnDate = new Date(txn.date_added * 1000);
        const isInWeek = txnDate >= oneWeekAgo && txnDate <= now;
        const isSuccessful = txn.transaction_status === 'SUCCESS' || txn.transaction_status === 'COMPLETED' || txn.transaction_status === 'COMPLETE';
        return isInWeek && isSuccessful;
      })
      .reduce((sum, txn) => sum + (txn.amount || 0), 0);
  };

  const weeklySuccessfulTotal = calculateWeeklySuccessfulTotal();

  const capturedCount = transactionStats.successful;
  const awaitingCount = transactionStats.pending;
  const failedCount = transactionStats.failed;
  const totalCountVal = transactionStats.total;
  const capturedPct = totalCountVal > 0 ? ((capturedCount / totalCountVal) * 100).toFixed(2) : '0.00';
  const awaitingPct = totalCountVal > 0 ? ((awaitingCount / totalCountVal) * 100).toFixed(2) : '0.00';
  const failedPct = totalCountVal > 0 ? ((failedCount / totalCountVal) * 100).toFixed(2) : '0.00';

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* PayToro-style: Advance Search */}
      <Grid size={12}>
        <MainCard sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Payin/Deposit Advance Search
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={2} alignItems="center">
            <TextField
              size="small"
              label="Date Range"
              placeholder="DD-MMM-YYYY HH:mm:ss - DD-MMM-YYYY HH:mm:ss"
              sx={{ minWidth: 320 }}
            />
            <TextField select size="small" label="Sub Merchant" defaultValue="" sx={{ minWidth: 200 }}>
              <MenuItem value="">All</MenuItem>
            </TextField>
            <TextField select size="small" label="Currency" defaultValue="AED" sx={{ minWidth: 180 }}>
              <MenuItem value="AED">AED - AED</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<FilterOutlined />}>
              Apply Filter
            </Button>
          </Stack>
        </MainCard>
      </Grid>
      {/* Summary cards: APPROVED, AWAITING, FAILED, TOTAL */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>APPROVED</Typography>
          <Typography variant="h4">{capturedPct}%</Typography>
          <Box sx={{ mt: 1, height: 6, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${capturedPct}%`, bgcolor: 'success.main', borderRadius: 1 }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Typography variant="body2">Count(s): {capturedCount}</Typography>
            <Typography variant="body2">Amount: {payinBalance.baseCurrency || 'USD'} {Number(payinBalance.totalBalance || 0).toLocaleString()}</Typography>
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>AWAITING</Typography>
          <Typography variant="h4">{awaitingPct}%</Typography>
          <Box sx={{ mt: 1, height: 6, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${awaitingPct}%`, bgcolor: 'warning.main', borderRadius: 1 }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Typography variant="body2">Count(s): {awaitingCount}</Typography>
            <Typography variant="body2">Amount: 0</Typography>
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>FAILED</Typography>
          <Typography variant="h4">{failedPct}%</Typography>
          <Box sx={{ mt: 1, height: 6, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${failedPct}%`, bgcolor: 'error.main', borderRadius: 1 }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Typography variant="body2">Count(s): {failedCount}</Typography>
            <Typography variant="body2">Amount: 0</Typography>
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>TOTAL</Typography>
          <Typography variant="h4">100.00%</Typography>
          <Box sx={{ mt: 1, height: 6, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Typography variant="body2">Count(s): {totalCountVal}</Typography>
            <Typography variant="body2">Amount: {payinBalance.baseCurrency || 'USD'} {Number(payinBalance.totalBalance || 0).toLocaleString()}</Typography>
          </Stack>
        </MainCard>
      </Grid>

      {/* Blocked (WPAY blocklist) */}
      <Grid size={12}>
        <BlockedSection api={api} />
      </Grid>

      {/* row 1 - existing stats */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Overview</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total Transacted" 
          count={`$${totalSuccessfulTransactions.toLocaleString()}`} 
          percentage={59.3} 
          extra={`$${totalAllTransactions.toLocaleString()}`} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total Transactions" 
          count={transactionStats.total.toLocaleString()} 
          percentage={70.5} 
          extra={transactionStats.pending.toString()} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Pending Transactions" 
          count={transactionStats.pending.toString()} 
          percentage={27.4} 
          isLoss 
          color="warning" 
          extra={transactionStats.failed.toString()} 
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Success Rate" 
          count={`${successRate}%`} 
          percentage={parseFloat(successRate)} 
          isLoss={parseFloat(successRate) < 90}
          color={parseFloat(successRate) >= 90 ? 'success' : 'warning'} 
          extra={transactionStats.successful.toString()} 
        />
      </Grid>
      <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard transactions={allTransactions} />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Income Overview</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                This Week Statistics
              </Typography>
              <Typography variant="h3">${weeklySuccessfulTotal.toLocaleString()}</Typography>
            </Stack>
          </Box>
          <MonthlyBarChart transactions={allTransactions} />
        </MainCard>
      </Grid>
      {/* row 3 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Recent Orders</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable transactions={allTransactions} />
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Analytics Report</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
            <ListItemButton divider>
              <ListItemText primary="Total Transaction Volume" />
              <Typography variant="h5">${totalSuccessfulTransactions.toLocaleString()}</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Success Rate" />
              <Typography variant="h5">{successRate}%</Typography>
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary="Transaction Risk" />
              <Typography variant="h5" color={transactionStats.failed > 10 ? 'error.main' : 'success.main'}>
                {transactionStats.failed > 10 ? 'High' : 'Low'}
              </Typography>
            </ListItemButton>
          </List>
          <ReportAreaChart transactions={allTransactions} />
        </MainCard>
      </Grid>
      {/* row 4 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <SaleReportCard transactions={allTransactions} />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Transaction History</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List
            component="nav"
            sx={{
              px: 0,
              py: 0,
              '& .MuiListItemButton-root': {
                py: 1.5,
                px: 2,
                '& .MuiAvatar-root': avatarSX,
                '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
              }
            }}
          >
            {allTransactions.slice(0, 3).map((transaction, idx) => {
              const icons = [GiftOutlined, MessageOutlined, SettingOutlined];
              const colors = ['success', 'primary', 'error'];
              const Icon = icons[idx % 3];
              const color = colors[idx % 3];
              
              return (
                <ListItem
                  key={transaction.id || idx}
                  component={ListItemButton}
                  divider={idx < 2}
                  secondaryAction={
                    <Stack sx={{ alignItems: 'flex-end' }}>
                      <Typography variant="subtitle1" noWrap>
                        ${transaction.amount?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="h6" color="secondary" noWrap>
                        {totalSuccessfulTransactions > 0 ? ((transaction.amount / totalSuccessfulTransactions) * 100).toFixed(0) : 0}%
                      </Typography>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ color: `${color}.main`, bgcolor: `${color}.lighter` }}>
                      <Icon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography variant="subtitle1">Order #{transaction.external_id || transaction.id}</Typography>} 
                    secondary={transaction.date_added ? new Date(transaction.date_added * 1000).toLocaleString() : 'N/A'}
                  />
                </ListItem>
              );
            })}
          </List>
        </MainCard>
        <MainCard sx={{ mt: 2 }}>
          <Stack sx={{ gap: 3 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid>
                <Stack>
                  <Typography variant="h5" noWrap>
                    Help & Support Chat
                  </Typography>
                  <Typography variant="caption" color="secondary" noWrap>
                    Typical reply within 5 min
                  </Typography>
                </Stack>
              </Grid>
              <Grid>
                <AvatarGroup sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                  <Avatar alt="Remy Sharp" src={avatar1} />
                  <Avatar alt="Travis Howard" src={avatar2} />
                  <Avatar alt="Cindy Baker" src={avatar3} />
                  <Avatar alt="Agnes Walker" src={avatar4} />
                </AvatarGroup>
              </Grid>
            </Grid>
            <Button size="small" variant="contained" sx={{ textTransform: 'capitalize' }}>
              Need Help?
            </Button>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
