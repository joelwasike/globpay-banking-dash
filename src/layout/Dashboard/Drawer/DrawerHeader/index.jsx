import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

// project imports
import DrawerHeaderStyled from './DrawerHeaderStyled';
import { APP_DEFAULT_PATH } from 'config';

// assets
import logoHorizontal from 'assets/images/globpay horizontal@2x.png';

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  return (
    <DrawerHeaderStyled
      open={open}
      sx={{
        minHeight: '60px',
        width: 'initial',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: open ? '24px' : 0
      }}
    >
      <ButtonBase disableRipple component={Link} to={APP_DEFAULT_PATH} sx={{ display: 'block', width: '100%' }}>
        <Box
          component="img"
          src={logoHorizontal}
          alt="Globpay"
          sx={{
            height: 36,
            width: open ? 'auto' : 36,
            maxWidth: open ? 160 : 36,
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </ButtonBase>
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
