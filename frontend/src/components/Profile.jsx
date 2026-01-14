import { useDispatch, useSelector } from "react-redux";
import { Avatar, Box, Card, CardContent, Chip, Divider, Grid, Typography, useTheme } from "@mui/material";
import { FiBriefcase, FiHash, FiMail, FiPhone, FiCalendar, FiAward } from "react-icons/fi"; // Added a few more icons for realistic data
import { styled } from '@mui/material/styles';
import { useEffect } from "react";
import { fetchUserByEmpId } from "../redux/cases/manpowerrequisitionSlice";

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
    const { userByEmpId } = useSelector((state) => state.manpowerRequisition);
    console.log(userByEmpId, "userByEmpId")
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchUserByEmpId(user?.emp_id));
    }, [dispatch, user?.emp_id]);

    const theme = useTheme();


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
        <Box sx={{ mt: { xs: 8, md: 10, lg: 12 }, width: '100%', maxWidth: '1200px', mx: 'auto', px: 2 }}>
            <ModernCard>

                {/* Colorful Header */}
                <HeaderBox />

                <CardContent sx={{ pt: 0, pb: 4 }}>
                    <Grid container spacing={4}>

                        {/* --- Left Column: Summary (Avatar, Name, Position) --- */}
                        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>

                            {/* Avatar overlapping the header */}
                            <Avatar
                                alt={userByEmpId?.emp_name}
                                src={userByEmpId?.emp_avatar_url || ""} // Use a real avatar if available
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
                                {userByEmpId?.emp_name?.charAt(0)}
                            </Avatar>

                            {/* User Name and Position */}
                            <Typography variant="h3" fontWeight={700} sx={{ mb: 1, color: theme.palette.text.primary }}>
                                {userByEmpId?.emp_name}
                            </Typography>
                            <Chip
                                label={userByEmpId?.emp_pos}
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 3, fontWeight: 600, px: 2, py: 0.5, fontSize: '0.9rem' }}
                            />

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
                                        <InfoItem icon={<FiHash />} label="Employee ID" value={userByEmpId?.employee_id} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InfoItem icon={<FiBriefcase />} label="Department" value={userByEmpId?.emp_dept} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InfoItem icon={<FiMail />} label="Email Address" value={userByEmpId?.mail_id} />
                                    </Grid>
                                  

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