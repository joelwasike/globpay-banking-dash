import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

export default function RatesPage() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [globalRateBps, setGlobalRateBps] = useState(0);
  const [merchantRateBps, setMerchantRateBps] = useState(0);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const bpsToPct = (bps) => `${(Number(bps || 0) / 100).toFixed(2)}%`;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setError('');
      setSuccess('');
      try {
        setLoading(true);
        if (user?.role === 'admin') {
          const merchantsRes = await api.get('/api/v1/admin/merchants?limit=200');
          const list = merchantsRes.data?.data || [];
          if (!mounted) return;
          setMerchants(list);
        } else {
          const res = await api.get('/api/v1/portal/merchant/rates');
          if (!mounted) return;
          setGlobalRateBps(res.data?.data?.global_rate_bps ?? 0);
          setMerchantRateBps(res.data?.data?.effective_rate_bps ?? 0);
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

  const setGlobal = async () => {
    setError('');
    setSuccess('');
    try {
      setSaving(true);
      await api.put('/api/v1/admin/rates/global', { rate_bps: Number(globalRateBps) });
      setSuccess('Global rate updated');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update global rate');
    } finally {
      setSaving(false);
    }
  };

  const setMerchant = async () => {
    setError('');
    setSuccess('');
    if (!selectedMerchantId) return setError('Select a merchant');
    try {
      setSaving(true);
      await api.put(`/api/v1/admin/rates/merchants/${selectedMerchantId}`, { rate_bps: Number(merchantRateBps) });
      setSuccess('Merchant rate updated');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update merchant rate');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader message="Loading rates..." minHeight={220} />;

  if (user?.role !== 'admin') {
    return (
      <Grid container rowSpacing={3} columnSpacing={2.75}>
        <Grid size={12}>
          <Typography variant="h4">Rates</Typography>
        </Grid>
        <Grid size={12}>
          <MainCard>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Your Pricing</Typography>
                <Chip size="small" label="Basis points" variant="outlined" />
              </Stack>
              <Divider />
	              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
	                <MainCard sx={{ flex: 1, bgcolor: 'background.default' }}>
	                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Global Default
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {bpsToPct(globalRateBps)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {globalRateBps} bps
                    </Typography>
                  </Stack>
                </MainCard>
                <MainCard sx={{ flex: 1, bgcolor: 'background.default' }}>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Your Effective Rate
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {bpsToPct(merchantRateBps)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {merchantRateBps} bps
                    </Typography>
                  </Stack>
	                </MainCard>
	              </Stack>
	            </Stack>
	          </MainCard>
	        </Grid>
	      </Grid>
	    );
	  }

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h4">Rates</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Set global and per-merchant transaction rates (basis points).
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Typography variant="h6">Global Rate</Typography>
            <Typography variant="body2" color="text.secondary">
              Set the platform default. 250 bps = 2.50%.
            </Typography>
            <Divider />
            <TextField
              type="number"
              label="Rate (bps)"
              value={globalRateBps}
              onChange={(e) => setGlobalRateBps(e.target.value)}
            />
            <Button variant="contained" onClick={setGlobal} disabled={saving}>
              Save Global Rate
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard>
          <Stack spacing={2}>
            <Typography variant="h6">Merchant Override</Typography>
            <Typography variant="body2" color="text.secondary">
              Overrides apply to one merchant only.
            </Typography>
            <Divider />
            <TextField
              select
              label="Merchant"
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
            >
              {merchants.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name} (#{m.id})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Rate (bps)"
              value={merchantRateBps}
              onChange={(e) => setMerchantRateBps(e.target.value)}
            />
            <Button variant="contained" onClick={setMerchant} disabled={saving}>
              Save Merchant Rate
            </Button>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
