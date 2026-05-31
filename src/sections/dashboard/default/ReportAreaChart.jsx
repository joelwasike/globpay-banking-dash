import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

import { chartsGridClasses, LineChart } from '@mui/x-charts';

const labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Process transactions to get last 7 months data
const processMonthlyData = (transactions) => {
  const monthData = [0, 0, 0, 0, 0, 0, 0]; // Last 7 months
  
  if (!transactions || transactions.length === 0) {
    return monthData;
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  transactions.forEach((txn) => {
    const txnDate = new Date(txn.date_added * 1000);
    const txnMonth = txnDate.getMonth();
    const txnYear = txnDate.getFullYear();

    // Calculate how many months ago this transaction was
    let monthsAgo = (currentYear - txnYear) * 12 + (currentMonth - txnMonth);
    
    // If it's within the last 7 months (including current month)
    if (monthsAgo >= 0 && monthsAgo < 7) {
      const index = 6 - monthsAgo; // Reverse index so most recent is last
      monthData[index] += 1; // Count transactions
    }
  });

  return monthData;
};

// Generate dynamic labels for last 7 months
const getMonthLabels = () => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentMonth = now.getMonth();
  const labels = [];
  
  for (let i = 6; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    labels.push(monthNames[monthIndex]);
  }
  
  return labels;
};

// ==============================|| REPORT AREA CHART ||============================== //

export default function ReportAreaChart({ transactions = [] }) {
  const theme = useTheme();
  const axisFonstyle = { fill: theme.palette.text.secondary };

  const data = useMemo(() => {
    return processMonthlyData(transactions);
  }, [transactions]);

  const dynamicLabels = useMemo(() => {
    return getMonthLabels();
  }, []);

  return (
    <LineChart
      hideLegend
      grid={{ horizontal: true }}
      xAxis={[{ data: dynamicLabels, scaleType: 'point', disableLine: true, disableTicks: true, tickLabelStyle: axisFonstyle }]}
      yAxis={[{ position: 'none', tickMaxStep: 10 }]}
      series={[
        {
          data,
          showMark: false,
          id: 'ReportAreaChart',
          color: theme.palette.warning.main,
          label: 'Transactions'
        }
      ]}
      height={340}
      margin={{ top: 30, bottom: 25, left: 20, right: 20 }}
      sx={{ '& .MuiLineElement-root': { strokeWidth: 1 }, [`& .${chartsGridClasses.line}`]: { strokeDasharray: '5 3' } }}
    />
  );
}

ReportAreaChart.propTypes = {
  transactions: PropTypes.array
};
