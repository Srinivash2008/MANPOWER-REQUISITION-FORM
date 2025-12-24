import React, { useState, useEffect, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../redux/auth/authSlice';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Lock from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Login_image from '../assets/images/login.png';
import { useSearchParams } from 'react-router-dom';

const Login = () => {
    const [searchParams] = useSearchParams();
  const userid = searchParams.get('userid'); // Gets "123" from ?userid=123
  console.log("Userid from URL:", userid);
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { status, error, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'succeeded' && token) {
      navigate('/dashboard');
    }
  }, [status, token, navigate]);

  useEffect(() => {
    if (userid) {
      dispatch(login({ emp_id: userid, emp_pass: 'defaultPassword' }));
    }
  }, [userid]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ emp_id: empId, emp_pass: password }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // --- INLINE STYLE OBJECTS (Using Mastery Hub Colors) ---

  const colors = {
    lightGreenBg: '#F3FAF8',
    darkAccent: '#2A7F66', // Mastery Hub Logo/Button color
    lightBorder: '#C0D1C8',
    darkText: '#333333',
    mediumText: '#666666',
    white: '#FFFFFF',
    error: '#DC3545',
  };

  const styles = {
    // 1. Full Wrapper (Split Screen)
    wrapper: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.white, // Main body background is white
      fontFamily: 'system-ui, -apple-system, sans-serif',
      // Note: Media query handled conceptually, but not possible with pure inline styles
    },

    // 2. Visual Panel (Left Side) - Light Green Background
    visualPanel: {
      flex: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: colors.darkText,
      // Use the lightest green background from the image
      background: colors.lightGreenBg, 
    },
    visualLottie: {
      width: '60%',
      maxWidth: '400px',
      height: 'auto',
      opacity: 0.9,
    },
    visualContent: {
      textAlign: 'center',
      position: 'relative',
      zIndex: 10,
      marginTop: '1.5rem',
      maxWidth: '80%',
    },
    visualHeading: {
      fontSize: '2.2rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: colors.darkAccent, // Use accent color for the main title
    },
    visualSubtext: {
      fontSize: '1rem',
      color: colors.mediumText,
    },

    // 3. Form Panel (Right Side)
    formPanel: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
    },
    
    // 4. Login Card (Form Container) - Minimalist look
    loginCard: {
      background: colors.white,
      padding: '3rem',
      width: '100%',
      maxWidth: '400px',
    },
    
    // 5. Logo and Text
    logoPlaceholder: {
      fontSize: '2rem',
      fontWeight: 800,
      color: colors.darkAccent,
      marginBottom: '1rem',
      textAlign: 'center',
    },
    cardTitle: {
      fontSize: '1.75rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: colors.darkText,
      textAlign: 'center',
    },
    cardSubtext: {
      color: colors.mediumText,
      marginBottom: '2rem',
      fontSize: '1rem',
      textAlign: 'center',
    },

    // 6. Form elements
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem', // Tighter spacing like the image
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    inputLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: colors.mediumText,
      marginBottom: '0.4rem',
      display: 'none', // Removed label to mimic the placeholder-only style of the image
    },
    inputField: {
      padding: '0.9rem 1rem',
      border: `1px solid ${colors.lightBorder}`,
      borderRadius: '4px', // Slight radius
      fontSize: '1rem',
      outline: 'none',
      color: colors.darkText,
      transition: 'border-color 0.3s',
      // The image uses a light grey border
    },

    // 7. Button
    loginButton: {
      padding: '1rem',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: colors.darkAccent,
      color: colors.white,
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: '1.5rem', // Margin above button
      transition: 'background-color 0.3s, opacity 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    buttonDisabled: {
        backgroundColor: '#6D9E8F', // Slightly desaturated accent color when disabled
        cursor: 'not-allowed',
        opacity: 0.8,
    },

    // 8. Error/Footer
    errorMessage: {
        color: colors.error,
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: '0.9rem',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        padding: '0.75rem',
        borderRadius: '4px',
    },
    cardFooter: {
        marginTop: '0.5rem',
        textAlign: 'right',
        fontSize: '0.9rem',
    },
    forgotLink: {
        color: colors.darkAccent,
        textDecoration: 'none',
        transition: 'color 0.3s',
    },
  };

  return (
    <div style={styles.wrapper}>
      
      {/* 1. Left Side: Dynamic and Engaging Lottie Animation (Themed) */}
      <div style={styles.visualPanel}>
        {/* <DotLottieReact
          src="https://lottie.host/17eb7e01-5bc7-47ac-8c60-00571d90c409/6cvHSfwIP8.lottie"
          loop
          autoplay
          style={styles.visualLottie}
        /> */}
        <img src={Login_image} alt="Login Visual" style={styles.visualLottie} />
        <div style={styles.visualContent}>
          <h1 style={styles.visualHeading}>MANPOWER REQUISITION FORM</h1>
          <p style={styles.visualSubtext}>
            Streamline your workforce requests and approvals with ease.
          </p>
        </div>
      </div>

      {/* 2. Right Side: Sleek Login Form */}
      <div style={styles.formPanel}>
        <div style={styles.loginCard}>
          <div style={styles.logoPlaceholder}>
            {/* The Logo is styled in the accent color */}
            MRF 
          </div>
          
          {/* <h2 style={styles.cardTitle}>Secure Sign In</h2> */}
          <p style={{ ...styles.cardSubtext, marginTop: '2rem' }}>Sign in to your account</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              {/* <label htmlFor="empId" style={styles.inputLabel}>Employee ID</label> */}
              <TextField
                id="empId"
                placeholder="Username"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                required
                variant="standard"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div style={styles.inputGroup}>
              {/* <label htmlFor="password" style={styles.inputLabel}>Password</label> */}
              <TextField
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="standard"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            
            {/* Forgot Password Link Positioned Above Button */}
            {/* <div style={styles.cardFooter}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div> */}

            <button 
              type="submit" 
              style={{
                  ...styles.loginButton, 
                  ...(status === 'loading' ? styles.buttonDisabled : {}),
              }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Processing...' : 'Sign in'}
            </button>
          </form>
          
          {status === 'failed' && <p style={styles.errorMessage}>{error}</p>}
          
      
         
        </div>
      </div>
    </div>
  );
};

export default Login;