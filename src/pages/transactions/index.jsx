import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// material-ui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import PageLoader from 'components/PageLoader';
import ButtonGroup from '@mui/material/ButtonGroup';
import Pagination from '@mui/material/Pagination';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// project import
import MainCard from 'components/MainCard';
import { useAuth } from 'contexts/AuthContext';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import FilePdfOutlined from '@ant-design/icons/FilePdfOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| TRANSACTION ROW COMPONENT ||============================== //

// Function to get acquirer based on impalaMerchantId
const getAcquirer = (impalaMerchantId) => {
  if (!impalaMerchantId) return 'N/A';
  
  const merchantId = impalaMerchantId.toLowerCase();
  
  if (merchantId === 'transfi_production') {
    return 'MONREM-30142';
  } else if (merchantId === 'genio_staging') {
    return 'ORCHESTRATE-SPG';
  } else if (merchantId === 'kotani_production') {
    return 'MONREM-30102';
  } else if (merchantId === 'xora_pay_production') {
    return 'MONREM-30113';
  }
  
  return 'N/A';
};

const TransactionRow = memo(({ transaction, onViewDetails, getStatusChip, isAdmin }) => {
  return (
    <TableRow
      hover
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell>
        <Typography variant="subtitle2">
          {transaction.id}
        </Typography>
      </TableCell>
      {isAdmin && (
        <TableCell>
          <Typography
            variant="body2"
            sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={transaction.uuid || 'N/A'}
          >
            {transaction.uuid || 'N/A'}
          </Typography>
        </TableCell>
      )}
      <TableCell align="right">
        <Typography variant="subtitle2">
          {transaction.amount?.toLocaleString()} {transaction.currency}
        </Typography>
      </TableCell>
      <TableCell>
        {getStatusChip(transaction.transaction_status)}
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={transaction.impalaMerchantId || transaction.merchant_reference || 'N/A'}>
          {transaction.impalaMerchantId || transaction.merchant_reference || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={transaction.response_description || 'N/A'}>
          {transaction.response_description || 'N/A'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {transaction.date_added 
            ? format(new Date(transaction.date_added * 1000), 'MMM d, yyyy HH:mm')
            : 'N/A'}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Button
          variant="outlined"
          size="small"
          startIcon={<EyeOutlined />}
          onClick={() => onViewDetails(transaction)}
        >
          View More
        </Button>
      </TableCell>
    </TableRow>
  );
});

TransactionRow.displayName = 'TransactionRow';

// ==============================|| TRANSACTIONS PAGE ||============================== //

const VARIANT_TITLES = {
  payin: 'Transactions',
  refund: 'Refund',
  chargeback: 'Chargeback',
  'payout-queue': 'Payout Queue Transactions',
  payout: 'Payout Transactions',
  'apm-payins': 'APMs Payins',
  'apm-payouts': 'APMs Payouts'
};

export default function TransactionsPage() {
  const { pathname } = useLocation();
  const variant = pathname.endsWith('/apm-payouts') ? 'apm-payouts'
    : pathname.endsWith('/apm-payins') ? 'apm-payins'
    : pathname.endsWith('/refund') ? 'refund'
    : pathname.endsWith('/chargeback') ? 'chargeback'
    : pathname.endsWith('/payout-queue') ? 'payout-queue'
    : pathname.endsWith('/payout') ? 'payout'
    : 'payin';
  const pageTitle = VARIANT_TITLES[variant] || 'Transactions';

  const { api, user } = useAuth();
  const isAdmin = user?.roleID === 1;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uuidFilter, setUuidFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [merchantReferenceFilter, setMerchantReferenceFilter] = useState('all');
  const [acquirerFilter, setAcquirerFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [page, setPage] = useState(1); // API uses 1-based pagination
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [error, setError] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [debouncedUuidFilter, setDebouncedUuidFilter] = useState('');
  // Chargeback: manually added entries (transaction id, amount, merchant)
  const [addedChargebacks, setAddedChargebacks] = useState([]);
  const [addChargebackOpen, setAddChargebackOpen] = useState(false);
  const [chargebackForm, setChargebackForm] = useState({ transactionId: '', amount: '', merchantTransacted: '' });

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce UUID filter to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUuidFilter(uuidFilter);
    }, 500);

    return () => clearTimeout(timer);
  }, [uuidFilter]);
  
  // Reset to page 1 when debounced search term changes (but not on initial mount)
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedUuidFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasDateFilter = !!(dateFrom && dateTo);
  useEffect(() => {
    loadTransactions();
    // When date filter is on, page only changes table slice (client-side); do not refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, rowsPerPage, debouncedSearchTerm, debouncedUuidFilter, dateFrom, dateTo, ...(hasDateFilter ? [] : [page])]);

  const loadTransactions = async () => {
    // Only Payin has APIs; Refund, Chargeback, Payout Queue, Payout show empty list
    if (variant !== 'payin') {
      setLoading(false);
      setTransactions([]);
      setPagination({
        current_page: 1,
        per_page: rowsPerPage,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      });
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (abortController) {
        abortController.abort();
      }
      
      const controller = new AbortController();
      setAbortController(controller);
      
      const limit = Math.min(rowsPerPage, 100);
      const hasDateFilter = !!(dateFrom && dateTo);
      const dateFromUnix = dateFrom ? Math.floor(new Date(dateFrom).getTime() / 1000) : null;

      const timeoutPromise = (promise) =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
        });

      if (hasDateFilter) {
        // Load multiple pages (100 per page) until we've passed the date range, then filter client-side
        const endpoint = '/api/v1/merchants/transaction/list';
        const allTransactions = [];
        let pageNum = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await Promise.race([
            api.get(endpoint, {
              timeout: 25000,
              signal: controller.signal,
              params: { page: pageNum, limit: 100 }
            }),
            timeoutPromise()
          ]);

          let chunk = [];
          if (response.data?.transactions) chunk = response.data.transactions;
          else if (response.data?.Transactions) chunk = response.data.Transactions;

          allTransactions.push(...chunk);

          if (chunk.length < 100) {
            hasMore = false;
          } else if (dateFromUnix != null) {
            const oldestOnPage = chunk.reduce((min, t) => {
              const ts = t.date_added ?? t.date_added_unix ?? 0;
              return ts < min ? ts : min;
            }, Number.MAX_SAFE_INTEGER);
            if (oldestOnPage < dateFromUnix) hasMore = false;
          }

          pageNum += 1;
        }

        setTransactions(allTransactions);
        setPagination({
          current_page: 1,
          per_page: allTransactions.length,
          total: allTransactions.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        });
      } else {
        const qParts = [debouncedSearchTerm.trim(), debouncedUuidFilter.trim()].filter(Boolean);
        const q = qParts.join(' ').trim();

        const endpoint = q
          ? '/api/v1/merchants/transaction/search'
          : '/api/v1/merchants/transaction/list';
        const params = { page, limit };
        if (q) params.q = q;

        const response = await Promise.race([
          api.get(endpoint, { timeout: 25000, signal: controller.signal, params }),
          timeoutPromise()
        ]);

        let loadedTransactions = [];
        let paginationData = null;
        if (response.data) {
          if (response.data.transactions) loadedTransactions = response.data.transactions;
          else if (response.data.Transactions) loadedTransactions = response.data.Transactions;
          paginationData = response.data.pagination;
        }

        setTransactions(loadedTransactions);
        if (paginationData) {
          setPagination({
            current_page: paginationData.current_page || page,
            per_page: paginationData.per_page || limit,
            total: paginationData.total || 0,
            total_pages: paginationData.total_pages || 0,
            has_next: paginationData.has_next || false,
            has_prev: paginationData.has_prev || false
          });
        } else {
          setPagination({
            current_page: page,
            per_page: limit,
            total: loadedTransactions.length,
            total_pages: 1,
            has_next: false,
            has_prev: false
          });
        }
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      if (error.name === 'AbortError') {
        setError('Request cancelled by user.');
      } else if (error.message === 'Request timeout after 30 seconds') {
        setError('Request timed out. The server might be slow. Please try again.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (error.response?.status === 401) {
        setError('Unauthorized. Please check your authentication.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to load transactions. Please try again.');
      }
      setTransactions([]);
      setPagination({
        current_page: 1,
        per_page: rowsPerPage,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      });
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const getStatusChip = (status) => {
    const statusUpper = (status || '').toUpperCase();
    let color = 'default';
    let icon = <ClockCircleOutlined />;
    
    if (statusUpper === 'SUCCESS' || statusUpper === 'COMPLETED' || statusUpper === 'COMPLETE') {
      color = 'success';
      icon = <CheckCircleOutlined />;
    } else if (statusUpper === 'PENDING') {
      color = 'warning';
      icon = <ClockCircleOutlined />;
    } else if (statusUpper === 'FAILED') {
      color = 'error';
      icon = <CloseCircleOutlined />;
    } else if (statusUpper === 'CHARGEBACK') {
      color = 'error';
      icon = <CloseCircleOutlined />;
    }
    
    return (
      <Chip
        icon={icon}
        label={status}
        color={color}
        size="small"
        variant={color === 'success' ? 'filled' : 'outlined'}
      />
    );
  };

  // Source list for chargeback is manually added entries; for others, API transactions
  const transactionSourceList = variant === 'chargeback' ? addedChargebacks : transactions;

  // Get unique merchant references for filter dropdown
  const uniqueMerchantReferences = useMemo(() => {
    const refs = new Set();
    transactionSourceList.forEach(txn => {
      const ref = txn.impalaMerchantId || txn.merchant_reference;
      if (ref) {
        refs.add(ref);
      }
    });
    return Array.from(refs).sort();
  }, [transactionSourceList]);

  // Client-side filtered transactions (for status, date, merchant reference, acquirer filters)
  const filteredTransactions = useMemo(() => {
    return transactionSourceList.filter(transaction => {
      // Search is now handled server-side, so we skip client-side search filtering
      // when searchTerm is provided (the API already filtered the results)
      
      const status = (transaction.transaction_status || '').toUpperCase();
      const matchesStatus =
        statusFilter === 'all' ||
        status === statusFilter ||
        (statusFilter === 'SUCCESS' && (status === 'COMPLETED' || status === 'COMPLETE'));
      
      // Date & Time filtering
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const transactionDate = transaction.date_added 
          ? new Date(transaction.date_added * 1000)
          : null;
        
        if (transactionDate) {
          if (dateFrom) {
            const fromDate = new Date(dateFrom);
            if (transactionDate < fromDate) {
              matchesDate = false;
            }
          }
          if (dateTo) {
            const toDate = new Date(dateTo);
            if (transactionDate > toDate) {
              matchesDate = false;
            }
          }
        } else {
          matchesDate = false;
        }
      }
      
      // Merchant Reference filtering
      let matchesMerchantReference = true;
      if (merchantReferenceFilter !== 'all') {
        const merchantRef = transaction.impalaMerchantId || transaction.merchant_reference || '';
        matchesMerchantReference = merchantRef === merchantReferenceFilter;
      }
      
      // Acquirer filtering (only for admin)
      let matchesAcquirer = true;
      if (acquirerFilter !== 'all') {
        const transactionAcquirer = getAcquirer(transaction.impalaMerchantId || transaction.merchant_reference);
        matchesAcquirer = transactionAcquirer === acquirerFilter;
      }

      // UUID filtering (admin-only)
      let matchesUuid = true;
      const uuidTrimmed = (uuidFilter || '').trim();
      if (isAdmin && uuidTrimmed) {
        const txUuid = String(transaction.uuid || '').toLowerCase();
        matchesUuid = txUuid.includes(uuidTrimmed.toLowerCase());
      }
      
      return matchesStatus && matchesDate && matchesMerchantReference && matchesAcquirer && matchesUuid;
    });
  }, [transactionSourceList, statusFilter, dateFrom, dateTo, merchantReferenceFilter, acquirerFilter, uuidFilter, isAdmin]);

  // When date filter is on or chargeback (client-only list), paginate client-side
  const transactionsToDisplay = useMemo(() => {
    if (variant === 'chargeback' && filteredTransactions.length > 0) {
      const start = (page - 1) * rowsPerPage;
      return filteredTransactions.slice(start, start + rowsPerPage);
    }
    if (hasDateFilter && filteredTransactions.length > 0) {
      const start = (page - 1) * rowsPerPage;
      return filteredTransactions.slice(start, start + rowsPerPage);
    }
    return filteredTransactions;
  }, [variant, hasDateFilter, filteredTransactions, page, rowsPerPage]);
  const clientSideTotalPages = (variant === 'chargeback' || hasDateFilter)
    ? Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage))
    : pagination.total_pages || 1;

  // Reset page to 1 when filters change (except page and rowsPerPage which trigger reload)
  // Note: searchTerm is handled separately with debouncing
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [statusFilter, dateFrom, dateTo, merchantReferenceFilter, acquirerFilter, uuidFilter]);

  const handleViewDetails = useCallback((transaction) => {
    setSelectedTransaction(transaction);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTransaction(null);
  }, []);

  const downloadCSV = () => {
    // Build filename with filter info
    const filterParts = [];
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filterParts.push(`from_${format(fromDate, 'yyyy-MM-dd_HH-mm')}`);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      filterParts.push(`to_${format(toDate, 'yyyy-MM-dd_HH-mm')}`);
    }
    if (merchantReferenceFilter !== 'all') filterParts.push(`merchant_${merchantReferenceFilter.replace(/[^a-zA-Z0-9]/g, '_')}`);
    if (statusFilter !== 'all') filterParts.push(`status_${statusFilter}`);
    const filenameSuffix = filterParts.length > 0 ? `_${filterParts.join('_')}` : '';
    
    const header = [
      'Transaction ID',
      'UUID',
      'External ID',
      'Checkout Request ID',
      'Merchant Request ID',
      'Secure ID',
      'Amount',
      'Net Amount',
      'Currency',
      'Status',
      'Transaction Type',
      'Source of Funds',
      'Phone Number',
      'Email',
      'Merchant Reference',
      'Response Description',
      'Date Added'
    ];
    const dataRows = filteredTransactions.map(t => [
      t.id,
      t.uuid || '',
      t.external_id || '',
      t.checkout_request_id || '',
      t.merchant_request_id || '',
      t.secure_id || '',
      t.amount || '',
      t.net_amount || '',
      t.currency || '',
      t.transaction_status || '',
      t.transaction_report || '',
      t.source_of_funds || '',
      t.msisdn || '',
      t.email || '',
      (t.impalaMerchantId || t.merchant_reference || ''),
      t.response_description || '',
      t.date_added ? format(new Date(t.date_added * 1000), 'yyyy-MM-dd HH:mm:ss') : ''
    ]);
    const csv = [header, ...dataRows]
      .map(r => r.map(f => `"${String(f ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions${filenameSuffix}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    try {
      console.log('Starting PDF generation...', { filteredTransactions: filteredTransactions.length });
      
      const doc = new jsPDF('landscape'); // Use landscape for more columns
      
      // Add title
      doc.setFontSize(18);
      doc.text('Transaction Report', 14, 22);
      
      let yPos = 30;
      doc.setFontSize(10);
      
      // Add date range if filtered
      if (dateFrom || dateTo) {
        let dateRange = 'Period: ';
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          dateRange += `From ${format(fromDate, 'MMM d, yyyy HH:mm')} `;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          dateRange += `To ${format(toDate, 'MMM d, yyyy HH:mm')}`;
        }
        doc.text(dateRange, 14, yPos);
        yPos += 6;
      }
      
      // Add merchant reference filter if applied
      if (merchantReferenceFilter !== 'all') {
        doc.text(`Merchant Reference: ${merchantReferenceFilter}`, 14, yPos);
        yPos += 6;
      }
      
      // Add filter info
      const filterInfoParts = [];
      if (statusFilter !== 'all') filterInfoParts.push(`Status: ${statusFilter}`);
      const filterInfo = `Total Transactions: ${filteredTransactions.length}${filterInfoParts.length > 0 ? ' | ' + filterInfoParts.join(' | ') : ''}`;
      doc.text(filterInfo, 14, yPos);
      yPos += 6;
      
      // Prepare table data with all fields
      const tableData = filteredTransactions.map(t => [
        String(t.id || ''),
        String(t.uuid || 'N/A'),
        String(t.external_id || 'N/A'),
        String(t.checkout_request_id || 'N/A'),
        String(t.merchant_request_id || 'N/A'),
        String(t.secure_id || 'N/A'),
        String((t.amount || 0).toLocaleString()),
        String((t.net_amount || 0).toLocaleString()),
        String(t.currency || ''),
        String(t.transaction_status || ''),
        String(t.transaction_report || 'N/A'),
        String(t.source_of_funds || 'N/A'),
        String(t.msisdn || 'N/A'),
        String(t.email || 'N/A'),
        String(t.impalaMerchantId || t.merchant_reference || 'N/A'),
        t.date_added ? format(new Date(t.date_added * 1000), 'MMM d, yyyy HH:mm') : 'N/A'
      ]);
      
      console.log('Table data prepared:', tableData.length, 'rows');
      
      // Add table with all columns
      autoTable(doc, {
        startY: yPos + 4,
        head: [[
          'ID', 
          'UUID',
          'External ID', 
          'Checkout ID',
          'Merchant Req ID',
          'Secure ID',
          'Amount', 
          'Net Amount',
          'Currency', 
          'Status', 
          'Type',
          'Source',
          'Phone',
          'Email',
          'Merchant Ref',
          'Date'
        ]],
        body: tableData,
        styles: { fontSize: 7 }, // Smaller font for more columns
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 40 },
        columnStyles: {
          0: { cellWidth: 20 }, // ID
          1: { cellWidth: 28 }, // UUID
          2: { cellWidth: 25 }, // External ID
          3: { cellWidth: 25 }, // Checkout ID
          4: { cellWidth: 25 }, // Merchant Request ID
          5: { cellWidth: 25 }, // Secure ID
          6: { cellWidth: 20 }, // Amount
          7: { cellWidth: 20 }, // Net Amount
          8: { cellWidth: 15 }, // Currency
          9: { cellWidth: 20 }, // Status
          10: { cellWidth: 20 }, // Type
          11: { cellWidth: 20 }, // Source
          12: { cellWidth: 25 }, // Phone
          13: { cellWidth: 30 }, // Email
          14: { cellWidth: 25 }, // Merchant Ref
          15: { cellWidth: 25 }  // Date
        }
      });
      
      console.log('Table added, saving PDF...');
      
      // Build filename with filter info
      const filterParts = [];
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filterParts.push(`from_${format(fromDate, 'yyyy-MM-dd_HH-mm')}`);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        filterParts.push(`to_${format(toDate, 'yyyy-MM-dd_HH-mm')}`);
      }
      if (merchantReferenceFilter !== 'all') filterParts.push(`merchant_${merchantReferenceFilter.replace(/[^a-zA-Z0-9]/g, '_')}`);
      if (statusFilter !== 'all') filterParts.push(`status_${statusFilter}`);
      const filenameSuffix = filterParts.length > 0 ? `_${filterParts.join('_')}` : '';
      
      // Save the PDF
      doc.save(`transactions${filenameSuffix}_${Date.now()}.pdf`);
      
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <PageLoader message="Loading transactions..." minHeight={320} />
      </Box>
    );
  }

  const handleAddChargeback = () => {
    const { transactionId, amount, merchantTransacted } = chargebackForm;
    if (!transactionId?.trim()) return;
    const numAmount = parseFloat(amount) || 0;
    setAddedChargebacks(prev => [
      ...prev,
      {
        id: transactionId.trim(),
        amount: numAmount,
        currency: 'USD',
        transaction_status: 'CHARGEBACK',
        date_added: Math.floor(Date.now() / 1000),
        merchant_reference: merchantTransacted?.trim() || '',
        impalaMerchantId: merchantTransacted?.trim() || '',
        response_description: 'Added manually'
      }
    ]);
    setChargebackForm({ transactionId: '', amount: '', merchantTransacted: '' });
    setAddChargebackOpen(false);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Header */}
      <Grid size={12}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Typography variant="h5">{pageTitle}</Typography>
          {variant === 'chargeback' && (
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={() => setAddChargebackOpen(true)}
            >
              Add chargeback
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Filters */}
      <Grid size={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Search and Export */}
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    placeholder="Search by ID, amount, email, phone, status, merchant request ID, secure ID, or any field..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: <SearchOutlined style={{ marginRight: 8, color: '#999' }} />
                    }}
                  />
                  {searchTerm && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Searching server-side: Transaction ID, Amount, Email, Phone, Status, Merchant Request ID, Secure ID, Currency, Date, and more...
                    </Typography>
                  )}
                </Box>
                <ButtonGroup variant="contained" sx={{ minWidth: 180, flexShrink: 0 }}>
                  <Button startIcon={<DownloadOutlined />} onClick={downloadCSV}>CSV</Button>
                  <Button startIcon={<FilePdfOutlined />} onClick={downloadPDF}>PDF</Button>
                </ButtonGroup>
              </Stack>

              {isAdmin && (
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                  <TextField
                    label="UUID"
                    placeholder="Filter by UUID..."
                    value={uuidFilter}
                    onChange={(e) => setUuidFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 320 }}
                  />
                  {uuidFilter && (
                    <Button variant="outlined" size="small" onClick={() => setUuidFilter('')}>
                      Clear UUID
                    </Button>
                  )}
                </Stack>
              )}

              {/* Date & Time Filter */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Date & Time Range
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                  <TextField
                    type="datetime-local"
                    label="From Date & Time"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 220 }}
                  />
                  <TextField
                    type="datetime-local"
                    label="To Date & Time"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 220 }}
                  />
                  {(dateFrom || dateTo) && (
                    <Button variant="outlined" size="small" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                      Clear Dates
                    </Button>
                  )}
                  {(!dateFrom || !dateTo) && (
                    <Typography variant="caption" color="text.secondary">
                      Select both from and to to load all transactions in range
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Status, Merchant, Acquirer filters */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Filter by
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {pagination.total > 0 ? (
                      <>Total: {pagination.total} | Showing: {filteredTransactions.length} on this page</>
                    ) : (
                      <>Loaded: {transactions.length} | Filtered: {filteredTransactions.length}</>
                    )}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap" useFlexGap>
                  <TextField
                    select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="SUCCESS">Success</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="FAILED">Failed</MenuItem>
                    {variant === 'chargeback' && <MenuItem value="CHARGEBACK">Chargeback</MenuItem>}
                  </TextField>
                  <TextField
                    select
                    label="Merchant Reference"
                    value={merchantReferenceFilter}
                    onChange={(e) => setMerchantReferenceFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="all">All Merchants</MenuItem>
                    {uniqueMerchantReferences.map((ref) => (
                      <MenuItem key={ref} value={ref}>{ref}</MenuItem>
                    ))}
                  </TextField>
                  {isAdmin && (
                    <TextField
                      select
                      label="Acquirer"
                      value={acquirerFilter}
                      onChange={(e) => setAcquirerFilter(e.target.value)}
                      size="small"
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="all">All Acquirers</MenuItem>
                      <MenuItem value="MONREM-30142">MONREM-30142</MenuItem>
                      <MenuItem value="ORCHESTRATE-SPG">ORCHESTRATE-SPG</MenuItem>
                      <MenuItem value="MONREM-30102">MONREM-30102</MenuItem>
                      <MenuItem value="MONREM-30113">MONREM-30113</MenuItem>
                    </TextField>
                  )}
                  {(dateFrom ||
                    dateTo ||
                    merchantReferenceFilter !== 'all' ||
                    statusFilter !== 'all' ||
                    searchTerm ||
                    acquirerFilter !== 'all' ||
                    (isAdmin && uuidFilter)) && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setDateFrom('');
                        setDateTo('');
                        setMerchantReferenceFilter('all');
                        setStatusFilter('all');
                        setSearchTerm('');
                        setAcquirerFilter('all');
                        setUuidFilter('');
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      {/* Transactions Table */}
      <Grid size={12}>
        <MainCard
          title={
            hasDateFilter
              ? `Transaction History (${transactions.length} loaded, ${filteredTransactions.length} in date range — CSV/PDF export all ${filteredTransactions.length})`
              : `Transaction History (${pagination.total > 0 ? `${pagination.total} total` : 'Loading...'}, showing ${filteredTransactions.length} on this page${filteredTransactions.length !== transactions.length ? ` (${transactions.length} loaded, ${filteredTransactions.length} after filters)` : ''})`
          }
          content={false}
        >
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  {isAdmin && <TableCell>UUID</TableCell>}
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Merchant Reference</TableCell>
                  <TableCell>Response Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactionsToDisplay.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onViewDetails={handleViewDetails}
                    getStatusChip={getStatusChip}
                    isAdmin={isAdmin}
                  />
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Transaction Details Modal */}
          <Dialog
            open={!!selectedTransaction}
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Transaction Details
            </DialogTitle>
            <DialogContent dividers>
              {selectedTransaction && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Transaction ID
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.id}
                    </Typography>
                  </Grid>
                  {isAdmin && (
                    <Grid size={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        UUID
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedTransaction.uuid || 'N/A'}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      External ID
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.external_id || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Checkout Request ID
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.checkout_request_id || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Merchant Request ID
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.merchant_request_id || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Merchant Reference
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.impalaMerchantId || selectedTransaction.merchant_reference || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Secure ID
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.secure_id || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Amount
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                      {selectedTransaction.amount?.toLocaleString()} {selectedTransaction.currency}
                    </Typography>
                  </Grid>
                  {selectedTransaction.net_amount && (
                    <Grid size={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Net Amount
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedTransaction.net_amount?.toLocaleString()} {selectedTransaction.currency}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Transaction Type
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.transaction_report || 'Payment'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Source of Funds
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.source_of_funds || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {getStatusChip(selectedTransaction.transaction_status)}
                    </Box>
                  </Grid>
                  {selectedTransaction.msisdn && (
                    <Grid size={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Phone Number
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedTransaction.msisdn}
                      </Typography>
                    </Grid>
                  )}
                  {selectedTransaction.email && (
                    <Grid size={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedTransaction.email}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedTransaction.date_added 
                        ? format(new Date(selectedTransaction.date_added * 1000), 'MMM d, yyyy HH:mm:ss')
                        : 'N/A'}
                    </Typography>
                  </Grid>
                  {isAdmin && (
                    <Grid size={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Acquirer
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {getAcquirer(selectedTransaction.impalaMerchantId || selectedTransaction.merchant_reference)}
                      </Typography>
                    </Grid>
                  )}
                  {selectedTransaction.response_description && (
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Response Description
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedTransaction.response_description}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Add chargeback dialog (chargeback page only) */}
          <Dialog open={addChargebackOpen} onClose={() => setAddChargebackOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add chargeback</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  label="Transaction ID"
                  value={chargebackForm.transactionId}
                  onChange={(e) => setChargebackForm(prev => ({ ...prev, transactionId: e.target.value }))}
                  size="small"
                  fullWidth
                  required
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={chargebackForm.amount}
                  onChange={(e) => setChargebackForm(prev => ({ ...prev, amount: e.target.value }))}
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  label="Merchant transacted"
                  value={chargebackForm.merchantTransacted}
                  onChange={(e) => setChargebackForm(prev => ({ ...prev, merchantTransacted: e.target.value }))}
                  size="small"
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddChargebackOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAddChargeback} disabled={!chargebackForm.transactionId?.trim()}>
                Add chargeback
              </Button>
            </DialogActions>
          </Dialog>

          {error && (
            <Box sx={{ p: 3 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button variant="outlined" onClick={loadTransactions}>
                Retry Loading Transactions
              </Button>
            </Box>
          )}

          {filteredTransactions.length === 0 && !loading && !error && (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No transactions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          )}

          {/* Pagination Controls */}
          {(filteredTransactions.length > 0 || pagination.total > 0) && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {hasDateFilter ? (
                    filteredTransactions.length > 0 ? (
                      <>
                        Showing {((page - 1) * rowsPerPage) + 1} to{' '}
                        {Math.min(page * rowsPerPage, filteredTransactions.length)} of{' '}
                        {filteredTransactions.length} transactions (in date range)
                      </>
                    ) : (
                      'No transactions in date range'
                    )
                  ) : pagination.total > 0 ? (
                    <>
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                      {pagination.total} transactions
                      {filteredTransactions.length !== transactions.length && (
                        <> (Filtered: {filteredTransactions.length} of {transactions.length} on this page)</>
                      )}
                    </>
                  ) : (
                    'No transactions found'
                  )}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2">Rows per page:</Typography>
                  <TextField
                    select
                    size="small"
                    value={Math.min(rowsPerPage, 100)}
                    onChange={(e) => {
                      const newRowsPerPage = parseInt(e.target.value);
                      setRowsPerPage(newRowsPerPage);
                      setPage(1);
                    }}
                    sx={{ minWidth: 80 }}
                  >
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </TextField>
                  <Pagination
                    count={hasDateFilter ? clientSideTotalPages : (pagination.total_pages || 1)}
                    page={hasDateFilter ? page : (pagination.current_page || 1)}
                    onChange={(event, newPage) => setPage(newPage)}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                    disabled={loading}
                  />
                </Stack>
              </Stack>
            </Box>
          )}
        </MainCard>
      </Grid>

    </Grid>
  );
}
