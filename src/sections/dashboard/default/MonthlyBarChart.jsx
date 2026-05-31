import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

import { BarChart } from '@mui/x-charts/BarChart';

const xLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// Process transactions to get weekly data (only successful transactions)
const processWeeklyData = (transactions) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentDayOfWeek = now.getDay();
  const adjustedCurrentDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Convert Sunday=0 to Sunday=6, Monday=1 to Monday=0

  // Initialize all 7 days with 0
  const weekData = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  if (transactions && transactions.length > 0) {
    transactions.forEach((txn) => {
      const txnDate = new Date(txn.date_added * 1000);
      const isInWeek = txnDate >= oneWeekAgo && txnDate <= now;
      const isSuccessful = txn.transaction_status === 'SUCCESS' || txn.transaction_status === 'COMPLETED' || txn.transaction_status === 'COMPLETE';
      
      if (isInWeek && isSuccessful) {
        const dayOfWeek = txnDate.getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6, Monday=1 to Monday=0
        
        weekData[adjustedDay] += (txn.amount || 0) / 100;
      }
    });
  }

  // Create labels and data for all 7 days, but only show data up to current day
  const labels = [...dayLabels]; // All 7 days
  const data = [];

  for (let day = 0; day < 7; day++) {
    if (day <= adjustedCurrentDay) {
      // Show real data for days that have occurred
      data.push(Math.round(weekData[day]));
    } else {
      // Show 0 for future days
      data.push(0);
    }
  }

  return { labels, data };
};

// ==============================|| MONTHLY BAR CHART ||============================== //

export default function MonthlyBarChart({ transactions = [] }) {
  const theme = useTheme();
  const axisFonstyle = { fontSize: 10, fill: theme.palette.text.secondary };

  const { labels, data } = useMemo(() => {
    return processWeeklyData(transactions);
  }, [transactions]);

  return (
    <BarChart
      hideLegend
      height={380}
      series={[{ data, label: 'Weekly Statistics' }]}
      xAxis={[{ data: labels, scaleType: 'band', disableLine: true, disableTicks: true, tickLabelStyle: axisFonstyle }]}
      yAxis={[{ position: 'none' }]}
      slotProps={{ bar: { rx: 5, ry: 5 } }}
      axisHighlight={{ x: 'none' }}
      margin={{ left: 20, right: 20 }}
      colors={[theme.palette.info.light]}
      sx={{ '& .MuiBarElement-root:hover': { opacity: 0.6 } }}
    />
  );
}

MonthlyBarChart.propTypes = {
  transactions: PropTypes.array
};
