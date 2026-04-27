import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  Tooltip,
  TextField,
  Autocomplete,
  useTheme,
  CircularProgress,
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRecruitersWithCounts } from '../redux/cases/manpowerrequisitionSlice';
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
  approvedmfrCounts,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get recruiter data from Redux store
  const { recruitersWithCounts, status } = useSelector((state) => state.manpowerRequisition);
  const [recruiterFilter, setRecruiterFilter] = useState('');

  // Fetch recruiters data when component mounts
  useEffect(() => {
    dispatch(fetchAllRecruitersWithCounts());
  }, [dispatch]);

  // Filter recruiters based on search input
  const filteredRecruiters = recruitersWithCounts?.filter(recruiter =>
    recruiter.emp_name?.toLowerCase().includes(recruiterFilter.toLowerCase())
  ) || [];

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
            label: 'Submitted',
            value: counts.pending,
            icon: <PendingActionsIcon fontSize="large" />,
            color: theme.palette.warning.main,
          },
        ];

  const trackingStats = [
    { label: 'In Process', value: approvedmfrCounts.inProcess, color: '#FF9800' },
    { label: 'Offered', value: approvedmfrCounts.offered, color: '#2196F3' },
    { label: 'Joined', value: approvedmfrCounts.joined, color: '#4CAF50' },
    { label: 'IJP', value: approvedmfrCounts.ijp, color: '#9C27B0' },
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
              {user?.emp_id == '1722' && (
                <Box
                  onClick={() => navigate('/add-mrf')}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <AddCircleOutlineIcon color="primary" />
                  <Typography fontWeight={600}>Create New MRF</Typography>
                </Box>
              )}
              {user?.emp_id == '1400' && (
                <Box
                  onClick={() => navigate('/mrf-list')}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ArrowForwardIosIcon color="primary" />
                  <Typography fontWeight={600}>View MRF</Typography>
                </Box>
              )}
              <Box
                onClick={() => navigate('/reports')}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <AssessmentOutlinedIcon color="secondary" />
                <Typography fontWeight={600}>View Reports</Typography>
              </Box>
            </Box>
            <hr style={{ marginBottom: '5%' }}></hr>
            {/* MRF Tracking Status Counts */}
            {(user?.emp_id == '12345' || user?.emp_id == '1722') && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                {trackingStats.map((stat) => (
                  <Box
                    key={stat.label}
                    onClick={() => navigate(`/approved-mrf?status=${encodeURIComponent(stat.label)}`)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: `1px solid ${stat.color}30`,
                      backgroundColor: `${stat.color}10`,
                      '&:hover': { backgroundColor: `${stat.color}25` },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Typography variant="h5" fontWeight={800} sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Card>

          {/* Pending Requisitions Focus Area */}
          <Card sx={{ flex: 1.2, p: { xs: 2, sm: 3, md: 4 }, borderRadius: 4, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)', display: 'grid', borderLeft: `4px solid ${theme.palette.secondary.main}`, gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' }, gap: { xs: 3, sm: 4, md: 5 }, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <DonutChart data={pendingStatuses} total={totalPending} size={120} strokeWidth={13} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>
                MRF Details
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, maxWidth: '500px' }}>
                {`${totalPending.toLocaleString()} MRF require attention.`}
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
                          let statusParam = p.status.replace('MRF ', '');
                          const lowerStatus = statusParam.toLowerCase();
                          if (lowerStatus == "submitted") {
                            statusParam = ""
                          } else if (lowerStatus == "pending with director") {
                            statusParam = "director_status=Pending"
                          } else if (lowerStatus == "pending with hr") {
                            statusParam = "director_status=Approve&hr_status=Pending"
                          } else if (lowerStatus == "approved mrf") {
                            statusParam = "status=HR Approve"
                          } else if (lowerStatus == "rejected mrf") {
                            statusParam = "status=Reject"
                          } else if (lowerStatus == "completed mrf") {
                            statusParam = "isStatus=Completed"
                          }
                          navigate(`/mrf-list?${statusParam}`);
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
                            backgroundColor: theme.palette[p.color]?.main || p.color, borderRadius: 4, transition: 'width 0.5s ease-in-out'
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
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
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
          {/* Manager Status Overview Card */}
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
                    onClick={() => navigate(`/mrf-list?functional_head=${manager.employee_id}`)}
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
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'space-around' }}>
                      <Typography variant="caption" sx={{ fontSize: "9px" }}>MRF Submitted: <strong>{manager.counts.Pending}</strong></Typography>
                      <Typography variant="caption" sx={{ fontSize: "9px" }} color="success.dark">MRF Approved: <strong>{manager.counts.Approved + manager.counts.HR_Approve}</strong></Typography>
                      <Typography variant="caption" sx={{ fontSize: "9px" }} color="error.dark">MRF Rejected: <strong>{manager.counts.Rejected}</strong></Typography>
                      <Typography variant="caption" sx={{ fontSize: "9px" }} color="warning.dark">MRF On Hold: <strong>{manager.counts.On_Hold}</strong></Typography>
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

        {/* Recruiter Status Overview Card */}
<Card sx={{ p: { xs: 2, sm: 3 }, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    <PeopleIcon color="primary" />
    <Typography variant="h6" fontWeight={700}>Recruiter Status Overview</Typography>
  </Box>

 

  {status === 'loading' ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ maxHeight: '450px', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #ddd' }}>Recruiter Name</th>
            <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #ddd' }}>MRF Count</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecruiters.length > 0 ? (
            filteredRecruiters.map((recruiter) => (
              <tr
                key={recruiter.employee_id}
                onClick={() => navigate(`/mrf-list?recruiter_id=${recruiter.employee_id}`)}
                style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '8px 12px' }}>{recruiter.emp_name}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>
                  {recruiter.count || 0}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
                {recruiterFilter ? 'No recruiters found with that name.' : 'No recruiter data available.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  )}
</Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;