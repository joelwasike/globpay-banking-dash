import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import MainCard from 'components/MainCard';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';

// PayToro-style Refund Transactions page
export default function RefundPage() {
  const [dateRange, setDateRange] = useState('05-Mar-2026 00:00:00 - 05-Mar-2026 23:59:59');
  const [subMerchant, setSubMerchant] = useState('Liberec_Gaming_2D-S');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Refund Transactions</Typography>
        <Typography variant="body2" color="text.secondary">
          Transactions &gt; Refund
        </Typography>
      </Stack>

      <MainCard sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Filter
        </Typography>
        <Stack direction="row" flexWrap="wrap" spacing={2} alignItems="center">
          <TextField
            size="small"
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ minWidth: 280 }}
          />
          <TextField
            select
            size="small"
            label="Sub Merchant"
            value={subMerchant}
            onChange={(e) => setSubMerchant(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="Liberec_Gaming_2D-S">Liberec_Gaming_2D-S</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Status"
            placeholder="CAPTURED, AWAITING, FAILED"
            sx={{ minWidth: 200 }}
          />
          <TextField
            size="small"
            label="Currency"
            placeholder="AED - AED, AUD, EUR"
            sx={{ minWidth: 200 }}
          />
          <TextField select size="small" label="Custom Search By" defaultValue="payin_id" sx={{ minWidth: 160 }}>
            <MenuItem value="payin_id">By Payin Id</MenuItem>
          </TextField>
          <TextField size="small" label="Custom Search Value" placeholder="" sx={{ minWidth: 160 }} />
          <Button variant="contained" startIcon={<SearchOutlined />}>
            Search
          </Button>
          <Button variant="outlined" startIcon={<DownloadOutlined />}>
            Download
          </Button>
        </Stack>
      </MainCard>

      <MainCard>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <TextField
            select
            size="small"
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value={10}>10 entries per page</MenuItem>
            <MenuItem value={25}>25 entries per page</MenuItem>
            <MenuItem value={50}>50 entries per page</MenuItem>
            <MenuItem value={100}>100 entries per page</MenuItem>
          </TextField>
          <TextField size="small" label="Search:" placeholder="" sx={{ minWidth: 200 }} />
        </Stack>
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payin Id</TableCell>
                <TableCell>Refund Id</TableCell>
                <TableCell>Refund Status</TableCell>
                <TableCell>Refund Create Date</TableCell>
                <TableCell>Refund Update Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Sub Merchant</TableCell>
                <TableCell>Response Message</TableCell>
                <TableCell>RRN</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No data available in table</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing 0 to 0 of 0 entries
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Button size="small" disabled>
              &laquo;
            </Button>
            <Button size="small" disabled>
              &lsaquo;
            </Button>
            <Button size="small" disabled>
              &rsaquo;
            </Button>
            <Button size="small" disabled>
              &raquo;
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </Box>
  );
}
