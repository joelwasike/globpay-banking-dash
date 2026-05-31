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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

export default function AdminMerchantsPage() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [virtualAccountNumber, setVirtualAccountNumber] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/api/v1/admin/merchants?limit=200');
      setRows(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const openPortal = (m) => {
    setSelected(m);
    setPortalEmail('');
    setPortalPassword('');
    setVirtualAccountNumber('');
    setOpen(true);
  };

  const savePortal = async () => {
    if (!selected) return;
    setError('');
    try {
      const merchantId = selected.id ?? selected.ID;
      await api.post(`/api/v1/admin/merchants/${merchantId}/portal-user`, {
        email: portalEmail,
        password: portalPassword
      });

      if (virtualAccountNumber?.trim()) {
        await api.put(`/api/v1/admin/merchants/${merchantId}/virtual-account`, {
          virtual_account_number: virtualAccountNumber.trim()
        });
      }
      setOpen(false);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create/update portal user');
    }
  };

  if (loading) return <PageLoader message="Loading merchants..." minHeight={240} />;

  if (user?.role !== 'admin') {
    return (
      <MainCard>
        <Typography variant="body2" color="text.secondary">
          Merchants management is available to admins only.
        </Typography>
      </MainCard>
    );
  }

  const filtered = rows.filter((m) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const hay = `${m.id ?? m.ID ?? ''} ${m.name ?? ''} ${m.user_email ?? ''} ${m.user_id ?? ''}`.toLowerCase();
    return hay.includes(q);
  });

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h4">Merchants</Typography>
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              size="small"
              label="Search (id, name, email)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>User Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>API Key Hint</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No merchants found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m) => (
                      <TableRow key={m.id ?? m.ID}>
                        <TableCell>{m.id ?? m.ID}</TableCell>
                        <TableCell>{m.name}</TableCell>
                        <TableCell>{m.user_id}</TableCell>
                        <TableCell>{m.user_email || '—'}</TableCell>
                        <TableCell>{m.api_key_hint || m.apiKeyHint || '—'}</TableCell>
                        <TableCell align="right">
                          <Button variant="outlined" size="small" onClick={() => openPortal(m)}>
                            Set Portal Login
                          </Button>
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Merchant Portal Login</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Merchant: {selected?.name} (#{selected?.id ?? selected?.ID})
            </Typography>
            <Divider />
            <TextField label="Portal Email" value={portalEmail} onChange={(e) => setPortalEmail(e.target.value)} fullWidth />
            <TextField
              label="Portal Password"
              type="password"
              value={portalPassword}
              onChange={(e) => setPortalPassword(e.target.value)}
              helperText="Merchant should change this after first login."
              fullWidth
            />
            <TextField
              label="Virtual Account Number (optional)"
              value={virtualAccountNumber}
              onChange={(e) => setVirtualAccountNumber(e.target.value)}
              helperText="12 digits, starts with 9835. Leave blank to auto-generate on first profile load."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={savePortal}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
