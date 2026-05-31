import React from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

// project import
import MainCard from 'components/MainCard';

export default function AcquirersPage() {
  const acquirers = [];

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Acquirers</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Overview of the payment acquirers connected to Globpay.
        </Typography>
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Available Acquirer Connections</Typography>
              <Typography variant="body2" color="text.secondary">
                These integrations power inbound and outbound payment flows. Status tracks the operational readiness of each
                connection.
              </Typography>
            </Box>

            {acquirers.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No acquirers available
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Acquirer</TableCell>
                      <TableCell>Coverage</TableCell>
                      <TableCell>Channels</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Contact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {acquirers.map((acquirer) => (
                      <TableRow key={acquirer.name} hover>
                        <TableCell>
                          <Typography variant="subtitle1">{acquirer.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {acquirer.coverage}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{acquirer.channels}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={acquirer.status}
                            color={acquirer.status === 'Live' ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{acquirer.contact}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}



