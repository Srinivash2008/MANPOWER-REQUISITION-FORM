import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  ThemeProvider,
  createTheme,
  useTheme,
  CssBaseline,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingIcon from '@mui/icons-material/Pending';
import DraftsIcon from '@mui/icons-material/Drafts';
import UndoIcon from '@mui/icons-material/Undo';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMFRCounts, fetchManpowerRequisitionByuserId, fetchManpowerRequisitionFH } from '../redux/cases/manpowerrequisitionSlice';

import AdminDashboard from './AdminDashboard';
import FHDashboard from './FHDashboard';

// --- Custom Theme Definition for Aesthetic Light Mode ---
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2A7F66', // Dark accent green from Login page
      light: '#559985',
      dark: '#1D5947',
    },
    secondary: {
      main: '#F2994A', // A complementary warm amber/orange
    },
    tertitary: {
      main: '#BFA2DB', // Soft lavender complementing tertitary purple
      light: '#D8CBF8',
    },
    background: {
      default: '#F3FAF8', // Light green background from Login page
      paper: 'rgba(255, 255, 255, 0.85)', // Slightly more opaque for better readability
    },
    success: {
      main: '#34D399', // A vibrant, modern green
      light: '#6EE7B7',
    },
    error: {
      main: '#DC3545', // Consistent with Login page
      light: '#E4606D',
    },
    warning: {
      main: '#F59E0B', // A rich, golden amber
      light: '#FBBF24',
    },
    info: {
      main: '#3B82F6', // A clear, friendly blue
      light: '#60A5FA',
    },
    text: {
      primary: '#1F2937', // Dark gray for high contrast
      secondary: '#4B5563', // Softer gray for secondary text
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
    },
    h5: {
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Slightly reduced for a sharper look
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

// --- Main Dashboard Component ---
const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mfrCounts } = useSelector((state) => state.manpowerRequisition);
  const manpowerRequisitionList = useSelector((state) => state.manpowerRequisition.data) || [];
  const manpowerRequisitionFHList = useSelector((state) => state.manpowerRequisition.selectedRequisitionFH) || [];
  const [managerFilter, setManagerFilter] = useState('');
  const [fhChartFilter, setFhChartFilter] = useState('overall');
  
  console.log("MFR Counts from Redux:", mfrCounts);
  
  useEffect(() => {
    if (user?.emp_id) {
      dispatch(getMFRCounts(user.emp_id));

      if (user?.emp_id === '1400' || user?.emp_id === '1722') {
        dispatch(fetchManpowerRequisitionByuserId(user.emp_id));
        dispatch(fetchManpowerRequisitionFH());
      }
    }
  }, [dispatch, user?.emp_id]);

  // --- Data Filtering & Calculation ---

  // Filter out "Je. Rajesh" from the list of managers
  const activeFhList = manpowerRequisitionFHList.filter(fh => fh.ReportingManager !== 'Je. Rajesh');

  // Determine the list of MRFs to be displayed based on the manager filter
  const displayedMrfList = (() => {
    if (managerFilter) {
      const selectedManager = activeFhList.find(fh => fh.ReportingManager === managerFilter);
      if (selectedManager) {
        return manpowerRequisitionList.filter(mrf => String(mrf.created_by) === String(selectedManager.employee_id));
      }
    }
    return manpowerRequisitionList; // Return all MRFs if no filter is active
  })();

  // Convert string values to numbers and calculate dynamic values
  const baseCounts = {
    pending: parseInt(mfrCounts?.overall?.pending_count) || 0,
    approved: parseInt(mfrCounts?.overall?.approve_count) || 0,
    hrApproved: parseInt(mfrCounts?.overall?.HR_Approve_count) || 0, // Already HR specific
    approved: parseInt(mfrCounts?.overall?.approve_count) || 0, // This now includes both Director and HR Approved
    rejected: parseInt(mfrCounts?.overall?.reject_count) || 0,
    directorRaiseQuery: parseInt(mfrCounts?.overall?.director_raise_query_count) || 0,
    hrRaiseQuery: parseInt(mfrCounts?.overall?.hr_raise_query_count) || 0,
    onHold: parseInt(mfrCounts?.overall?.on_hold_count) || 0,
    draft: parseInt(mfrCounts?.overall?.draft_count) || 0,
    withdraw: parseInt(mfrCounts?.overall?.withdraw_count) || 0,
    total: parseInt(mfrCounts?.overall?.total_count) || 0
  };

  // Recalculate counts based on the displayed (filtered) MRF list
  const counts = {
    pending: displayedMrfList.filter(m => m.status === 'Pending').length,
    approved: displayedMrfList.filter(m => m.status === 'Approve').length,
    hrApproved: displayedMrfList.filter(m => m.status === 'HR Approve').length,
    approved: displayedMrfList.filter(m => m.status === 'Approve' || m.status === 'HR Approve').length,
    rejected: displayedMrfList.filter(m => m.status === 'Reject').length,
    onHold: displayedMrfList.filter(m => m.status === 'On Hold').length,
    // For query counts, we fall back to the overall counts if no manager is selected, as this breakdown isn't per-MRF
    directorRaiseQuery: managerFilter ? 0 : baseCounts.directorRaiseQuery,
    hrRaiseQuery: managerFilter ? 0 : baseCounts.hrRaiseQuery,
    draft: displayedMrfList.filter(m => m.status === 'Draft').length,
    withdraw: displayedMrfList.filter(m => m.status === 'Withdraw').length,
    total: displayedMrfList.length,
  };
  const dirCounts = {
    pending: parseInt(mfrCounts?.director_status?.pending_count) || 0,
    approved: parseInt(mfrCounts?.director_status?.approve_count) || 0,
    rejected: parseInt(mfrCounts?.director_status?.reject_count) || 0,
    raiseQuery: parseInt(mfrCounts?.director_status?.raise_query_count) || 0,
    onHold: parseInt(mfrCounts?.director_status?.on_hold_count) || 0
  };

  // Dynamic status metrics based on API data - Now with 5 cards
  let statusMetrics = [
    {
      status: 'Pending',
      count: counts.pending,
      icon: (props) => <PendingIcon {...props} />,
      color: 'secondary',
      description: 'Requisitions awaiting initial review.',
    },
    {
      status: 'Approved',
      count: counts.approved, // This will be the director approved
      icon: (props) => <TrendingUpIcon {...props} />,
      color: 'success',
      description: 'Requisitions ready for recruitment.',
    },
    {
      status: 'HR Approved',
      count: counts.hrApproved,
      icon: (props) => <TrendingUpIcon {...props} />,
      color: 'success',
      description: 'Requisitions ready for recruitment.',
    },
    {
      status: 'On-Hold',
      count: counts.onHold,
      icon: (props) => <AccessTimeIcon {...props} />,
      color: 'tertitary',
      description: 'Awaiting primary manager approval.',
    },
    {
      status: 'Query by Director',
      count: counts.directorRaiseQuery,
      icon: (props) => <ErrorOutlineIcon {...props} />,
      color: 'info',
      description: 'Awaiting final HR/Budget sign-off.',
    },
    {
      status: 'Query by HR',
      count: counts.hrRaiseQuery,
      icon: (props) => <ErrorOutlineIcon {...props} />,
      color: 'info',
      description: 'Awaiting final HR/Budget sign-off.',
    },
    {
      status: 'Rejected',
      count: counts.rejected,
      icon: (props) => <CloseIcon {...props} />,
      color: 'error',
      description: 'Requisitions withdrawn or denied.',
    },
    {
      status: 'Withdraw',
      count: counts.withdraw,
      icon: (props) => <UndoIcon {...props} />,
      color: 'warning',
      description: 'Requisitions withdrawn by the user.',
    },
    {
      status: 'Draft',
      count: counts.draft,
      icon: (props) => <DraftsIcon {...props} />,
      color: 'info',
      description: 'Requisitions saved as draft.',
    },
  ];

  const dirStatusMetrics = [
    { status: 'Approved by Rajesh', count: dirCounts.approved, icon: (props) => <TrendingUpIcon {...props} />, color: 'success' },
    { status: 'Rejected by Rajesh', count: dirCounts.rejected, icon: (props) => <CloseIcon {...props} />, color: 'error' },
    { status: 'Query by Rajesh', count: dirCounts.raiseQuery, icon: (props) => <ErrorOutlineIcon {...props} />, color: 'info' },
    { status: 'On-Hold by Rajesh', count: dirCounts.onHold, icon: (props) => <AccessTimeIcon {...props} />, color: 'tertitary' },
  ];

  const hrCounts = {
    pending: parseInt(mfrCounts?.hr_status?.pending_count) || 0,
    approved: parseInt(mfrCounts?.hr_status?.approve_count) || 0,
    rejected: parseInt(mfrCounts?.hr_status?.reject_count) || 0,
    raiseQuery: parseInt(mfrCounts?.hr_status?.raise_query_count) || 0,
    onHold: parseInt(mfrCounts?.hr_status?.on_hold_count) || 0,
  };

  const hrStatusMetrics = [
    { status: 'Approved by Selvi', count: hrCounts.approved, icon: (props) => <TrendingUpIcon {...props} />, color: 'success' },
    { status: 'Rejected by Selvi', count: hrCounts.rejected, icon: (props) => <CloseIcon {...props} />, color: 'error' },
    { status: 'Query by Selvi', count: hrCounts.raiseQuery, icon: (props) => <ErrorOutlineIcon {...props} />, color: 'info' }, //NOSONAR
    { status: 'On-Hold by Selvi', count: hrCounts.onHold, icon: (props) => <AccessTimeIcon {...props} />, color: 'tertitary' },
  ];

  const overallStatusMetrics = [
    { status: 'Pending', count: baseCounts.pending, icon: (props) => <PendingIcon {...props} />, color: 'secondary' },
    { status: 'Approved', count: baseCounts.approved, icon: (props) => <TrendingUpIcon {...props} />, color: 'success' },
    { status: 'Rejected', count: baseCounts.rejected, icon: (props) => <CloseIcon {...props} />, color: 'error' },
    { status: 'On Hold', count: baseCounts.onHold, icon: (props) => <AccessTimeIcon {...props} />, color: 'tertitary' },
  ];


  if (user?.emp_id === '1400' || user?.emp_id === '1722') {
    statusMetrics = statusMetrics.filter(metric => metric.status !== 'Withdraw' && metric.status !== 'Draft');
  }

  const managerStatusCounts = activeFhList.map(fh => {
    const managerMrfs = manpowerRequisitionList.filter(mrf => String(mrf.created_by) === String(fh.employee_id));

    return {
      name: fh.ReportingManager,
      employee_id: fh.employee_id,
      counts: {
        Pending: managerMrfs.filter(m => m.status === 'Pending').length,
        Approved: managerMrfs.filter(m => m.status === 'Approve').length,
        HR_Approve: managerMrfs.filter(m => m.status === 'HR Approve').length,
        Rejected: managerMrfs.filter(m => m.status === 'Reject').length,
        On_Hold: managerMrfs.filter(m => m.status === 'On Hold').length,
      },
      total: managerMrfs.length
    };
  }).filter(manager => manager.name && manager.name.toLowerCase().includes(managerFilter.toLowerCase()));

  const managerOptions = activeFhList.map(fh => fh.ReportingManager).filter(Boolean);

  // --- Data for FHDashboard (using baseCounts) ---
  const fhPendingStatuses = [
    { status: 'Pending', count: baseCounts.pending, color: 'secondary' },
    { status: 'On Hold', count: baseCounts.onHold, color: 'tertitary' },
    { status: 'Query by Director', count: baseCounts.directorRaiseQuery, color: 'info' },
    { status: 'Query by HR', count: baseCounts.hrRaiseQuery, color: 'info' },
    { status: 'Draft', count: baseCounts.draft, color: 'default' }
  ].filter(m => m.count > 0);
  const fhTotalPending = fhPendingStatuses.reduce((sum, metric) => sum + metric.count, 0);

  // --- Data for AdminDashboard (using filtered counts) ---
  const adminPendingStatuses = statusMetrics.filter(m =>
    m.status === 'Pending' || m.status === 'On-Hold' || m.status.startsWith('Query by'));
  const adminTotalPending = adminPendingStatuses.reduce((sum, metric) => sum + metric.count, 0);
  const totalApproved = counts.approved; // This is already combined Director + HR from the counts object

  // --- Pie Chart Data ---
  // For FH, use base counts. For Admin, use filtered counts.
  const isFHDashboard = !(user?.emp_id === '1400' || user?.emp_id === '1722');
  const pieChartTotalApproved = isFHDashboard ? baseCounts.approved : totalApproved;
  const pieChartTotalPending = isFHDashboard ? fhTotalPending : adminTotalPending;
  const pieChartTotalRejected = isFHDashboard ? baseCounts.rejected : counts.rejected;
  const pieData = [
    { id: 0, value: pieChartTotalApproved, label: 'Approved', color: theme.palette.success.main },
    { id: 1, value: pieChartTotalPending, label: 'Pending', color: theme.palette.secondary.main },
    { id: 2, value: pieChartTotalRejected, label: 'Rejected', color: theme.palette.error.main },
  ];

  const totalForPie = pieData.reduce((sum, item) => sum + item.value, 0);

  const pieSeries = {
    data: pieData,
    innerRadius: 70,
    outerRadius: 100,
    paddingAngle: 2,
    cornerRadius: 5,
    startAngle: -90,
    endAngle: 90,
    cy: '80%',
  };

  // Calculate Approval Rate
  // Combine all data for the new comprehensive chart
  const comprehensiveData = (() => {
    if (user?.emp_id === '1400' || user?.emp_id === '1722') {
      return [...statusMetrics].sort((a, b) => b.count - a.count);
    }

    switch (fhChartFilter) {
      case 'director':
        return [...dirStatusMetrics].sort((a, b) => b.count - a.count);
      case 'hr':
        return [...hrStatusMetrics].sort((a, b) => b.count - a.count);
      case 'overall':
        const pendingOverall = overallStatusMetrics.find(m => m.status === 'Pending');
        let combinedData = [];
        if (pendingOverall) {
          combinedData.push({ ...pendingOverall, status: 'Overall Pending' });
        }
        combinedData = combinedData.concat(dirStatusMetrics.map(m => ({ ...m, status: `Director ${m.status}` })));
        combinedData = combinedData.concat(hrStatusMetrics.map(m => ({ ...m, status: `HR ${m.status}` })));
        return combinedData.sort((a, b) => b.count - a.count);
      default: // 'overall'
        return [...overallStatusMetrics].sort((a, b) => b.count - a.count);
    }
  })();

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // Adjust for header height if any
        background: `radial-gradient(circle at top left, #F3FAF8, #e9f5f2 100%)`,
        p: { xs: 2, sm: 3, md: 4, lg: 8 },
        color: theme.palette.text.primary,
        transition: 'all 0.3s ease',
      }}
    >
      <Box mb={{ xs: 3, sm: 4, md: 5 }} mt={{ xs: 10, sm: 10, md: 5, lg: 9 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>

        <Typography
          variant="h4"
          fontWeight={900}
          color="text.primary"
          mt={{ xs: 1, sm: 2 }}
          sx={{
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem', lg: '2rem' },
            textShadow: '1px 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          Welcome back, {user?.emp_name || 'User'}!
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          color="text.primary"
          mt={{ xs: 1.5, sm: 2, md: 2.5, lg: 2 }}
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' }
          }}
        >
          Real-time overview of current Manpower Requisition status.

        </Typography>
      </Box>

      {/* Main Grid Layout */}
      {user?.emp_id === '1400' || user?.emp_id === '1722' ? (
        <AdminDashboard
          counts={counts}
          pieSeries={pieSeries}
          totalForPie={totalForPie}
          pendingStatuses={adminPendingStatuses}
          totalPending={adminTotalPending}
          comprehensiveData={comprehensiveData}
          managerStatusCounts={managerStatusCounts}
          managerOptions={managerOptions}
          managerFilter={managerFilter}
          setManagerFilter={setManagerFilter}
        />
      ) : (
        <FHDashboard
          counts={counts}
          pieSeries={pieSeries}
          totalForPie={totalForPie}
          pendingStatuses={fhPendingStatuses}
          statusMetrics={statusMetrics}
          totalPending={fhTotalPending}
          comprehensiveData={comprehensiveData}
          fhChartFilter={fhChartFilter}
          setFhChartFilter={setFhChartFilter}
          dirStatusMetrics={dirStatusMetrics}
          hrStatusMetrics={hrStatusMetrics}
        />
      )}
    </Box>
  );
};

// --- App Wrapper to provide Theme Context ---
const AppWrapper = () => (
  <ThemeProvider theme={lightTheme}>
    <CssBaseline />
    <Dashboard />
  </ThemeProvider>
);

export default AppWrapper;