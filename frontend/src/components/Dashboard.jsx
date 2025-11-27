import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  useTheme,
  CssBaseline,
} from '@mui/material';
// Icons - Direct imports for use in the component
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingIcon from '@mui/icons-material/Pending';
// New icon for the summary section
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useDispatch, useSelector } from 'react-redux';
import { getMFRCounts } from '../redux/cases/manpowerrequisitionSlice';

// --- Custom Theme Definition for Aesthetic Light Mode ---
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5', // Indigo
    },
    secondary: {
      main: '#EC4899', // Pink
    },
    background: {
      default: '#f8f9fa',
      paper: 'rgba(255, 255, 255, 0.7)',
    },
    success: {
      main: '#00BFA5', // Teal
      light: '#4dccb2',
    },
    error: {
      main: '#FF5252', // Red
      light: '#ff7070',
    },
    warning: {
      main: '#FFC107', // Gold/Amber
      light: '#ffcd38',
    },
    info: {
      main: '#2979FF', // Light Blue
      light: '#539eff',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
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
          borderRadius: 20,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// --- Status Card Component ---
const StatusCard = ({ status, count, icon: Icon, color, description, total }) => {
  const theme = useTheme();
  const percentage = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
  const progressLabel = "Requisition Share";
  const paletteColor = theme.palette[color];

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
        borderRadius: 6, // Slightly more rounded corners
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        bgcolor: 'rgba(255, 255, 255, 0.65)', // More translucent
        border: `1px solid ${paletteColor.main}20`,
        height: '100%',
        minHeight: { xs: 170, sm: 180, md: 200, lg: 210 }, // Made smaller
        transition: 'all 0.3s ease-in-out',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          transform: 'translateY(-7px) scale(1.03)',
          boxShadow: `0 15px 45px rgba(0, 0, 0, 0.2), 0 0 30px ${paletteColor.main}50`,
          borderColor: paletteColor.main,
        },
      }}
    >
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flex="0 0 auto">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              letterSpacing={1.5}
              textTransform="uppercase"
              sx={{
                color: paletteColor.main,
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem', lg: '0.8rem' }
              }}
            >
              {status}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              mt={0.5}
              display="block"
              sx={{
                fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.65rem', lg: '0.7rem' },
                lineHeight: 1.2
              }}
            >
              {description}
            </Typography>
          </Box>

          <Box
            sx={{
              p: { xs: 0.7, sm: 0.8, md: 0.9, lg: 1 },
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${paletteColor.light || paletteColor.main}, ${paletteColor.main})`,
              color: theme.palette.common.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 20px ${paletteColor.main}80`,
              flexShrink: 0,
              ml: 1
            }}
          >
            <Icon sx={{
              width: { xs: 18, sm: 20, md: 22, lg: 25 },
              height: { xs: 18, sm: 20, md: 22, lg: 25 }
            }} />
          </Box>
        </Box>

        <Box mt={2} flex="1 0 auto" sx={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Gradient Glow Effect */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '120%',
            background: `radial-gradient(circle, ${paletteColor.main}1A 0%, transparent 60%)`,
            filter: 'blur(20px)',
            zIndex: 0,
          }} />
          <Typography
            variant="h3"
            fontWeight={900}
            color="text.primary"
            sx={{
              fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem', lg: '2.8rem' },
              lineHeight: 1.1,
              zIndex: 1,
            }}
          >
            {count.toLocaleString()}
          </Typography>
          <Typography
            variant="body2"
            color={paletteColor.main}
            fontWeight={600}
            sx={{
              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem', lg: '0.8rem' }
            }}
          >
            Total: {total.toLocaleString()}
          </Typography>
        </Box>

        <Box mt={2} flex="0 0 auto">
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={600}
              sx={{
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem', lg: '0.8rem' }
              }}
            >
              {progressLabel}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color={paletteColor.main}
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.9rem' }
              }}
            >
              {percentage}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: { xs: 6, sm: 7, md: 8, lg: 10 },
              borderRadius: 6,
              bgcolor: theme.palette.grey[200],
              overflow: 'hidden',
              position: 'relative', 
              boxShadow: `inset 0 0 3px rgba(0,0,0,0.1)`,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${percentage}%`,
                borderRadius: 6,
                background: `linear-gradient(90deg, ${paletteColor.light || paletteColor.main}, ${paletteColor.main})`,
                transition: 'width 0.8s ease-out',
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// --- Radial Progress Bar Component ---
const RadialProgressBar = ({ percentage, color, size = 150, strokeWidth = 15, count, isLarge = false }) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const paletteColor = theme.palette[color];

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        borderRadius: '50%',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
        <circle
          stroke={theme.palette.grey[200]}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={paletteColor.main}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.8s ease-out' }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Typography variant="h4" fontWeight={900} sx={{
          color: paletteColor.main,
          fontSize: isLarge ? '2.5rem' : '1.8rem',
          textShadow: `0 0 5px ${paletteColor.main}50`
        }}>
          {percentage}%
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: isLarge ? '1rem' : '0.9rem' }}>
          {Number(count || 0).toLocaleString()} forms
        </Typography>
      </Box>
    </Box>
  );
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mfrCounts } = useSelector((state) => state.manpowerRequisition);

  console.log("MFR Counts from Redux:", { ...mfrCounts });

  useEffect(() => {
    if (user?.emp_id) {
      dispatch(getMFRCounts(user.emp_id));
    }
  }, [dispatch, user?.emp_id]);

  // Convert string values to numbers and calculate dynamic values
  const counts = {
    pending: parseInt(mfrCounts.pending_count) || 0,
    approved: parseInt(mfrCounts.approve_count) || 0,
    rejected: parseInt(mfrCounts.reject_count) || 0,
    raiseQuery: parseInt(mfrCounts.raise_query_count) || 0,
    onHold: parseInt(mfrCounts.on_hold_count) || 0,
    draft: parseInt(mfrCounts.draft_count) || 0,
    total: parseInt(mfrCounts.total_count) || 0
  };

  // Dynamic status metrics based on API data - Now with 5 cards
  const statusMetrics = [
    {
      status: 'Pending',
      count: counts.pending,
      icon: (props) => <PendingIcon {...props} />,
      color: 'primary',
      description: 'Requisitions awaiting initial review.',
    },
    {
      status: 'Approved',
      count: counts.approved,
      icon: (props) => <TrendingUpIcon {...props} />,
      color: 'success',
      description: 'Requisitions ready for recruitment.',
    },
    {
      status: 'On Hold',
      count: counts.onHold,
      icon: (props) => <AccessTimeIcon {...props} />,
      color: 'warning',
      description: 'Awaiting primary manager approval.',
    },
    {
      status: 'Raise Query',
      count: counts.raiseQuery,
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
  ];

  // Calculate Pending Metrics dynamically - Now includes Pending, On Hold, and Raise Query
  const pendingStatuses = statusMetrics.filter(m =>
    m.status === 'Pending' || m.status === 'On Hold' || m.status === 'Raise Query'
  );
  const totalPending = pendingStatuses.reduce((sum, metric) => sum + metric.count, 0);
  const pendingPercentage = counts.total > 0 ? Number(((totalPending / counts.total) * 100).toFixed(1)) : 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default}, #e0f7fa 20%, #f0f4c3 80%, ${theme.palette.background.default})`,
        p: { xs: 2, sm: 3, md: 4, lg: 6 },
        color: theme.palette.text.primary,
        transition: 'padding 0.3s ease',
      }}
    >
      <Box mb={{ xs: 3, sm: 4, md: 5 }} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>

        <Typography
          variant="h4"
          fontWeight={900}
          color="text.primary"
          mt={{ xs: 1.5, sm: 2, md: 2.5, lg: 4 }}
          sx={{
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem', lg: '2rem' },
            textShadow: '2px 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          Welcome back, {user?.emp_name || 'User'}!
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          color="text.secondary"
          mt={{ xs: 1.5, sm: 2, md: 2.5, lg: 2 }}
          sx={{
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' }
          }}
        >
          Real-time overview of current Manpower Requisition status.

        </Typography>
      </Box>

      {/* Status Cards Grid - Now with 5 cards (2-3 layout) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3, lg: 3 } }}>
        {statusMetrics.map((metric) => (
          <Box key={metric.status} sx={{ flex: '1 1 200px', minWidth: '350px' }}>
            <StatusCard
              status={metric.status}
              count={metric.count}
              icon={metric.icon}
              color={metric.color}
              description={metric.description}
              total={counts.total}
            />
          </Box>
        ))}
      </Box>

      {/* Overall Pending Rate Summary Card - Updated to include all pending types */}
      <Card
        sx={{
          mt: { xs: 4, sm: 5, md: 6, lg: 7 },
          p: { xs: 2, sm: 2.5, md: 3, lg: 4 },
          borderRadius: 5,
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          bgcolor: theme.palette.background.paper,
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.1), 0 0 50px ${theme.palette.warning.main}20`,
          border: `2px solid ${theme.palette.warning.light}30`,
          position: 'relative',
          textAlign: 'center',
          transition: 'all 0.5s ease-in-out',
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: 3
        }}>
          {/* Left Section: Title and Overview Text */}
          <Box sx={{ flexShrink: 0, maxWidth: { xs: '100%', md: '45%' } }}>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              mb={1.5}
              sx={{
                borderBottom: `4px solid ${theme.palette.warning.main}`,
                pb: 0.5,
                display: 'inline-block',
                textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.6rem' }
              }}
            >
              <HourglassEmptyIcon sx={{
                verticalAlign: 'middle',
                mr: 1,
                color: theme.palette.warning.main,
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem', lg: '1.8rem' }
              }} />
              Overall Pending Requisitions
            </Typography>

            <Typography
              variant="h3"
              color={theme.palette.warning.main}
              sx={{
                mt: 1.5,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                fontWeight: 900
              }}
            >
              {totalPending.toLocaleString()}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1,
                mb: 2,
                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem', lg: '1rem' }
              }}
            >
              Requisitions are currently in <strong>Pending</strong>, <strong>On Hold</strong>, or <strong>Raise Query</strong> status. These {totalPending.toLocaleString()} forms represent {pendingPercentage}% of the total workload and require attention to move forward.
            </Typography>

            {/* Summary of pending categories - Now includes all three types */}
            <Box sx={{
              textAlign: 'left',
              mt: 2,
              p: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: 3,
              borderLeft: `5px solid ${theme.palette.warning.main}`
            }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="text.primary"
                mb={1}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem', lg: '1rem' } }}
              >
                Pending Breakdown:
              </Typography>
              {pendingStatuses.map(metric => (
                <Box key={metric.status} display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.85rem' } }}
                  >
                    {metric.status}:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={theme.palette[metric.color].main}
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.85rem' } }}
                  >
                    {metric.count.toLocaleString()}
                  </Typography>
                </Box>
              ))}
              <Box display="flex" justifyContent="space-between" mt={1} pt={1} sx={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem', lg: '0.9rem' } }}
                >
                  Total Pending:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={theme.palette.warning.main}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem', lg: '0.9rem' } }}
                >
                  {totalPending.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Section: Large Radial Progress Bar */}
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 1, sm: 2, md: 0 }
          }}>
            <RadialProgressBar
              percentage={pendingPercentage}
              color="warning"
              count={totalPending}
              size={180}
              strokeWidth={18}
              isLarge={true}
            />
          </Box>
        </Box>
      </Card>
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