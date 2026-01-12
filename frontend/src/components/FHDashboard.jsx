import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  FormControl,
  Select,
  CircularProgress,
  MenuItem,
  useTheme,
  InputLabel,
  Icon,
} from '@mui/material'; 
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

// --- Child Components (assuming they are in the same folder or imported) ---
import DonutChart from './DonutChart';
import LineChart from './LineChart'; // Assuming you still need this for other parts
import RadialBarChart from './RadialBarChart';
import StatRow from './StatRow';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FHDashboard = ({
  counts,
  pendingStatuses,
  statusMetrics,
  totalPending,
  fhChartFilter,
  setFhChartFilter,
  comprehensiveData,
  dirStatusMetrics,
  hrStatusMetrics,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const overviewStats = [
    {
      label: 'Pending',
      value: counts.pending,
      icon: <PendingActionsIcon fontSize="large" />,
      color: theme.palette.warning.main,
    },
    {
      label: 'Approved',
      value: counts.approved,
      icon: <CheckCircleOutlineIcon fontSize="large" />,
      color: theme.palette.success.main,
    },
    {
      label: 'Rejected',
      value: counts.rejected,
      icon: <HighlightOffIcon fontSize="large" />,
      color: theme.palette.error.main,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 3, md: 4 } }}>
      {/* --- Left Column (Main Content) --- */}
      <Box sx={{ flex: { lg: 8 }, display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}> 
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr', lg: '1fr 1.2fr' }, gap: { xs: 3, md: 4 } }}>
          {/* Quick Actions Card */}
          <Card sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <FlashOnIcon sx={{ color: 'primary.main' }} />
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Quick Actions
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 4.5 }}>
              Your essential shortcuts.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box
                  onClick={() => navigate('/add-mrf')}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, cursor: 'pointer', background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}20)`, '&:hover': { background: `linear-gradient(135deg, ${theme.palette.primary.light}40, ${theme.palette.primary.main}40)` } }}
                >
                  <AddCircleOutlineIcon color="primary" />
                  <Typography fontWeight={600}>Create New MRF</Typography>
                </Box>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box
                  onClick={() => navigate('/my-requisitions')}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, cursor: 'pointer', background: `linear-gradient(135deg, ${theme.palette.secondary.light}20, ${theme.palette.secondary.main}20)`, '&:hover': { background: `linear-gradient(135deg, ${theme.palette.secondary.light}40, ${theme.palette.secondary.main}40)` } }}
                >
                  <AssessmentOutlinedIcon color="secondary" />
                  <Typography fontWeight={600}>My Requisitions</Typography>
                </Box>
              </motion.div>
            </Box>
          </Card>

          {/* Pending Requisitions Focus Area */}
          <Card sx={{ flex: 1.2, p: { xs: 2, sm: 3, md: 4 }, borderRadius: 4, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)', display: 'grid', borderLeft: `4px solid ${theme.palette.secondary.main}`, gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' }, gap: { xs: 3, sm: 4, md: 5 }, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <DonutChart data={pendingStatuses} total={totalPending} size={120} strokeWidth={13} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>Action Required</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, maxWidth: '500px' }}>
                {totalPending.toLocaleString()} forms require attention.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pendingStatuses.map((p) => {
                  const percentage = totalPending > 0 ? (p.count / totalPending) * 100 : 0;
                  return (
                    <motion.div
                      key={p.status}
                      whileHover={{ scale: 1.05, x: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Box
                        onClick={() => {
                          const lowerStatus = p.status.toLowerCase();
                          let statusParam = p.status;
                          if (lowerStatus.includes('query')) {
                            statusParam = 'Raise Query';
                          } else if (lowerStatus.includes('on-hold') || lowerStatus.includes('on hold')) {
                            statusParam = 'On Hold';
                          }
                          navigate(`/mrf-list?status=${statusParam}`);
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                          p: 0.5,
                          borderRadius: 1,
                        }}
                      >

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">{p.status}</Typography>
                        <Typography variant="caption" fontWeight={700}>{p.count.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ height: 8, backgroundColor: theme.palette.grey[200], borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{
                          height: '100%', width: `${percentage}%`,
                          backgroundColor: `${p.color}.main`, borderRadius: 4, transition: 'width 0.5s ease-in-out'
                        }} />
                      </Box>
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          </Card>
        </Box>

        <Box sx={{ mt: 1 }}>
          <Card sx={{ borderLeft: `4px solid ${theme.palette.primary.main}`, p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Requisition Status Graph
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="chart-filter-label">View</InputLabel>
                <Select
                  labelId="chart-filter-label"
                  value={fhChartFilter}
                  label="View"
                  onChange={(e) => setFhChartFilter(e.target.value)}
                >
                  <MenuItem value="overall">Overall</MenuItem>
                  <MenuItem value="director">Director Status</MenuItem>
                  <MenuItem value="hr">HR Status</MenuItem>
                  {/* <MenuItem value="combined_statuses">Combined Statuses</MenuItem> */}
                </Select>
              </FormControl>
            </Box>
            {fhChartFilter === 'overall' ? (
              <RadialBarChart data={comprehensiveData} />
            ) : (
              <LineChart data={comprehensiveData} />
            )}
          </Card>
        </Box>
      </Box>

      {/* --- Right Column (Status Overview) --- */}
      <Box sx={{ flex: { lg: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Director Status</Typography>
            {dirStatusMetrics.map((metric) => (
              <StatRow key={metric.status} {...metric} total={dirStatusMetrics.reduce((acc, m) => acc + m.count, 0)} />
            ))}
          </Card>
          <Card sx={{ p: { xs: 2, sm: 3 }, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>HR Status</Typography>
            {hrStatusMetrics.map((metric) => (
              <StatRow key={metric.status} {...metric} total={hrStatusMetrics.reduce((acc, m) => acc + m.count, 0)} />
            ))}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default FHDashboard;