import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import PageLoader from 'components/PageLoader';
import { useAuth } from 'contexts/AuthContext';

const bpsToPct = (bps) => `${(Number(bps || 0) / 100).toFixed(2)}%`;

// Inline editable cell for a single rate row
function RateCell({ rateBps, onSave, onDelete, hasOverride }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(rateBps ?? 0));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(Number(value));
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(String(rateBps ?? 0));
    setEditing(false);
  };

  if (editing) {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <TextField
          size="small"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputProps={{ min: 0, max: 10000 }}
          sx={{ width: 110 }}
          autoFocus
        />
        <IconButton size="small" onClick={handleSave} disabled={saving} color="primary">
          {saving ? <CircularProgress size={16} /> : <CheckOutlined />}
        </IconButton>
        <IconButton size="small" onClick={handleCancel} disabled={saving}>
          <CloseOutlined />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography variant="body2" sx={{ minWidth: 60 }}>
        {bpsToPct(rateBps)}
      </Typography>
      {hasOverride && (
        <Chip label="override" size="small" color="warning" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
      )}
      <Tooltip title="Edit rate">
        <IconButton size="small" onClick={() => { setValue(String(rateBps ?? 0)); setEditing(true); }}>
          <EditOutlined />
        </IconButton>
      </Tooltip>
      {hasOverride && onDelete && (
        <Tooltip title="Remove override (use global)">
          <IconButton size="small" onClick={onDelete} color="error">
            <DeleteOutlined />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

// Table showing rates for all transaction types
function RatesTable({ rows, onSaveGlobal, onSaveMerchant, onDeleteMerchant, showMerchant }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Transaction Type</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Global Rate</TableCell>
            {showMerchant && <TableCell sx={{ fontWeight: 600 }}>Merchant Rate</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.transaction_type} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.label}</Typography>
                <Typography variant="caption" color="text.secondary">{row.transaction_type}</Typography>
              </TableCell>
              <TableCell>
                <RateCell
                  rateBps={row.global_rate_bps ?? row.rate_bps ?? 0}
                  onSave={(bps) => onSaveGlobal(row.transaction_type, bps)}
                />
              </TableCell>
              {showMerchant && (
                <TableCell>
                  <RateCell
                    rateBps={row.effective_rate_bps ?? 0}
                    hasOverride={row.has_override}
                    onSave={(bps) => onSaveMerchant(row.transaction_type, bps)}
                    onDelete={() => onDeleteMerchant(row.transaction_type)}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ==============================|| RATES PAGE (ADMIN) ||============================== //

export default function RatesPage() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [globalRates, setGlobalRates] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [merchantRates, setMerchantRates] = useState([]);
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { severity, message }

  const showAlert = (severity, message) => {
    setAlert({ severity, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const loadGlobalRates = useCallback(async () => {
    const res = await api.get('/api/v1/admin/rates/global');
    setGlobalRates(res.data?.data?.rates ?? []);
  }, [api]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (user?.role === 'admin') {
          const [ratesRes, merchantsRes] = await Promise.all([
            api.get('/api/v1/admin/rates/global'),
            api.get('/api/v1/admin/merchants?limit=200'),
          ]);
          if (!mounted) return;
          setGlobalRates(ratesRes.data?.data?.rates ?? []);
          setMerchants(merchantsRes.data?.data ?? []);
        } else {
          // Merchant portal view
          const res = await api.get('/api/v1/portal/merchant/rates');
          if (!mounted) return;
          setGlobalRates(res.data?.data?.rates ?? []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [api, user?.role]);

  // Load merchant-specific rates when merchant selector changes
  useEffect(() => {
    if (!selectedMerchantId) { setMerchantRates([]); return; }
    let mounted = true;
    const load = async () => {
      setMerchantLoading(true);
      try {
        const res = await api.get(`/api/v1/admin/rates/merchants/${selectedMerchantId}`);
        if (mounted) setMerchantRates(res.data?.data?.rates ?? []);
      } finally {
        if (mounted) setMerchantLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [api, selectedMerchantId]);

  const handleSaveGlobal = async (txType, bps) => {
    try {
      await api.put('/api/v1/admin/rates/global', { transaction_type: txType, rate_bps: bps });
      await loadGlobalRates();
      // Refresh merchant rates too so they reflect new global
      if (selectedMerchantId) {
        const res = await api.get(`/api/v1/admin/rates/merchants/${selectedMerchantId}`);
        setMerchantRates(res.data?.data?.rates ?? []);
      }
      showAlert('success', 'Global rate updated');
    } catch (e) {
      showAlert('error', e?.response?.data?.message || 'Failed to update rate');
    }
  };

  const handleSaveMerchant = async (txType, bps) => {
    try {
      await api.put(`/api/v1/admin/rates/merchants/${selectedMerchantId}`, { transaction_type: txType, rate_bps: bps });
      const res = await api.get(`/api/v1/admin/rates/merchants/${selectedMerchantId}`);
      setMerchantRates(res.data?.data?.rates ?? []);
      showAlert('success', 'Merchant rate updated');
    } catch (e) {
      showAlert('error', e?.response?.data?.message || 'Failed to update merchant rate');
    }
  };

  const handleDeleteMerchant = async (txType) => {
    try {
      await api.delete(`/api/v1/admin/rates/merchants/${selectedMerchantId}/${txType}`);
      const res = await api.get(`/api/v1/admin/rates/merchants/${selectedMerchantId}`);
      setMerchantRates(res.data?.data?.rates ?? []);
      showAlert('success', 'Merchant override removed');
    } catch (e) {
      showAlert('error', e?.response?.data?.message || 'Failed to remove override');
    }
  };

  if (loading) return <PageLoader message="Loading rates..." minHeight={220} />;

  // ── Merchant portal view (read-only) ─────────────────────────────────────
  if (user?.role !== 'admin') {
    return (
      <Grid container rowSpacing={3} columnSpacing={2.75}>
        <Grid size={12}>
          <Typography variant="h4">Rates</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Your effective transaction fees per payment type.
          </Typography>
        </Grid>
        <Grid size={12}>
          <MainCard>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Transaction Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Global Default</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Your Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {globalRates.map((row) => (
                    <TableRow key={row.transaction_type} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.label}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{bpsToPct(row.global_rate_bps)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{bpsToPct(row.effective_rate_bps)}</Typography>
                          {row.has_override && (
                            <Chip label="custom" size="small" color="warning" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  // ── Admin view ────────────────────────────────────────────────────────────
  const selectedMerchantName = merchants.find((m) => m.id === selectedMerchantId)?.name ?? '';

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4">Rates</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Set transaction fees per payment type. Click the edit icon on any row to change a rate.
            </Typography>
          </Box>
        </Stack>
      </Grid>

      {alert && (
        <Grid size={12}>
          <Alert severity={alert.severity}>{alert.message}</Alert>
        </Grid>
      )}

      {/* Global rates table */}
      <Grid size={12}>
        <MainCard title="Global Rates">
          <RatesTable
            rows={globalRates}
            onSaveGlobal={handleSaveGlobal}
            showMerchant={false}
          />
        </MainCard>
      </Grid>

      <Grid size={12}>
        <Divider />
      </Grid>

      {/* Per-merchant overrides */}
      <Grid size={12}>
        <MainCard
          title="Per-Merchant Rate Overrides"
          secondary={
            <TextField
              select
              size="small"
              label="Merchant"
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value=""><em>Select merchant…</em></MenuItem>
              {merchants.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name} (#{m.id})
                </MenuItem>
              ))}
            </TextField>
          }
        >
          {!selectedMerchantId ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Select a merchant to view and edit their rate overrides.
            </Typography>
          ) : merchantLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Showing rates for <strong>{selectedMerchantName}</strong>. Rows marked{' '}
                <Chip label="override" size="small" color="warning" variant="outlined" sx={{ fontSize: 10, height: 18 }} />{' '}
                use a custom rate instead of the global default.
              </Typography>
              <RatesTable
                rows={merchantRates}
                onSaveGlobal={handleSaveGlobal}
                onSaveMerchant={handleSaveMerchant}
                onDeleteMerchant={handleDeleteMerchant}
                showMerchant
              />
            </>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
