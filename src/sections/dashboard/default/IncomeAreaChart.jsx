import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { LineChart } from '@mui/x-charts/LineChart';

// Sample data labels
const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Legend({ items, onToggle }) {
  return (
    <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'center', mt: 2.5, mb: 1.5 }}>
      {items.map((item) => (
        <Stack
          key={item.label}
          direction="row"
          sx={{ gap: 1.25, alignItems: 'center', cursor: 'pointer' }}
          onClick={() => onToggle(item.label)}
        >
          <Box sx={{ width: 12, height: 12, bgcolor: item.visible ? item.color : 'grey.500', borderRadius: '50%' }} />
          <Typography variant="body2" color="text.primary">
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

// Process transactions to get weekly data
const processWeeklyData = (transactions) => {
  const weekData = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
  const weekAmounts = [0, 0, 0, 0, 0, 0, 0];
  
  if (!transactions || transactions.length === 0) {
    return { counts: weekData, amounts: weekAmounts };
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  transactions.forEach((txn) => {
    const txnDate = new Date(txn.date_added * 1000);
    if (txnDate >= oneWeekAgo && txnDate <= now) {
      const dayOfWeek = txnDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6, Monday=1 to Monday=0
      
      weekData[adjustedDay] += 1;
      weekAmounts[adjustedDay] += txn.amount || 0;
    }
  });

  return { counts: weekData, amounts: weekAmounts };
};

// Process transactions to get monthly data
const processMonthlyData = (transactions) => {
  const monthData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Jan-Dec
  const monthAmounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  
  if (!transactions || transactions.length === 0) {
    return { counts: monthData, amounts: monthAmounts };
  }

  const currentYear = new Date().getFullYear();

  transactions.forEach((txn) => {
    const txnDate = new Date(txn.date_added * 1000);
    if (txnDate.getFullYear() === currentYear) {
      const month = txnDate.getMonth(); // 0-11
      
      monthData[month] += 1;
      monthAmounts[month] += txn.amount || 0;
    }
  });

  return { counts: monthData, amounts: monthAmounts };
};

// ==============================|| INCOME AREA CHART ||============================== //

export default function IncomeAreaChart({ view, transactions = [] }) {
  const theme = useTheme();

  const [visibility, setVisibility] = useState({
    'Transaction Count': true,
    'Transaction Volume': true
  });

  // Process data based on view type
  const chartData = useMemo(() => {
    if (view === 'weekly') {
      return processWeeklyData(transactions);
    } else {
      return processMonthlyData(transactions);
    }
  }, [view, transactions]);

  const labels = view === 'monthly' ? monthlyLabels : weeklyLabels;
  const data1 = chartData.counts;
  const data2 = chartData.amounts.map(amt => Math.round(amt / 100)); // Scale down amounts for better visualization

  const line = theme.palette.divider;

  const toggleVisibility = (label) => {
    setVisibility((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const visibleSeries = [
    {
      data: data1,
      label: 'Transaction Count',
      showMark: false,
      area: true,
      id: 'count',
      color: theme.palette.primary.main || '',
      visible: visibility['Transaction Count']
    },
    {
      data: data2,
      label: 'Transaction Volume',
      showMark: false,
      area: true,
      id: 'volume',
      color: theme.palette.primary[700] || '',
      visible: visibility['Transaction Volume']
    }
  ];

  const axisFonstyle = { fontSize: 10, fill: theme.palette.text.secondary };

  return (
    <>
      <LineChart
        hideLegend
        grid={{ horizontal: true }}
        xAxis={[{ scaleType: 'point', data: labels, disableLine: true, tickLabelStyle: axisFonstyle }]}
        yAxis={[{ disableLine: true, disableTicks: true, tickLabelStyle: axisFonstyle }]}
        height={450}
        margin={{ top: 40, bottom: -5, right: 20, left: 5 }}
        series={visibleSeries
          .filter((series) => series.visible)
          .map((series) => ({
            type: 'line',
            data: series.data,
            label: series.label,
            showMark: series.showMark,
            area: series.area,
            id: series.id,
            color: series.color,
            stroke: series.color,
            strokeWidth: 2
          }))}
        sx={{
          '& .MuiAreaElement-series-count': { fill: "url('#myGradient1')", strokeWidth: 2, opacity: 0.8 },
          '& .MuiAreaElement-series-volume': { fill: "url('#myGradient2')", strokeWidth: 2, opacity: 0.8 },
          '& .MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: line }
        }}
      >
        <defs>
          <linearGradient id="myGradient1" gradientTransform="rotate(90)">
            <stop offset="10%" stopColor={alpha(theme.palette.primary.main, 0.4)} />
            <stop offset="90%" stopColor={alpha(theme.palette.background.default, 0.4)} />
          </linearGradient>
          <linearGradient id="myGradient2" gradientTransform="rotate(90)">
            <stop offset="10%" stopColor={alpha(theme.palette.primary[700], 0.4)} />
            <stop offset="90%" stopColor={alpha(theme.palette.background.default, 0.4)} />
          </linearGradient>
        </defs>
      </LineChart>
      <Legend items={visibleSeries} onToggle={toggleVisibility} />
    </>
  );
}

Legend.propTypes = { items: PropTypes.array, onToggle: PropTypes.func };

IncomeAreaChart.propTypes = { 
  view: PropTypes.oneOf(['monthly', 'weekly']),
  transactions: PropTypes.array
};
