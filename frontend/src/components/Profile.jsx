import { useSelector } from "react-redux";
import { Avatar, Box, Card, CardContent, Chip, Divider, Grid, Typography } from "@mui/material";
import { FiBriefcase, FiHash } from "react-icons/fi";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
      <Box sx={{ color: 'primary.dark', fontSize: '1.2rem' }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mt: { xs: 8, md: 10, lg: 12}, width: '100%' }}>
      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', overflow: 'visible' }}>
        {/* Colorful Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2A7F66 0%, #559985 100%)',
            height: '150px',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          }}
        />

        {/* Profile Content */}
        <CardContent sx={{ textAlign: 'center', px: { xs: 2, sm: 4 }, pt: 0 }}>
          {/* Avatar overlapping the header */}
          <Avatar
            sx={{
              width: 140,
              height: 140,
              margin: '-70px auto 16px',
              bgcolor: 'primary.light',
              color: 'white',
              fontSize: '4.5rem',
              border: '6px solid white',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            }}
          >
            {user?.emp_name?.charAt(0)}
          </Avatar>

          {/* User Name and Position */}
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {user?.emp_name || "User Name"}
          </Typography>
          <Chip label={user?.emp_pos || "Position"} color="primary" variant="filled" sx={{ mb: 3, fontWeight: 600 }} />

          <Divider sx={{ my: 3, maxWidth: '400px', mx: 'auto' }} />

          {/* User Details */}
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={8} md={6}>
              <Box sx={{
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                mt: 2
              }}>
                <InfoItem icon={<FiHash />} label="Employee ID" value={user?.emp_id} />
                <InfoItem icon={<FiBriefcase />} label="Department" value={user?.emp_dept} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;