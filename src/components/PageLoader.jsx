import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// ==============================|| PAGE LOADER - Centered spinner for page content ||============================== //

export default function PageLoader({ message, minHeight = 400 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: minHeight,
        gap: 2,
        py: 4
      }}
    >
      <CircularProgress
        size={44}
        thickness={4}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round'
          }
        }}
      />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}

PageLoader.propTypes = {
  message: PropTypes.string,
  minHeight: PropTypes.number
};
