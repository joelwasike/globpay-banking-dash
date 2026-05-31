import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// assets
import logo from '../../assets/images/logo.jpg';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('merchant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(mode, email, password);
      
      if (result.success) {
        navigate('/overview');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        py: 12,
        px: 2
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 440,
          width: '100%',
          p: 4,
          borderRadius: 2
        }}
      >
        <Stack spacing={3}>
          {/* Logo and Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="Globpay Dashboard"
              sx={{
                height: 80,
                width: 80,
                borderRadius: 2,
                mx: 'auto',
                mb: 2
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
              Globpay Banking Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in as a merchant or admin
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, next) => next && setMode(next)}
                disabled={loading}
                fullWidth
              >
                <ToggleButton value="merchant">Merchant</ToggleButton>
                <ToggleButton value="admin">Admin</ToggleButton>
              </ToggleButtonGroup>

              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label={mode === 'admin' ? 'Admin Password' : 'Merchant Password'}
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.5
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Signing in...
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
