import React from 'react';
import {
  Box,
  Typography,
  Card,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  InputLabel,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

// --- Child Components (assuming they are in the same folder or imported) ---
import DonutChart from './DonutChart';
import LineChart from './LineChart';
import BarChart from './BarChart';
import RadialBarChart from './RadialBarChart';
import StatRow from './StatRow';

const FHDashboard = ({
  counts,
  pieSeries,
  totalForPie,
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