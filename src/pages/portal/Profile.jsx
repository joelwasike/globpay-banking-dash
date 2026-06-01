import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

export default function PortalProfilePage() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState('');
  const [callbackSaving, setCallbackSaving] = useState(false);
  const [callbackError, setCallbackError] = useState('');
  const [callbackSuccess, setCallbackSuccess] = useState('');

  const copyText = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        if (user?.role !== 'merchant') {
          setProfile(null);
          return;
        }
        const res = await api.get('/api/v1/portal/merchant/profile');
        if (mounted) setProfile(res.data?.data);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [api, user?.role]);

  const openCallback = () => {
    setCallbackError('');
    setCallbackSuccess('');
    setCallbackUrl(profile?.merchant?.callback_url || '');
    setCallbackOpen(true);
  };

  const saveCallback = async () => {
    setCallbackError('');
    setCallbackSuccess('');
    try {
      setCallbackSaving(true);
      await api.put('/api/v1/portal/merchant/callback-url', { callback_url: callbackUrl });
      setCallbackSuccess('Callback URL updated');
      const res = await api.get('/api/v1/portal/merchant/profile');
      setProfile(res.data?.data);
      setTimeout(() => setCallbackOpen(false), 700);
    } catch (e) {
      setCallbackError(e?.response?.data?.message || 'Failed to update callback URL');
    } finally {
      setCallbackSaving(false);
    }
  };

  if (loading) return <PageLoader message="Loading profile..." minHeight={220} />;

  if (user?.role !== 'merchant') {
    return (
      <MainCard>
        <Typography variant="body2" color="text.secondary">
          Profile is available for merchant accounts.
        </Typography>
      </MainCard>
    );
  }

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h4">Profile</Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard sx={{ height: '100%' }}>
          <Stack spacing={1}>
            <Typography variant="h6">Balances</Typography>
            <Divider />
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                KES
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {(profile?.user?.kes_balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                USD
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {(profile?.user?.usd_balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Typography>
            </Stack>
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <MainCard sx={{ height: '100%' }}>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Typography variant="h6">Merchant & Account</Typography>
              {copied && <Chip size="small" color="success" label="Copied" />}
            </Stack>
            <Divider />
            <Grid container rowSpacing={2} columnSpacing={2.75}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Merchant Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {profile?.merchant?.name || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Merchant ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {profile?.merchant?.id || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {profile?.user?.email || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {profile?.user?.phone || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Account #
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {profile?.user?.account_number || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Primary Virtual Account #
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {profile?.user?.virtual_account_number || '—'}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyText(profile?.user?.virtual_account_number || '')}
                    disabled={!profile?.user?.virtual_account_number}
                  >
                    Copy
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="h6">Virtual Accounts</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {(profile?.virtual_accounts || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No virtual accounts.
                  </Typography>
                ) : (
                  (profile.virtual_accounts || []).map((a) => (
                    <Chip
                      key={a.id || a.virtual_account_number}
                      label={a.virtual_account_number}
                      variant="outlined"
                      onClick={() => copyText(a.virtual_account_number)}
                      sx={{ fontFamily: 'monospace' }}
                    />
                  ))
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Click a virtual account to copy.
              </Typography>

              <Divider sx={{ my: 1.25 }} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
                <Stack spacing={0.25} sx={{ minWidth: 240 }}>
                  <Typography variant="subtitle1">Callback URL</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile?.merchant?.callback_url || 'No callback URL set'}
                  </Typography>
                </Stack>
                <Button size="small" variant="outlined" onClick={openCallback}>
                  Set Callback URL
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </MainCard>
      </Grid>

      <Dialog open={callbackOpen} onClose={() => setCallbackOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Merchant Callback URL</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {callbackError && <Alert severity="error">{callbackError}</Alert>}
            {callbackSuccess && <Alert severity="success">{callbackSuccess}</Alert>}
            <Typography variant="body2" color="text.secondary">
              All IPN callbacks for this merchant’s virtual accounts will be forwarded here.
            </Typography>
            <TextField
              label="Callback URL"
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              placeholder="https://example.com/ipn"
              helperText="Must start with http:// or https://"
              fullWidth
              disabled={callbackSaving}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCallbackOpen(false)} disabled={callbackSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveCallback} disabled={callbackSaving || !callbackUrl.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
