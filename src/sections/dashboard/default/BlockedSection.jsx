import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

const DEFAULT_WPAY_API_BASE = 'https://api.globpay.ai';

const CRITERIA = [
  { value: 'email', label: 'Email' },
  { value: 'country', label: 'Country (ISO-3166 alpha-2)' },
  { value: 'phone', label: 'Phone (digits only)' },
  { value: 'card_bin', label: 'Card BIN (6–8 digits)' },
  { value: 'card_last4', label: 'Card last4 (4 digits)' },
  { value: 'ip_address', label: 'IP address' },
  { value: 'card_hash', label: 'Card hash / Card number' }
];

export default function BlockedSection({ api }) {
  const [criterion, setCriterion] = useState('email');
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const wpayApiBase = import.meta.env.VITE_WPAY_API_URL || DEFAULT_WPAY_API_BASE;
  const blocklistKeyFromEnv = import.meta.env.VITE_WPAY_BLOCKLIST_KEY || '';

  const canQuery = useMemo(() => value.trim().length > 0, [value]);

  const buildPayload = () => {
    const trimmed = value.trim();

    if (criterion !== 'card_hash') return { criterion, value: trimmed };

    // If the user pasted a PAN, send it as `card_number` so the server hashes it.
    const looksLikePan = /^\d{12,19}$/.test(trimmed);
    if (looksLikePan) return { criterion, card_number: trimmed };

    return { criterion, value: trimmed };
  };

  const fetchBlocked = async () => {
    setError('');
    setLoading(true);
    setResults([]);

    try {
      const bearerToken = localStorage.getItem('merchant_token') || '';
      const blocklistKey = blocklistKeyFromEnv || bearerToken;

      if (!blocklistKey) throw new Error('Missing blocklist key: set VITE_WPAY_BLOCKLIST_KEY or log in to obtain a bearer token.');

      const resp = await api.post(
        `${wpayApiBase}/api/v1/wpayment/blocks`,
        buildPayload(),
        {
          headers: { 'X-WPay-Blocklist-Key': blocklistKey }
        }
      );

      const data = resp?.data;
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load blocked list.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5">Blocked</Typography>
        <Typography variant="caption" color="text.secondary">
          Source: WPAY blocklist
        </Typography>
      </Stack>

      {!blocklistKeyFromEnv && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This uses your login Bearer token by default; optionally set <code>VITE_WPAY_BLOCKLIST_KEY</code> to override.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Criterion"
            value={criterion}
            onChange={(e) => setCriterion(e.target.value)}
          >
            {CRITERIA.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label={criterion === 'card_hash' ? 'Card number or SHA-256 hash' : 'Value'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={criterion === 'country' ? 'US' : criterion === 'email' ? 'name@example.com' : ''}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={!canQuery || loading}
            onClick={fetchBlocked}
          >
            {loading ? 'Checking…' : 'Check'}
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small" aria-label="blocked table">
            <TableHead>
              <TableRow>
                <TableCell>Criterion</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {loading ? 'Loading…' : 'No results'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((row, idx) => (
                  <TableRow key={`${row.criterion || 'row'}-${row.value || idx}`} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>{row.criterion || '—'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{row.value || '—'}</TableCell>
                    <TableCell>{row.note || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainCard>
  );
}
