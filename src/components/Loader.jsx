// material-ui
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// ==============================|| Loader - Top bar for layout / code-split ||============================== //

export default function Loader() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2001,
        overflow: 'hidden'
      }}
    >
      <LinearProgress
        color="primary"
        sx={{
          height: 3,
          '& .MuiLinearProgress-bar': {
            animationDuration: '1.5s'
          }
        }}
      />
    </Box>
  );
}
