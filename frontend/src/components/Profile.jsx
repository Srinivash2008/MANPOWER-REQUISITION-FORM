import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, changePassword } from '../redux/users/profileSlice';
import Swal from 'sweetalert2';
import {
  Box, Paper, Typography, CircularProgress, Alert,
  Button, TextField, Container, Avatar, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';





// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': { transform: 'scale(1.01)' },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
}));

const Profile = () => {
  const dispatch = useDispatch();
  const { data: profile, status, error, passwordStatus, passwordError } = useSelector(state => state.profile);

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  // --- START OF FIX ---
  useEffect(() => {
    if (profile && profile.emp_id) {
      const imagePath = `/emp_image/${profile.emp_id}.jpg`;
      
      // Check if the image exists before setting the path
      fetch(imagePath, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            setProfileImage(imagePath);
          } else {
            setProfileImage('/emp_image/default.jpg');
          }
        })
        .catch(() => {
          setProfileImage('/emp_image/default.jpg');
        });
    }
  }, [profile]);
  // --- END OF FIX ---

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };
  const handleClosePasswordDialog = () => setOpenPasswordDialog(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    // --- Validation ---
    if (!oldPassword || !newPassword || !confirmPassword) {
      swal.fire({
        icon: '',
        iconHtml: `<img src="/validation/warning.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
        confirmButtonColor: theme.palette.error.main,
        title: 'All fields required',
        text: 'Please fill out all password fields.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      swal.fire({
        icon: '',
        iconHtml: `<img src="/validation/error.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
        confirmButtonColor: theme.palette.error.main,
        title: 'Password Mismatch',
        text: 'New password and confirm password do not match.'
      });
      return;
    }

    if (oldPassword === newPassword) {
      swal.fire({
        icon: '',
        iconHtml: `<img src="/validation/error.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
        confirmButtonColor: theme.palette.error.main,
        title: 'Invalid Password',
        text: 'New password must be different from the old password.'
      });
      return;
    }

    // --- Dispatch action ---
    dispatch(changePassword({ oldPassword, newPassword }))
      .then(result => {
        if (changePassword.fulfilled.match(result)) {
          swal.fire({
            icon: '',
            iconHtml: `<img src="/validation/success.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
            confirmButtonColor: theme.palette.error.main,
            title: 'Success',
            text: 'Password changed successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          handleClosePasswordDialog();
          setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          swal.fire({
            icon: '',
            iconHtml: `<img src="/validation/error.gif" alt="Custom Icon" style="width: 100px; height: 100px">`,
            confirmButtonColor: theme.palette.error.main,
            title: 'Error',
            text: result.payload || 'Failed to change password.'
          });
        }
      });
  };

  if (status === 'loading') return (
    <Container sx={{ textAlign: 'center', mt: 4 }}>
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>Loading profile...</Typography>
    </Container>
  );

  if (status === 'failed') return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error">Error loading profile: {error || 'Unknown error occurred.'}</Alert>
    </Container>
  );

  if (!profile) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="info">No profile data found. Please log in.</Alert>
    </Container>
  );

  return (
    <Container maxWidth="sm">
      <StyledPaper>
        <ProfileAvatar src={profileImage}>
          {!profileImage && <PersonIcon fontSize="large" />}
        </ProfileAvatar>
        <Typography variant="h4" align="center">{profile.emp_name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 2 }}>{profile.emp_pos}</Typography>

        <Grid container spacing={2} sx={{ width: '100%', mb: 3 }}>
          <Grid item xs={12}><Typography variant="h6">Employee ID:</Typography><Typography color="text.secondary">{profile.emp_id}</Typography></Grid>
          <Grid item xs={12}><Typography variant="h6">Department:</Typography><Typography color="text.secondary">{profile.emp_dept}</Typography></Grid>
          <Grid item xs={12}><Typography variant="h6">Email:</Typography><Typography color="text.secondary">{profile.mail_id}</Typography></Grid>
          <Grid item xs={12}><Typography variant="h6">Gender:</Typography><Typography color="text.secondary">{profile.gender}</Typography></Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleOpenPasswordDialog} startIcon={<LockIcon />}>Change&nbsp;Password</Button>
        </Box>
      </StyledPaper>

      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordStatus === 'loading' && <CircularProgress size={24} sx={{ my: 2 }} />}
          {passwordError && <Alert severity="error" sx={{ my: 2 }}>{passwordError}</Alert>}
          <TextField name="oldPassword" label="Current Password" type="password" fullWidth margin="normal" value={passwordForm.oldPassword} onChange={handlePasswordChange} />
          <TextField name="newPassword" label="New Password" type="password" fullWidth margin="normal" value={passwordForm.newPassword} onChange={handlePasswordChange} />
          <TextField name="confirmPassword" label="Confirm New Password" type="password" fullWidth margin="normal" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" disabled={passwordStatus === 'loading'}>Change</Button>
        </DialogActions>
      </Dialog>

      {/* SweetAlert z-index */}
      <style>{`.swal2-container { z-index: 2000 !important; }`}</style>
    </Container>
  );
};

export default Profile;