import { useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

// assets
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';

// ==============================|| IDENTITY MANAGEMENT PAGE ||============================== //

export default function IdentityManagementPage() {
  const [verifications] = useState([]);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Identity Management</Typography>
      </Grid>

      {/* Stats */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticEcommerce
          title="Total Verifications"
          count="0"
          icon={<CheckCircleOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticEcommerce
          title="Verified"
          count="0"
          color="success"
          icon={<CheckCircleOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticEcommerce
          title="Pending"
          count="0"
          color="warning"
          icon={<ClockCircleOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticEcommerce
          title="Rejected"
          count="0"
          color="error"
          icon={<CloseCircleOutlined />}
        />
      </Grid>

      {/* Verification Requests */}
      <Grid size={12}>
        <MainCard title="Verification Requests">
          {verifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No verification requests
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {verifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{verification.userName}</Typography>
                    </TableCell>
                    <TableCell>{verification.documentType}</TableCell>
                    <TableCell>
                      <Chip 
                        label={verification.status} 
                        size="small" 
                        color={
                          verification.status === 'verified' ? 'success' : 
                          verification.status === 'pending' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>{verification.submittedDate}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined">
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}

