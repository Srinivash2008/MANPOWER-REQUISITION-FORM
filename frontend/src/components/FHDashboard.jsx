import React, { useEffect, useState } from 'react';
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
  TextField,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PeopleIcon from '@mui/icons-material/People';

// --- Child Components (assuming they are in the same folder or imported) ---
import DonutChart from './DonutChart';
import LineChart from './LineChart'; // Assuming you still need this for other parts
import RadialBarChart from './RadialBarChart';
import StatRow from './StatRow';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllRecruitersWithCounts } from '../redux/cases/manpowerrequisitionSlice';

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
  approvedmfrCounts,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Get recruiter data from Redux store
  const { recruitersWithCounts, status } = useSelector((state) => state.manpowerRequisition);
  const [recruiterFilter, setRecruiterFilter] = useState('');

  // Fetch recruiters data when component mounts (only for user 12345)
  useEffect(() => {
    if (user?.emp_id === '12345') {
      dispatch(fetchAllRecruitersWithCounts());
    }
  }, [dispatch, user?.emp_id]);

  // Filter recruiters based on search input
  const filteredRecruiters = recruitersWithCounts?.filter(recruiter =>
    recruiter.emp_name?.toLowerCase().includes(recruiterFilter.toLowerCase())
  ) || [];

  const overviewStats = [
    {
      label: 'Submitted',
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
            <hr></hr>
            {/* MRF Tracking Status Counts — visible only for emp_id 12345 or 1722 */}
            {(user?.emp_id == '12345' || user?.emp_id == '1722') && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 2 }}>
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
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>MRF Details</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, maxWidth: '500px' }}>
                {totalPending.toLocaleString()} MRF require attention.
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
                          let statusParam = p.status.replace('MRF ', '');
                          const lowerStatus = statusParam.toLowerCase();
                          console.log(lowerStatus, "lowerStatus")
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
                          }
                          else if (lowerStatus == "completed mrf") {
                            statusParam = "isStatus=Completed"
                          }
                          console.log(statusParam, "statusParam");
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
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Director Status (Rajesh)</Typography>
            {dirStatusMetrics.map((metric) => (
              <StatRow filterType="rajesh" key={metric.status} {...metric} total={dirStatusMetrics.reduce((acc, m) => acc + m.count, 0)} />
            ))}
          </Card>
          <Card sx={{ p: { xs: 2, sm: 3 }, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>HR Status (Selvi)</Typography>
            {hrStatusMetrics.filter(metric => metric.status !== 'MRF Pending').map((metric) => (
              <StatRow filterType="selvi" key={metric.status} {...metric} total={hrStatusMetrics.filter(m => m.status !== 'MRF Pending').reduce((acc, m) => acc + m.count, 0)} />
            ))}
          </Card>

          {/* Recruiter Status Overview Card - Visible only for user 12345 */}
          {user?.emp_id === '12345' && (
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
                              {recruiter.total_mrfs || recruiter.count || 0}
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
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FHDashboard;