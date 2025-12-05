import { useSelector } from "react-redux";
import { Avatar, Box, Card, CardContent, Chip, Divider, Grid, Typography, useTheme } from "@mui/material";
import { FiBriefcase, FiHash, FiMail, FiPhone, FiCalendar } from "react-icons/fi"; // Added a few more icons for realistic data
import { styled } from '@mui/material/styles';

// Styled Card for the main profile box
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3), // Softer, larger border radius
  boxShadow: '0 12px 40px rgba(0,0,0,0.08)', // Deeper, but softer shadow
  overflow: 'hidden',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    // transform: 'translateY(-2px)', // Optional subtle hover effect
    // boxShadow: '0 15px 45px rgba(0,0,0,0.12)',
  },
}));

// Styled box for the gradient header
const HeaderBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #106f52 0%, #38a3a5 100%)', // More vibrant/deep gradient
  height: '180px', // Slightly taller header
  position: 'relative',
}));

// The Profile Component
const ModernProfile = () => {
  const { user } = useSelector((state) => state.auth);
  console.log(user, "user")
  const theme = useTheme();

  // Mock data for display, you can remove this if your user object is complete
  const mockUser = {
      emp_name: user?.emp_name || "Alex Johnson",
      emp_pos: user?.emp_pos || "Senior Product Designer",
      emp_id: user?.emp_id || "EMP-92048",
      emp_dept: user?.emp_dept || "Design & User Experience",
      emp_email: user?.emp_email || "alex.johnson@corp.com",
      emp_phone: user?.emp_phone || "+1 (555) 123-4567",
      emp_join_date: user?.emp_join_date || "Oct 15, 2021",
  };


  const InfoItem = ({ icon, label, value }) => (
    <Box 
        sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 2, 
            p: 2, 
            borderRadius: 2, 
            transition: 'background-color 0.2s',
            '&:hover': { 
                backgroundColor: theme.palette.action.hover 
            }
        }}
    >
      <Box sx={{ color: theme.palette.primary.main, fontSize: '1.2rem', mt: 0.2 }}>
          {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500, mb: 0.2 }}>
          {label}
        </Typography>
        <Typography 
            variant="body1" 
            fontWeight={600} 
            color="text.primary" 
            sx={{ wordBreak: 'break-word' }}
        >
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mt: { xs: 8, md: 10, lg: 12}, width: '100%', maxWidth: '1200px', mx: 'auto', px: 2 }}>
      <ModernCard>
        
        {/* Colorful Header */}
        <HeaderBox />

        <CardContent sx={{ pt: 0, pb: 4 }}>
            <Grid container spacing={4}>
                
                {/* --- Left Column: Summary (Avatar, Name, Position) --- */}
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                    
                    {/* Avatar overlapping the header */}
                    <Avatar
                        alt={mockUser.emp_name}
                        src={mockUser.emp_avatar_url || ""} // Use a real avatar if available
                        sx={{
                            width: 160,
                            height: 160,
                            margin: '-90px auto 24px', // Taller overlap
                            bgcolor: theme.palette.primary.light,
                            color: 'white',
                            fontSize: '4.5rem',
                            border: `8px solid ${theme.palette.background.paper}`, // Use background color for border
                            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                        }}
                    >
                        {mockUser.emp_name?.charAt(0)}
                    </Avatar>

                    {/* User Name and Position */}
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1, color: theme.palette.text.primary }}>
                        {mockUser.emp_name}
                    </Typography>
                    <Chip 
                        label={mockUser.emp_pos} 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mb: 3, fontWeight: 600, px: 2, py: 0.5, fontSize: '0.9rem' }} 
                    />

                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', px: 2 }}>
                        "Dedicated to innovation and user-centric design."
                    </Typography>

                </Grid>

                {/* --- Right Column: Details (InfoItems) --- */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ p: { md: 2, xs: 0 }, mt: { xs: 3, md: 0 } }}>
                        
                        <Typography 
                            variant="h5" 
                            fontWeight={600} 
                            color="text.primary" 
                            gutterBottom
                            sx={{ borderBottom: `2px solid ${theme.palette.divider}`, pb: 1, mb: 3 }}
                        >
                            Employee Details
                        </Typography>

                        <Grid container spacing={0}>
                            {/* Grouping 2 items per row on larger screens */}
                            <Grid item xs={12} sm={6}>
                                <InfoItem icon={<FiHash />} label="Employee ID" value={mockUser.emp_id} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem icon={<FiBriefcase />} label="Department" value={mockUser.emp_dept} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem icon={<FiMail />} label="Email Address" value={mockUser.emp_email} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem icon={<FiPhone />} label="Phone Number" value={mockUser.emp_phone} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem icon={<FiCalendar />} label="Joining Date" value={mockUser.emp_join_date} />
                            </Grid>
                            
                            {/* You can add more InfoItems here */}

                        </Grid>

                    </Box>
                </Grid>

            </Grid>
        </CardContent>
      </ModernCard>
    </Box>
  );
};

export default ModernProfile;