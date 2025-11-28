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
  Tooltip,
} from '@mui/material';
// Icons - Direct imports for use in the component
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import PendingIcon from '@mui/icons-material/Pending';
// New icon for the summary section
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useDispatch, useSelector } from 'react-redux';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getMFRCounts } from '../redux/cases/manpowerrequisitionSlice';

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

// --- Stat Row Component (New Vertical Design) ---
const StatRow = ({ status, count, icon: Icon, color, total }) => {
  const theme = useTheme();
  const percentage = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
  const paletteColor = theme.palette[color];

  return (
    <Card sx={{
      display: 'flex',
      alignItems: 'center',
      p: 2,
      mb: 2,
      borderRadius: 4,
      boxShadow: 'none',
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      border: `1px solid ${theme.palette.grey[200]}`,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateX(8px)',
        boxShadow: `0 8px 20px -5px ${theme.palette.mode === 'light' ? '#2A7F66' : paletteColor.main}30`,
        borderColor: theme.palette.mode === 'light' ? '#2A7F66' : paletteColor.main,
      }
    }}>
      <Box sx={{
        width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${paletteColor.light || paletteColor.main}, ${paletteColor.main})`,
        color: 'white', flexShrink: 0, mr: 2,
      }}>
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">{status}</Typography>
        <Typography variant="caption" color="text.secondary">{percentage}% of total requisitions</Typography>
      </Box>
      <Typography variant="h5" fontWeight={800} color={paletteColor.main}>{count.toLocaleString()}</Typography>

    </Card>
  );
};


// --- Donut Chart for Pending Breakdown ---
const DonutChart = ({ data, total, size = 200, strokeWidth = 25 }) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2; //NOSONAR
  const circumference = 2 * Math.PI * radius;
  console.log("Donut Chart Data:", data, "Total:", total);
  let accumulatedPercentage = 0;

  return (
    <Box sx={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Circle */}
        <circle
          stroke={theme.palette.grey[200]}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Data Segments */}

       // --- Inside the DonutChart component's return statement ---
        {data.map((item, mapIndex) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const segmentLength = (percentage / 100) * circumference;
          const paletteColor = theme.palette[item.color];

          // 1. Calculate the starting point (offset) based on the accumulated percentage *before* the current item.
          // NOTE: This MUST be calculated using the previous accumulated value.
          const startingOffset = (accumulatedPercentage / 100) * circumference;

          // 2. The strokeDashoffset is used to *position* the beginning of the stroke array. 
          // Since the SVG circle is rotated -90deg (to start at the top), we subtract the startingOffset from the circumference.
          // This correctly positions the start of the current segment.
          const strokeDashoffset = circumference - startingOffset;

          // Update accumulated percentage for the next iteration
          accumulatedPercentage += percentage;

          console.log("Donut Segment:", item.status, "Count:", item.count, "Percentage:", percentage, "Offset:", strokeDashoffset);

          // Skip drawing segments with zero count to avoid rendering issues with 0 length
          if (segmentLength <= 0) return null;

          return (
            <circle
              key={item.status}
              stroke={paletteColor.main}
              fill="transparent"
              strokeWidth={strokeWidth}

              // CRITICAL CHANGE: Set the length of the stroke and the gap after it.
              // [Segment Length] [Gap Length (Circumference - Segment Length)]
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}

              // Use the calculated offset to position the start of the segment.
              strokeDashoffset={strokeDashoffset}
              r={radius}
              cx={size / 2}
              cy={size / 2}
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          );
        })}
      </svg>
      <Box
        sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Typography variant="h4" fontWeight={900} color="text.primary">{total.toLocaleString()}</Typography>
        <Typography variant="body1" color="text.secondary" style={{ fontSize: "11px", fontWeight: "900" }}>Total</Typography>
      </Box>
    </Box>
  );
};

// --- Funnel Bar Component for the Insights Card ---
const FunnelBar = ({ data }) => {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ display: 'flex', height: '28px', borderRadius: '14px', overflow: 'hidden', bgcolor: 'action.hover', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.08)' }}>
        {data.map(item => {
          const itemPercent = total > 0 ? (item.value / total) * 100 : 0;
          const paletteColor = theme.palette[item.color];
          return (
            <Tooltip title={`${item.label}: ${item.value.toLocaleString()} (${itemPercent.toFixed(1)}%)`} key={item.label} arrow>
              <Box sx={{
                width: `${itemPercent}%`,
                background: `linear-gradient(145deg, ${paletteColor.light}, ${paletteColor.main})`,
                transition: 'all 0.4s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 0 12px ${paletteColor.main}90`,
                  zIndex: 1,
                }
              }} />
            </Tooltip>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2.5 }}>
        {data.map(item => (
          <Box key={item.label} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette[item.color].main }} />
              {item.label}
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              {item.value.toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};



// --- New Line Chart Component ---
const LineChart = ({ data }) => {
  const theme = useTheme();
  if (!data || data.length === 0) {
    return <Card sx={{ p: 3, textAlign: 'center' }}><Typography>No data available for chart.</Typography></Card>;
  }

  const maxValue = Math.max(...data.map(item => item.count), 1);
  const chartHeight = 250;
  const chartWidth = 950;
  const padding = { top: 20, right: 40, bottom: 40, left: 40 }; // Increased side padding for better spacing
  const drawingWidth = chartWidth - padding.left - padding.right;

  // Calculate points with proper spacing from edges
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1 || 1)) * drawingWidth; // Handle single data point case
    const y = padding.top + (1 - (item.count / maxValue)) * (chartHeight - padding.top - padding.bottom);
    return { x, y, ...item };
  });

  // --- Path Generation ---
  const createPath = (pts) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`; // Handle single point

    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const x_mid = (pts[i].x + pts[i + 1].x) / 2;
      const y_mid = (pts[i].y + pts[i + 1].y) / 2;
      const cp_x1 = (x_mid + pts[i].x) / 2;
      const cp_x2 = (x_mid + pts[i + 1].x) / 2;
      path += ` Q ${cp_x1},${pts[i].y} ${x_mid},${y_mid}`;
      path += ` Q ${cp_x2},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
    }
    return path;
  };

  const linePath = createPath(points);

  // Area path with proper closure
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${chartHeight - padding.bottom} L ${points[0].x},${chartHeight - padding.bottom} Z`
    : "";

  return (
    <Card sx={{ p: { xs: 2, sm: 3 }, height: '100%', backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Overall Requisition Status</Typography>
      <Box sx={{ position: 'relative', height: chartHeight, width: '100%' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
              <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Area Path */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke={theme.palette.primary.main}
            strokeWidth="3"
            strokeLinecap="round"
            sx={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
              animation: 'dash 1.5s ease-out forwards',
              '@keyframes dash': { to: { strokeDashoffset: 0 } },
            }}
          />

          {/* Data Points */}
          {points.map((point) => (
            <Tooltip title={`${point.status}: ${point.count.toLocaleString()}`} key={point.status} placement="top">
              <g>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill={theme.palette.background.paper}
                  stroke={theme.palette[point.color]?.main || theme.palette.primary.main}
                  strokeWidth="3"
                  style={{
                    cursor: 'pointer',
                    transition: 'r 0.2s ease, fill 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.setAttribute('r', '8');
                    e.currentTarget.style.fill = theme.palette[point.color]?.light || theme.palette.primary.light;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.setAttribute('r', '6');
                    e.currentTarget.style.fill = theme.palette.background.paper;
                  }}
                />
              </g>
            </Tooltip>
          ))}

          {/* X-Axis Labels (inside SVG for responsiveness) */}
          {points.map(point => (
            <text
              key={`label-${point.status}`}
              x={point.x}
              y={chartHeight - padding.bottom + 15} // Position below the chart line
              textAnchor="middle" // Center the text on the x-coordinate
              fill={theme.palette.text.secondary}
              style={{ fontSize: '10px', fontWeight: 600 }}
            >
              {point.status}
            </text>
          ))}
        </svg>
      </Box>
    </Card>
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
    pending: parseInt(mfrCounts?.pending_count) || 0,
    approved: parseInt(mfrCounts?.approve_count) || 0,
    rejected: parseInt(mfrCounts?.reject_count) || 0,
    raiseQuery: parseInt(mfrCounts?.raise_query_count) || 0,
    onHold: parseInt(mfrCounts?.on_hold_count) || 0,
    draft: parseInt(mfrCounts?.draft_count) || 0,
    total: parseInt(mfrCounts?.total_count) || 0
  };

  // Dynamic status metrics based on API data - Now with 5 cards
  const statusMetrics = [
    {
      status: 'Pending',
      count: counts.pending,
      icon: (props) => <PendingIcon {...props} />,
      color: 'secondary',
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
      color: 'tertitary',
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

  // Calculate Approval Rate
  const totalFinalized = counts.approved + counts.rejected;
  const approvalRate = totalFinalized > 0 ? Number(((counts.approved / totalFinalized) * 100).toFixed(1)) : 0;

  // Combine all data for the new comprehensive chart
  const comprehensiveData = [
    ...statusMetrics,
  ].sort((a, b) => b.count - a.count); // Sort by count descending

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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 3, md: 4 } }}>
        {/* --- Left Column (Main Content) --- */}
        <Box sx={{ flex: { lg: 8 }, display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>


          {/* New Row for Funnel and Pending Cards */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 4 } }}>
            {/* Requisition Funnel Card */}
            <Card sx={{ flex: 1, p: { xs: 2, sm: 3 }, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
              <Typography variant="h6" fontWeight={700}>Requisition Funnel</Typography>
              <Typography variant="body2" color="text.secondary">
                Breakdown of all {counts.total.toLocaleString()} requisitions.
              </Typography>
              <FunnelBar data={[
                { label: 'Approved', value: counts.approved, color: 'success' },
                { label: 'Pending', value: totalPending, color: 'primary' },
                { label: 'Rejected', value: counts.rejected, color: 'error' },
              ]} />
            </Card>

            {/* Pending Requisitions Focus Area */}
            <Card sx={{
              flex: 1.2, // Give this card slightly more space
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
              gap: { xs: 3, sm: 4, md: 5 },
              alignItems: 'center',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <DonutChart data={pendingStatuses} total={totalPending} size={120} strokeWidth={13} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>Action Required</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, maxWidth: '500px' }}>
                  {totalPending.toLocaleString()} forms require attention.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {pendingStatuses.map(metric => {
                    const itemPercentage = totalPending > 0 ? (metric.count / totalPending) * 100 : 0;
                    const paletteColor = theme.palette[metric.color];
                    return (
                      <Tooltip title={`${metric.status}: ${metric.count.toLocaleString()} (${itemPercentage.toFixed(1)}%)`} key={metric.status} placement="right">
                        <Box sx={{
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': { transform: 'translateX(4px)' }
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">{metric.status}</Typography>
                            <Typography variant="body2" fontWeight={700} color={paletteColor.main}>{metric.count.toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{
                            height: '8px',
                            width: '100%',
                            bgcolor: theme.palette.grey[200],
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}>
                            <Box sx={{
                              height: '100%',
                              width: `${itemPercentage}%`,
                              bgcolor: paletteColor.main,
                              borderRadius: '4px',
                              transition: 'width 0.5s ease-out',
                            }} />
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            </Card>
          </Box>

          {/* --- Bottom Row for Key Metrics --- */}
          <Box sx={{ mt: 1 }}>
            <LineChart data={comprehensiveData} />
          </Box>
        </Box>

        {/* --- Right Column (Status Overview) --- */}
        <Box sx={{ flex: { lg: 4 } }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, height: 'fit-content', backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Status Overview</Typography>
            {statusMetrics.map((metric) => (
              <StatRow
                key={metric.status}
                status={metric.status}
                count={metric.count}
                icon={metric.icon}
                color={metric.color}
                total={counts.total}
              />
            ))}
          </Card>
        </Box>
      </Box>
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