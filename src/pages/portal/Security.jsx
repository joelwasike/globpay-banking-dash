import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';

export default function PortalSecurityPage() {
  const { api, user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/api/v1/portal/merchant/password', { old_password: oldPassword, new_password: newPassword });
      setOldPassword('');
      setNewPassword('');
      setSuccess('Password updated');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'merchant') {
    return (
      <MainCard>
        <Typography variant="body2" color="text.secondary">
          Security settings are available for merchant accounts.
        </Typography>
      </MainCard>
    );
  }

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h4">Security</Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard>
          <Stack component="form" spacing={2} onSubmit={changePassword}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Change Password</Typography>
              <Chip size="small" label="Merchant Portal" variant="outlined" />
            </Stack>
            <Divider />
            <TextField
              type="password"
              label="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={saving}
            />
            <TextField
              type="password"
              label="New Password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={saving}
            />
            <Button type="submit" variant="contained" disabled={saving}>
              Update Password
            </Button>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
