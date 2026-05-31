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

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

// ==============================|| SETTLEMENTS PAGE ||============================== //

export default function SettlementsPage() {
  const [settlements] = useState([]);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Settlements</Typography>
      </Grid>

      {/* Stats */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticEcommerce
          title="Total Settlements"
          count="0"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticEcommerce
          title="Pending"
          count="0"
          color="warning"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticEcommerce
          title="Completed"
          count="0"
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <AnalyticEcommerce
          title="Total Amount"
          count="$0"
        />
      </Grid>

      {/* Settlements Table */}
      <Grid size={12}>
        <MainCard title="Settlement History">
          {settlements.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No settlements found
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Settlement ID</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settlements.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell>#{settlement.id}</TableCell>
                    <TableCell align="right">{settlement.amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={settlement.status} size="small" />
                    </TableCell>
                    <TableCell>{settlement.date}</TableCell>
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

