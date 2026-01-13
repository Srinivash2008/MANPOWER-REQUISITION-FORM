import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  Tooltip,
  TextField,
  Autocomplete,
  useTheme,
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Child Components (assuming they are in the same folder or imported) ---
import { DonutChart } from './DonutChart';
import { LineChart } from './LineChart';

const AdminDashboard = ({
  user,
  counts,
  pendingStatuses,
  totalPending,
  comprehensiveData,
  managerStatusCounts,
  managerOptions,
  managerFilter,
  setManagerFilter,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const overviewStats =
    user?.emp_id === '1722'
      ? [
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
        ]
      : [
          {
            label: 'Pending',
            value: counts.pending,
            icon: <PendingActionsIcon fontSize="large" />,
            color: theme.palette.warning.main,
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
              Your administrative shortcuts.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                onClick={() => navigate('/add-mrf')}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <AddCircleOutlineIcon color="primary" />
                <Typography fontWeight={600}>Create New MRF</Typography>
              </Box>
              <Box
                onClick={() => navigate('/reports')}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <AssessmentOutlinedIcon color="secondary" />
                <Typography fontWeight={600}>View Reports</Typography>
              </Box>
            </Box>
          </Card>

          {/* Pending Requisitions Focus Area */}
          <Card sx={{ flex: 1.2, p: { xs: 2, sm: 3, md: 4 }, borderRadius: 4, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)', display: 'grid', borderLeft: `4px solid ${theme.palette.secondary.main}`, gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' }, gap: { xs: 3, sm: 4, md: 5 }, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <DonutChart data={pendingStatuses} total={totalPending} size={120} strokeWidth={13} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>
                {user?.emp_id === '1722' ? 'Approved Forms' : 'Action Required'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, maxWidth: '500px' }}>
                {user?.emp_id === '1722'
                  ? `${totalPending.toLocaleString()} forms have been approved.`
                  : `${totalPending.toLocaleString()} forms require attention.`}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: '50px' }}>
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
                          } else if (lowerStatus.includes('approved')) {
                            statusParam = 'Approve';
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
                {pendingStatuses.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                    No items to show.
                  </Typography>
                )}
              </Box>
            </Box>
          </Card>
        </Box>

        <Box sx={{ mt: 1 }}>
          <Card sx={{ borderLeft: `4px solid ${theme.palette.primary.main}` }}>
             <Box sx={{ display: 'flex',flexDirection: 'column',justifyContent: 'space-between', alignItems: 'center',mt: 2,mb: 2 }}>
                          <Typography variant="h6" fontWeight={700}>
                            Requisition Status Graph
                          </Typography>
            <LineChart data={comprehensiveData} />
            </Box>
          </Card>
        </Box>
      </Box>

      {/* --- Right Column (Status Overview) --- */}
      <Box sx={{ flex: { lg: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Manager Status Overview</Typography>
            <Autocomplete
              options={managerOptions}
              onInputChange={(event, newInputValue) => {
                setManagerFilter(newInputValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Filter by Manager Name" variant="outlined" size="small" fullWidth />
              )}
              freeSolo
              clearOnBlur
              value={managerFilter}
              sx={{ mb: 2 }}
            />
            <Box sx={{ maxHeight: '450px', overflowY: 'auto', pr: 1 }}>
              {managerStatusCounts && managerStatusCounts.length > 0 ? (
                managerStatusCounts.map(manager => (
                  <Box
                    key={manager.name}
                    onClick={() => navigate(`/reports?functional_head=${manager.employee_id}`)}
                    sx={{
                      mb: 2.5, p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }
                    }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>{manager.name}</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">{manager.total}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-around' }}>
                      <Typography variant="caption">Pending: <strong>{manager.counts.Pending}</strong></Typography>
                      <Typography variant="caption" color="success.dark">Approved: <strong>{manager.counts.Approved + manager.counts.HR_Approve}</strong></Typography>
                      <Typography variant="caption" color="error.dark">Rejected: <strong>{manager.counts.Rejected}</strong></Typography>
                      <Typography variant="caption" color="warning.dark">On Hold: <strong>{manager.counts.On_Hold}</strong></Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                  No managers found.
                </Typography>
              )}
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;