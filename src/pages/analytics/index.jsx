import { useState, useEffect } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PageLoader from 'components/PageLoader';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import { useAuth } from 'contexts/AuthContext';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';

// ==============================|| ANALYTICS PAGE ||============================== //

export default function AnalyticsPage() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // Total from pagination
  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  });
  
  // Helper function to calculate stats from transactions
  const calculateStats = (txns, total) => {
    return {
      total: total || txns.length,
      successful: txns.filter(t => t.transaction_status === 'SUCCESS' || t.transaction_status === 'COMPLETE').length,
      pending: txns.filter(t => t.transaction_status === 'PENDING').length,
      failed: txns.filter(t => t.transaction_status === 'FAILED').length,
      totalAmount: txns.reduce((sum, t) => sum + (t.amount || 0), 0)
    };
  };

  useEffect(() => {
    loadAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // STEP 1: Load first page immediately for fast initial display
      const firstPageResponse = await api.get('/api/v1/merchants/transaction/list', {
        params: {
          page: 1,
          limit: 100
        }
      });
      
      let firstPageTxns = [];
      let initialTotalCount = 0;
      let totalPages = 1;
      
      if (firstPageResponse.data?.transactions) {
        firstPageTxns = firstPageResponse.data.transactions;
        if (firstPageResponse.data.pagination) {
          initialTotalCount = firstPageResponse.data.pagination.total || 0;
          totalPages = firstPageResponse.data.pagination.total_pages || 1;
        }
      } else if (firstPageResponse.data?.Transactions) {
        // Fallback for old API format
        firstPageTxns = firstPageResponse.data.Transactions;
        initialTotalCount = firstPageTxns.length;
      }
      
      // Set initial state
      setTransactions(firstPageTxns);
      setTotalCount(initialTotalCount);
      setTransactionStats(calculateStats(firstPageTxns, initialTotalCount));
      
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
            setTransactions(prev => {
              const updated = [...prev, ...batchTxns];
              // Recalculate stats with updated transactions
              setTransactionStats(calculateStats(updated, initialTotalCount));
              return updated;
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <PageLoader message="Loading analytics..." minHeight={320} />
      </Box>
    );
  }

  const successRate = transactionStats.total > 0 
    ? ((transactionStats.successful / transactionStats.total) * 100).toFixed(1) 
    : 0;

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Analytics</Typography>
      </Grid>

      {/* Stats Cards */}
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
          title="Successful"
          count={transactionStats.successful.toLocaleString()}
          percentage={successRate}
          color="success"
          extra={`${successRate}%`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title="Pending"
          count={transactionStats.pending.toString()}
          percentage={27.4}
          isLoss
          color="warning"
          extra={transactionStats.failed.toString()}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Volume"
          count={`$${transactionStats.totalAmount.toLocaleString()}`}
          percentage={59.3}
          extra="Total"
        />
      </Grid>

      {/* Charts */}
      <Grid size={12}>
        <UniqueVisitorCard transactions={transactions} />
      </Grid>

      <Grid size={12}>
        <MainCard title="Transaction Volume - This Week" content={false}>
          <Box sx={{ p: 2 }}>
            <MonthlyBarChart transactions={transactions} />
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

