import PropTypes from 'prop-types';
// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { NumericFormat } from 'react-number-format';

// project imports
import Dot from 'components/@extended/Dot';

function OrderStatus({ status }) {
  let color;
  let title;

  switch (status) {
    case 'PENDING':
      color = 'warning';
      title = 'Pending';
      break;
    case 'SUCCESS':
    case 'COMPLETE':
      color = 'success';
      title = 'Success';
      break;
    case 'FAILED':
      color = 'error';
      title = 'Failed';
      break;
    default:
      color = 'primary';
      title = status || 'Unknown';
  }

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <Dot color={color} />
      <Typography>{title}</Typography>
    </Stack>
  );
}

const headCells = [
  {
    id: 'tracking_no',
    align: 'left',
    disablePadding: false,
    label: 'Transaction ID'
  },
  {
    id: 'name',
    align: 'left',
    disablePadding: true,
    label: 'Type'
  },
  {
    id: 'fat',
    align: 'right',
    disablePadding: false,
    label: 'Amount'
  },
  {
    id: 'carbs',
    align: 'left',
    disablePadding: false,

    label: 'Status'
  },
  {
    id: 'protein',
    align: 'right',
    disablePadding: false,
    label: 'Total'
  }
];

// ==============================|| ORDER TABLE - HEADER ||============================== //

function OrderTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ==============================|| ORDER TABLE ||============================== //

export default function OrderTable({ transactions = [] }) {
  const order = 'asc';
  const orderBy = 'tracking_no';

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table aria-labelledby="tableTitle">
          <OrderTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No recent transactions
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.slice(0, 10).map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    tabIndex={-1}
                    key={row.id || index}
                  >
                    <TableCell component="th" id={labelId} scope="row">
                      <Link color="secondary">{row.external_id || row.id || 'N/A'}</Link>
                    </TableCell>
                    <TableCell>{row.source_of_funds || 'N/A'}</TableCell>
                    <TableCell align="right">{row.currency || 'USD'}</TableCell>
                    <TableCell>
                      <OrderStatus status={row.transaction_status || 'PENDING'} />
                    </TableCell>
                    <TableCell align="right">
                      <NumericFormat 
                        value={row.amount || 0} 
                        displayType="text" 
                        thousandSeparator 
                        prefix={row.currency === 'USD' ? '$' : ''} 
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

OrderTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };

OrderStatus.propTypes = { status: PropTypes.string };

OrderTable.propTypes = { transactions: PropTypes.array };
