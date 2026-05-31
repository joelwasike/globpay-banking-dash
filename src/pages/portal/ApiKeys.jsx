import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

export default function PortalApiKeysPage() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [keyInfo, setKeyInfo] = useState(null);
  const [rotatedKey, setRotatedKey] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const copyText = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const load = async () => {
    setError('');
    setRotatedKey('');
    setLoading(true);
    try {
      const res = await api.get('/api/v1/portal/merchant/api-keys');
      setKeyInfo(res.data?.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load API key info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'merchant') load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const rotate = async () => {
    setError('');
    setRotatedKey('');
    try {
      const res = await api.post('/api/v1/portal/merchant/api-keys/rotate');
      setRotatedKey(res.data?.data?.api_key || '');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to rotate API key');
    }
  };

  if (loading) return <PageLoader message="Loading API keys..." minHeight={220} />;

  if (user?.role !== 'merchant') {
    return (
      <MainCard>
        <Typography variant="body2" color="text.secondary">
          API keys are available for merchant accounts.
        </Typography>
      </MainCard>
    );
  }

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h4">API Keys</Typography>
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {copied && <Alert severity="success">Copied to clipboard</Alert>}
            {rotatedKey && (
              <Alert severity="success">
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    New API key (copy now — it won’t be shown again):
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {rotatedKey}
                  </Typography>
                  <Tooltip title="Copy API key">
                    <Button size="small" variant="outlined" onClick={() => copyText(rotatedKey)}>
                      Copy
                    </Button>
                  </Tooltip>
                </Stack>
              </Alert>
            )}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">API key hint/prefix: {keyInfo?.api_key_hint || '—'}</Typography>
              <Tooltip title="Copy hint">
                <Button size="small" variant="text" onClick={() => copyText(keyInfo?.api_key_hint || '')}>
                  Copy
                </Button>
              </Tooltip>
            </Stack>
            <Typography variant="body2">
              Last used:{' '}
              {keyInfo?.last_used_at ? new Date(keyInfo.last_used_at).toLocaleString() : '—'}
            </Typography>
            <Divider />
            <Button variant="contained" onClick={rotate}>
              Rotate API Key
            </Button>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
