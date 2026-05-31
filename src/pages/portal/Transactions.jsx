import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import PageLoader from 'components/PageLoader';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';

export default function PortalTransactionsPage() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(50);
  const [status, setStatus] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [virtualAccounts, setVirtualAccounts] = useState([]);
  const [virtualAccount, setVirtualAccount] = useState('all');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const txUrl =
          user?.role === 'admin' ? `/api/v1/admin/transactions?limit=${limit}` : `/api/v1/portal/merchant/transactions?limit=${limit}`;
        const requests = [api.get(txUrl)];
        if (user?.role === 'merchant') requests.push(api.get('/api/v1/portal/merchant/virtual-accounts'));
        const [txRes, vaRes] = await Promise.all(requests);
        const data = txRes.data?.data;
        if (!mounted) return;
        setRows(data?.transactions || data || []);
        if (vaRes) setVirtualAccounts(vaRes.data?.data?.items || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [api, user?.role, limit]);

  const getCreatedAt = (t) => new Date(t.created_at || t.CreatedAt || 0);
  const statusColor = (s) => {
    const v = String(s || '').toLowerCase();
    if (v === 'completed' || v === 'success') return 'success';
    if (v === 'pending' || v === 'processing') return 'warning';
    if (v === 'failed' || v === 'error') return 'error';
    return 'default';
  };

  const filteredRows = rows.filter((t) => {
    const amount = Number(t.amount || 0);
    const createdAt = getCreatedAt(t);
    const createdTs = createdAt.getTime();

    if (status !== 'all' && String(t.status || '').toLowerCase() !== status) return false;
    if (currency !== 'all' && String(t.currency || '').toUpperCase() !== currency) return false;
    if (virtualAccount !== 'all') {
      const va = String(t.virtual_account_number || t.virtualAccountNumber || '');
      if (va !== virtualAccount) return false;
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = `${t.id ?? ''} ${t.external_id ?? ''} ${t.action ?? ''} ${t.phone ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (minAmount !== '' && amount < Number(minAmount)) return false;
    if (maxAmount !== '' && amount > Number(maxAmount)) return false;

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (createdTs < from.getTime()) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (createdTs > to.getTime()) return false;
    }

    return true;
  });

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h4">Transactions</Typography>
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing latest
            </Typography>
            <TextField
              size="small"
              type="number"
              label="Limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value || 50))}
              inputProps={{ min: 1, max: 200 }}
              sx={{ width: 120 }}
            />
          </Stack>

          {loading ? (
            <PageLoader message="Loading transactions..." minHeight={220} />
          ) : (
            <>
              <Stack spacing={2} sx={{ mb: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                  <TextField
                    size="small"
                    label="Search (id, external id, action, phone)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    sx={{ width: { xs: '100%', md: 160 } }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </TextField>
                  <TextField
                    size="small"
                    select
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    sx={{ width: { xs: '100%', md: 140 } }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="KES">KES</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </TextField>
                  {user?.role === 'merchant' && (
                    <TextField
                      size="small"
                      select
                      label="Virtual Account"
                      value={virtualAccount}
                      onChange={(e) => setVirtualAccount(e.target.value)}
                      sx={{ width: { xs: '100%', md: 220 } }}
                    >
                      <MenuItem value="all">All accounts</MenuItem>
                      {virtualAccounts.map((a) => (
                        <MenuItem key={a.id || a.virtual_account_number} value={a.virtual_account_number}>
                          {a.virtual_account_number}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
                  <TextField
                    size="small"
                    type="number"
                    label="Min Amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    sx={{ width: { xs: '100%', md: 160 } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Max Amount"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    sx={{ width: { xs: '100%', md: 160 } }}
                  />
                  <TextField
                    size="small"
                    type="date"
                    label="From"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: { xs: '100%', md: 170 } }}
                  />
                  <TextField
                    size="small"
                    type="date"
                    label="To"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: { xs: '100%', md: 170 } }}
                  />
                  <Chip
                    label={`${filteredRows.length} result${filteredRows.length === 1 ? '' : 's'}`}
                    variant="outlined"
                    sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                  />
                </Stack>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2, overflow: 'hidden' }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      {user?.role === 'admin' && <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>}
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Currency</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      {user?.role === 'merchant' && <TableCell sx={{ fontWeight: 700 }}>Virtual Account</TableCell>}
                      <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>External ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={user?.role === 'admin' ? 8 : user?.role === 'merchant' ? 8 : 7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No transactions found for your filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map((t) => (
                        <TableRow key={t.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{t.id}</TableCell>
                          {user?.role === 'admin' && <TableCell sx={{ fontFamily: 'monospace' }}>{t.user_id}</TableCell>}
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {Number(t.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{String(t.currency || '—').toUpperCase()}</TableCell>
                          <TableCell>
                            <Chip size="small" label={t.status || '—'} color={statusColor(t.status)} variant="outlined" />
                          </TableCell>
                          {user?.role === 'merchant' && (
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {t.virtual_account_number || t.virtualAccountNumber || '—'}
                            </TableCell>
                          )}
                          <TableCell>{t.action || '—'}</TableCell>
                          <TableCell sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.external_id || '—'}
                          </TableCell>
                          <TableCell>{t.created_at || t.CreatedAt ? getCreatedAt(t).toLocaleString() : '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
