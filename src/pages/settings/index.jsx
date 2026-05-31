import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| SETTINGS PAGE ||============================== //

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [twoFA, setTwoFA] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Wire to API
    setTimeout(() => setSaving(false), 300);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!passwords.new || passwords.new !== passwords.confirm) return;
    setSaving(true);
    // TODO: Wire to API
    setTimeout(() => setSaving(false), 300);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Settings</Typography>
      </Grid>

      {/* Profile Settings */}
      <Grid size={12}>
        <MainCard title="Profile Settings">
          <form onSubmit={saveProfile}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" justifyContent="flex-end">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </MainCard>
      </Grid>

      {/* Security Settings */}
      <Grid size={12}>
        <MainCard title="Security Settings">
          <form onSubmit={changePassword}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" justifyContent="flex-end">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={saving}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>

          <Divider sx={{ my: 3 }} />

          <FormControlLabel
            control={
              <Switch
                checked={twoFA}
                onChange={(e) => setTwoFA(e.target.checked)}
              />
            }
            label="Enable Two-Factor Authentication"
          />
        </MainCard>
      </Grid>

      {/* Notification Settings */}
      <Grid size={12}>
        <MainCard title="Notification Settings">
          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Email notifications for transactions"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="SMS notifications for large transactions"
            />
            <FormControlLabel
              control={<Switch />}
              label="Marketing emails"
            />
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}

