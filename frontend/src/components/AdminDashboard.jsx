import React from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Autocomplete,
  useTheme
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

// --- Child Components (assuming they are in the same folder or imported) ---
import { DonutChart } from './DonutChart';
import { LineChart } from './LineChart';

const AdminDashboard = ({
  counts,
  pieSeries,
  totalForPie,
  pendingStatuses,
  totalPending,
  comprehensiveData,
  managerStatusCounts,
  managerOptions,
  managerFilter,
  setManagerFilter,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 3, md: 4 } }}>
      {/* --- Left Column (Main Content) --- */}
      <Box sx={{ flex: { lg: 8 }, display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'column', lg: 'row' }, gap: { xs: 3, md: 4 } }}>
          {/* Requisition Funnel Card */}
          <Card sx={{ flex: 1, p: { xs: 2, sm: 3 }, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
            <Typography variant="h6" fontWeight={700}>Requisition Funnel</Typography>
            <Typography variant="body2" color="text.secondary">
              Breakdown of all {counts.total.toLocaleString()} requisitions.
            </Typography>
            <Box sx={{ mt: 0, minHeight: '200px', height: { xs: 200, sm: 200, lg: 150, md: 100 } }}>
              <PieChart series={[pieSeries]} legend={{ direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: 0, itemMarkWidth: 10, itemMarkHeight: 10 }}>
                <text x="50%" y="75%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {totalForPie}
                </text>
                <text x="50%" y="85%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '12px', fill: theme.palette.text.secondary }}>
                  Total
                </text>
              </PieChart>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', fontStyle: 'italic' }}>
              *Pending includes On Hold and Raise Query statuses.
            </Typography>
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
                    <Box key={p.status}>
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
                  );
                })}
              </Box>
            </Box>
          </Card>
        </Box>

        <Box sx={{ mt: 1 }}>
          <Card sx={{ borderLeft: `4px solid ${theme.palette.primary.main}` }}>
            <LineChart data={comprehensiveData} />
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
                  <Box key={manager.name} sx={{ mb: 2.5, p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
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