import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';

export default function OverviewPage() {
  const { api, user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [txRows, setTxRows] = useState([]);
  const [txSeries, setTxSeries] = useState({ labels: [], amounts: [], counts: [] });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        if (user?.role === 'admin') {
          const [statsRes, volumeRes] = await Promise.all([
            api.get('/api/v1/admin/stats'),
            api.get('/api/v1/admin/analytics/volume?days=14')
          ]);
          if (!mounted) return;
          setData({ stats: statsRes.data?.data, volume: volumeRes.data?.data });
        } else {
          const [profileRes, ratesRes, txRes] = await Promise.all([
            api.get('/api/v1/portal/merchant/profile'),
            api.get('/api/v1/portal/merchant/rates'),
            api.get('/api/v1/portal/merchant/transactions?limit=200&offset=0')
          ]);
          if (!mounted) return;

          const tx = Array.isArray(txRes.data?.data) ? txRes.data.data : [];
          setTxRows(tx.slice(0, 8));

          // Build last-14-days series (local time buckets)
          const today = new Date();
          const labels = [];
          const amounts = [];
          const counts = [];
          for (let i = 13; i >= 0; i -= 1) {
            const d = new Date(today);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }));
            amounts.push(0);
            counts.push(0);
          }
          const start = new Date(today);
          start.setHours(0, 0, 0, 0);
          start.setDate(start.getDate() - 13);

          tx.forEach((t) => {
            const dt = new Date(t.created_at || t.CreatedAt || 0);
            if (Number.isNaN(dt.getTime())) return;
            if (dt < start) return;
            const dayIndex = Math.floor((dt.setHours(0, 0, 0, 0) - start.getTime()) / (24 * 60 * 60 * 1000));
            if (dayIndex < 0 || dayIndex >= 14) return;
            amounts[dayIndex] += Number(t.amount || 0);
            counts[dayIndex] += 1;
          });
          setTxSeries({ labels, amounts, counts });

          setData({
            profile: profileRes.data?.data,
            rates: ratesRes.data?.data
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [api, user?.role]);

  if (loading) return <PageLoader message="Loading overview..." minHeight={240} />;

  const adminVolumePoints = user?.role === 'admin' ? data?.volume?.data || [] : [];

  const Hero = ({ title, subtitle, right }) => (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        color: 'common.white',
        background: 'linear-gradient(135deg, #062a2e 0%, #00606c 50%, #14b8a6 110%)'
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {subtitle}
          </Typography>
        </Box>
        {right}
      </Stack>
    </Box>
  );

  const StatCard = ({ label, value, helper }) => (
    <MainCard sx={{ height: '100%' }}>
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        {helper && (
          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        )}
      </Stack>
    </MainCard>
  );

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Hero
          title="Financial Overview"
          subtitle={user?.role === 'admin' ? 'Platform analytics and controls' : 'Balances, activity, and performance'}
          right={
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Chip label={(user?.role || '—').toUpperCase()} color="primary" variant="filled" />
              {user?.role === 'merchant' && data?.profile?.merchant?.name && (
                <Chip label={data.profile.merchant.name} color="default" variant="filled" />
              )}
            </Stack>
          }
        />
      </Grid>

      {user?.role === 'admin' ? (
        <>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard label="Users" value={data?.stats?.users ?? 0} helper="Total app users" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard label="Transactions" value={data?.stats?.transactions ?? 0} helper="All-time" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard label="Cards" value={data?.stats?.cards ?? 0} helper="Issued cards" />
          </Grid>

          <Grid size={12}>
            <MainCard>
              <Stack spacing={1.5}>
                <Typography variant="h6">Volume (Last 14 Days)</Typography>
                <Divider />
                <LineChart
                  height={280}
                  series={[
                    {
                      data: adminVolumePoints.map((p) => Number(p.total_amount || 0)),
                      label: 'Total Amount',
                      area: true,
                      showMark: false,
                      color: theme.palette.primary.main
                    }
                  ]}
                  xAxis={[
                    {
                      scaleType: 'point',
                      data: adminVolumePoints.map((p) => p.date)
                    }
                  ]}
                />
              </Stack>
            </MainCard>
          </Grid>
        </>
      ) : (
        <>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard
              label="KES Balance"
              value={`KES ${(data?.profile?.user?.kes_balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              helper={`Virtual Acc: ${data?.profile?.user?.virtual_account_number || '—'}`}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard
              label="USD Balance"
              value={`USD ${(data?.profile?.user?.usd_balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              helper={`Account #: ${data?.profile?.user?.account_number || '—'}`}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard
              label="Effective Rate"
              value={`${((data?.rates?.effective_rate_bps ?? 0) / 100).toFixed(2)}%`}
              helper={data?.rates?.has_override ? 'Merchant override enabled' : 'Using global rate'}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <MainCard>
              <Stack spacing={1.5}>
                <Typography variant="h6">KES Deposits (Last 14 Days)</Typography>
                <Divider />
                <LineChart
                  height={260}
                  series={[
                    { data: txSeries.amounts, label: 'Amount', area: true, showMark: false, color: theme.palette.primary.main },
                    { data: txSeries.counts, label: 'Count', showMark: false, color: theme.palette.secondary.main }
                  ]}
                  xAxis={[{ scaleType: 'point', data: txSeries.labels }]}
                />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <MainCard>
              <Stack spacing={1.5}>
                <Typography variant="h6">Recent Transactions</Typography>
                <Divider />
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {txRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              No transactions yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        txRows.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>{t.id}</TableCell>
                            <TableCell align="right">
                              {Number(t.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={t.status || '—'} color={t.status === 'completed' ? 'success' : 'default'} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </MainCard>
          </Grid>
        </>
      )}
    </Grid>
  );
}
