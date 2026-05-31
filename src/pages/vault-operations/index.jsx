import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

// assets
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import UploadOutlined from '@ant-design/icons/UploadOutlined';

// ==============================|| VAULT OPERATIONS PAGE ||============================== //

export default function VaultOperationsPage() {
  const [vaultBalance] = useState(0);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Vault Operations</Typography>
      </Grid>

      {/* Stats */}
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticEcommerce
          title="Vault Balance"
          count={`$${vaultBalance.toLocaleString()}`}
          icon={<SafetyOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticEcommerce
          title="Total Deposits"
          count="$0"
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticEcommerce
          title="Total Withdrawals"
          count="$0"
          color="error"
        />
      </Grid>

      {/* Quick Actions */}
      <Grid size={12}>
        <MainCard title="Quick Actions">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <DownloadOutlined style={{ fontSize: 48, color: '#1976d2' }} />
                  <Typography variant="h6">Deposit to Vault</Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Transfer funds into your secure vault
                  </Typography>
                  <Button variant="contained" fullWidth>
                    Deposit
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <UploadOutlined style={{ fontSize: 48, color: '#d32f2f' }} />
                  <Typography variant="h6">Withdraw from Vault</Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Transfer funds from your vault
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Withdraw
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </MainCard>
      </Grid>

      {/* Recent Operations */}
      <Grid size={12}>
        <MainCard title="Recent Operations">
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No operations found
            </Typography>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

