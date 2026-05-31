import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

export default function PortalProfilePage() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [copied, setCopied] = useState(false);

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
            </Stack>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
