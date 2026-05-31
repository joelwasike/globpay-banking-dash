// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', p: '24px 16px 0px', mt: 'auto' }}>
      <Typography variant="caption" color="text.secondary">
        &copy; 2025 Globpay. All rights reserved.
      </Typography>
    </Stack>
  );
}
