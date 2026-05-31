import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

const titleByPath = {
  '/transactions/chargeback': 'Chargeback',
  '/transactions/payout-queue': 'Payout Queue Transactions',
  '/transactions/payout': 'Payout Transactions'
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const title = titleByPath[pathname] || 'Transactions';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <MainCard>
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            This section is under development. Use the main Transactions (Payin) page for now.
          </Typography>
        </Box>
      </MainCard>
    </Box>
  );
}
