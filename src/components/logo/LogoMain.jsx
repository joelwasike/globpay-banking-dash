// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// assets
import logo from '../../assets/images/logo.jpg';

// ==============================|| LOGO - GLOBPAY ||============================== //

export default function LogoMain() {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src={logo}
        alt="Globpay"
        sx={{
          height: 35,
          width: 35,
          borderRadius: 1
        }}
      />
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#00606c',
          fontSize: '1.25rem'
        }}
      >
        Globpay
      </Typography>
    </Box>
  );
}
