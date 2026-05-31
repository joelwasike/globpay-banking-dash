// material-ui
import Box from '@mui/material/Box';

// assets
import logo from '../../assets/images/logo.jpg';

// ==============================|| LOGO ICON - GLOBPAY ||============================== //

export default function LogoIcon() {
  return (
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
  );
}
