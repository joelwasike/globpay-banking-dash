import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { BarChart } from '@mui/x-charts/BarChart';

// project imports
import MainCard from 'components/MainCard';

// Process transactions to get monthly successful and pending counts
const processTransactionData = (transactions, period) => {
  const successfulData = new Array(12).fill(0);
  const pendingData = new Array(12).fill(0);
  
  if (!transactions || transactions.length === 0) {
    return { successfulData, pendingData };
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  transactions.forEach((txn) => {
    const txnDate = new Date(txn.date_added * 1000);
    
    // Filter based on period
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (txnDate < today) return;
    } else if (period === 'month') {
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      if (txnDate.getMonth() !== thisMonth || txnDate.getFullYear() !== thisYear) return;
    } else if (period === 'year') {
      if (txnDate.getFullYear() !== currentYear) return;
    }

    const month = txnDate.getMonth();
    const status = txn.transaction_status;

    if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'COMPLETE') {
      successfulData[month] += (txn.amount || 0) / 1000; // Convert to thousands
    } else if (status === 'PENDING') {
      pendingData[month] += (txn.amount || 0) / 1000; // Convert to thousands
    }
  });

  return { 
    successfulData: successfulData.map(val => Math.round(val)), 
    pendingData: pendingData.map(val => Math.round(val))
  };
};

// Calculate net profit (successful - pending)
const calculateNetProfit = (transactions, period) => {
  if (!transactions || transactions.length === 0) return 0;

  const now = new Date();
  let filtered = transactions;

  if (period === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = transactions.filter(txn => new Date(txn.date_added * 1000) >= today);
  } else if (period === 'month') {
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    filtered = transactions.filter(txn => {
      const txnDate = new Date(txn.date_added * 1000);
      return txnDate.getMonth() === thisMonth && txnDate.getFullYear() === thisYear;
    });
  } else if (period === 'year') {
    const thisYear = now.getFullYear();
    filtered = transactions.filter(txn => new Date(txn.date_added * 1000).getFullYear() === thisYear);
  }

  const successful = filtered
    .filter(txn => txn.transaction_status === 'SUCCESS' || txn.transaction_status === 'COMPLETED' || txn.transaction_status === 'COMPLETE')
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  const pending = filtered
    .filter(txn => txn.transaction_status === 'PENDING')
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  return successful - pending;
};

// ==============================|| SALES COLUMN CHART ||============================== //

export default function SalesChart({ transactions = [], period = 'year' }) {
  const theme = useTheme();

  const [showSuccessful, setShowSuccessful] = useState(true);
  const [showPending, setShowPending] = useState(true);

  const handleSuccessfulChange = () => {
    setShowSuccessful(!showSuccessful);
  };

  const handlePendingChange = () => {
    setShowPending(!showPending);
  };

  const valueFormatter = (value) => `$ ${value} Thousands`;
  const successColor = theme.palette.success.main;
  const warningColor = theme.palette.warning.main;

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const { successfulData, pendingData } = useMemo(() => {
    return processTransactionData(transactions, period);
  }, [transactions, period]);

  const netProfit = useMemo(() => {
    return calculateNetProfit(transactions, period);
  }, [transactions, period]);

  const data = [
    { data: successfulData, label: 'Successful', color: successColor, valueFormatter },
    { data: pendingData, label: 'Pending', color: warningColor, valueFormatter }
  ];

  const axisFonstyle = { fontSize: 10, fill: theme.palette.text.secondary };

  return (
    <MainCard sx={{ mt: 1 }} content={false}>
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              Net Profit
            </Typography>
            <Typography variant="h4">${netProfit.toLocaleString()}</Typography>
          </Box>

          <FormGroup>
            <Stack direction="row">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showSuccessful}
                    onChange={handleSuccessfulChange}
                    sx={{ '&.Mui-checked': { color: successColor }, '&:hover': { backgroundColor: alpha(successColor, 0.08) } }}
                  />
                }
                label="Successful"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPending}
                    onChange={handlePendingChange}
                    sx={{ '&.Mui-checked': { color: warningColor } }}
                  />
                }
                label="Pending"
              />
            </Stack>
          </FormGroup>
        </Stack>

        <BarChart
          hideLegend
          height={380}
          grid={{ horizontal: true }}
          xAxis={[{ id: 'sales-x-axis', data: labels, scaleType: 'band', tickLabelStyle: { ...axisFonstyle, fontSize: 12 } }]}
          yAxis={[{ position: 'none' }]}
          series={data
            .filter((series) => (series.label === 'Successful' && showSuccessful) || (series.label === 'Pending' && showPending))
            .map((series) => ({ ...series, type: 'bar' }))}
          slotProps={{ bar: { rx: 5, ry: 5 }, tooltip: { trigger: 'item' } }}
          axisHighlight={{ x: 'none', y: 'none' }}
          margin={{ top: 30, left: 10, bottom: 25, right: 10 }}
          sx={{
            '& .MuiBarElement-root:hover': { opacity: 0.6 },
            '& .MuiChartsAxis-directionX .MuiChartsAxis-tick, & .MuiChartsAxis-root line': { stroke: theme.palette.divider }
          }}
        />
      </Box>
    </MainCard>
  );
}

SalesChart.propTypes = {
  transactions: PropTypes.array,
  period: PropTypes.oneOf(['today', 'month', 'year'])
};
