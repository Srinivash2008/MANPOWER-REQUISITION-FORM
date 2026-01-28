import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  IconButton,
  useMediaQuery, // 👈 New hook for responsive behavior
  Drawer, // 👈 New component for mobile navigation
  List,
  Menu,
  ListItem,
  MenuItem,
  ListItemText,
  Divider,
} from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUser } from "../../redux/auth/authSlice";
import Logo from "../../assets/images/logo_MRF_new.png";
import Swal from "sweetalert2";
//import { fetchTodayLogin, shiftUpdateUser } from "../../redux/cases/caseEntrySlice";

const useHeaderStyles = () => {
  const theme = useTheme();
  // Color palette inspired by Login.jsx for a cohesive look
  const colors = {
    lightGreenBg: '#F3FAF8',
    darkAccent: '#2A7F66',
    lightBorder: '#C0D1C8',
    darkText: '#333333',
    mediumText: '#666666',
    white: '#FFFFFF',
  };

  return {
    appBar: {
      position: "fixed",
      top: theme.spacing(2),
      left: '50%',
      transform: 'translateX(-50%)',
      width: '97%',
      maxWidth: '1600px',
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(12px)',
      borderRadius: '99px', // Fully rounded ends
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      zIndex: theme.zIndex.drawer + 1,
      padding: 0,
      margin: 0,
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: '68px !important',
      padding: theme.spacing(0, 3),
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(10),
    },
    logo: {
      height: 40, // Corrected logo size for the navbar
      width: "auto",
      cursor: "pointer",
      userSelect: "none",
      margin: 0,
      padding: 0,
    },
    navMenu: {
      display: "flex",
      gap: theme.spacing(4), // Reduced gap for better fit
      alignItems: "center",
      width: "fit-content",
    },
    navItem: {
      color: theme.palette.text.secondary,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.95rem",
      padding: theme.spacing(1.2, 2.5),
      margin: theme.spacing(0, 0.5),
      borderRadius: '5px',
      position: 'relative', // Needed for the active indicator
      transition: "all 0.3s ease",
      "&:hover": {
        color: theme.palette.primary.main,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
      },
    },
    activeNavItem: {
      color: colors.darkAccent, // Use dark green for active text
      backgroundColor: '#E9F5F2', // Use light green for background
      '&:hover': {
        color: colors.darkAccent,
      },
      // Add a distinct bottom border as the active indicator
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '6px', // Position the line below the text
        left: '15%',
        right: '15%',
        height: '3px',
        borderRadius: '2px',
        background: colors.darkAccent, // Solid green underline
      },
    },
    rightSection: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1.5),
      cursor: "pointer",
      padding: theme.spacing(0.75, 1.5),
      width: "fit-content",
      borderRadius: '99px',
      transition: 'background-color 0.3s ease',
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
    },
    userName: {
      color: theme.palette.text.primary,
      fontWeight: 500,
      textAlign: "right",
      whiteSpace: "nowrap",
      fontSize: "0.9rem",
    },
    avatar: {
      width: 36,
      height: 36,
      fontSize: "1rem",
      background: `linear-gradient(45deg, #66BB6A, #388E3C)`,
    },
    menuPaper: {
      mt: '2px',
      width: 200,
      borderRadius: '0 0 16px 16px',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      fontSize: "0.95rem",
      padding: theme.spacing(1, 2),
      color: colors.darkText,
      "&:hover": {
        backgroundColor: colors.lightGreenBg,
        color: colors.darkAccent,
      },
    },
    logoutItem: {
      color: theme.palette.error.main,
      fontWeight: 600,
      '&:hover': {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
      }
    },
    drawerPaper: {
      width: 240,
      background: colors.white,
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      color: colors.darkText,
    },
    drawerItem: {
      color: colors.mediumText,
      borderRadius: '8px',
      margin: theme.spacing(0.5, 1),
      "&:hover": {
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
      },
    },
    activeDrawerItem: {
      backgroundColor: '#E9F5F2', // Light green background
      color: colors.darkAccent, // Dark green text for contrast
      fontWeight: 700,
      '&:hover': {
        backgroundColor: '#E9F5F2',
      }
    },
    logoutDropdownItem: {
      color: theme.palette.error.main,
      fontWeight: 600,
    }
  };
};

const Header = () => {
  const styles = useHeaderStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // 👈 Check if screen is 'md' or smaller

  const isAdmin = user?.emp_pos === 'Senior Manager' || user?.emp_pos === 'Senior Client Support Executive';

  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false); // 👈 State for mobile drawer

  const isDirector = user?.emp_id == "1400";
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  //const { userLoginStatus } = useSelector((state) => state.caseEntry);

  // console.log(userLoginStatus,"userLoginStatus");
  /* 
    useEffect(() => {
        if (user) {
         dispatch(fetchTodayLogin());
        }
    }, [user]); */

  // Menu handling
  const handleMenuEnter = (event, label) => {
    if (!isMobile) {
      setAnchorEl(event.currentTarget);
      setHoveredMenu(label);
    }
  };

  const handleMenuLeave = () => {
    if (!isMobile) {
      setAnchorEl(null);
      setHoveredMenu(null);
    }
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleNavigation = (link) => {
    navigate(link);
    handleMenuLeave();
    setDrawerOpen(false); // Close drawer on navigation
  };



  const handleLogout = () => {
    if (user?.emp_id) {
      dispatch(logoutUser(user.emp_id));
    }
    dispatch(logout());
    sessionStorage.removeItem("MER_EDIT_ID");
    handleUserMenuClose();
    setDrawerOpen(false);
    navigate("/login");
  };



  const menuItems = [
    { label: "Dashboard", link: "/dashboard" },
    {
      label: "MRF",
      submenu: [
        !isDirector && { label: "Add MRF", link: "/add-mrf" },
        { label: "View MRF", link: "/mrf-list" },
        // user?.emp_id === "1722" && { label: "My Requisitions", link: "/my-requisitions" },
      ].filter(Boolean),
    },
    { label: "Reports", link: "/reports" },
  ];

  const renderMobileMenu = (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{ sx: styles.drawerPaper }}
    >
      <Toolbar />
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Box
          component="img"
          src={Logo}
          alt="Logo"
          sx={styles.logo}
        />
      </Box>


      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              button
              onClick={() => {
                if (item.submenu) {
                  // If it has a submenu, handle differently (e.g., toggle nested list)
                  // For simplicity, we just navigate to the first sub-item here
                  handleNavigation(item.submenu[0].link);
                } else {
                  handleNavigation(item.link);
                }
              }}
              sx={{
                ...styles.drawerItem,
                ...(location.pathname.startsWith(item.link) || (item.submenu && item.submenu.some(sub => location.pathname.startsWith(sub.link))) ? styles.activeDrawerItem : {})
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
            {item.submenu && (
              <List component="div" disablePadding>
                {item.submenu.map((subItem, subIndex) => (
                  <ListItem
                    key={subIndex}
                    button
                    onClick={() => handleNavigation(subItem.link)}
                    sx={{
                      pl: 4,
                      ...styles.drawerItem,
                      ...(location.pathname.startsWith(subItem.link) ? styles.activeDrawerItem : {})
                    }}
                  >
                    <ListItemText primary={subItem.label} />
                  </ListItem>
                ))}
              </List>
            )}
            {index < menuItems.length - 1 && <Divider sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} />}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );

  return (
    <AppBar sx={styles.appBar} elevation={0}>
      <Toolbar sx={styles.toolbar}>
        {/* Left Section */}
        <Box sx={styles.leftSection}>
          {isMobile && ( // 👈 Show hamburger icon on mobile
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component="img"
            src={Logo}
            alt="Logo"
            sx={styles.logo}
            onClick={() => handleNavigation("/dashboard")}
          />
          {!isMobile && ( // 👈 Hide nav menu on mobile
            <Box sx={styles.navMenu}>
              {menuItems.map((item, index) => {
                const isActive =
                  item.link && location.pathname.startsWith(item.link);
                const isParentActive =
                  item.submenu &&
                  item.submenu.some((sub) =>
                    location.pathname.startsWith(sub.link)
                  );

                return (
                  <Box
                    key={index}
                    sx={{ position: "relative", display: "flex", alignItems: "center" }}
                    onMouseEnter={
                      item.submenu ? (e) => handleMenuEnter(e, item.label) : undefined
                    }
                    onMouseLeave={item.submenu ? handleMenuLeave : undefined}
                  >
                    {!item.submenu ? (
                      <Typography
                        sx={{
                          ...styles.navItem,
                          ...(isActive ? styles.activeNavItem : {}),
                        }}
                        onClick={() => handleNavigation(item.link)}
                      >
                        {item.label}
                      </Typography>
                    ) : (
                      <>
                        <Typography
                          sx={{
                            ...styles.navItem,
                            ...(isParentActive ? styles.activeNavItem : {}),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          {item.label}
                          {Boolean(anchorEl) && hoveredMenu === item.label ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </Typography>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && hoveredMenu === item.label}
                          onClose={handleMenuLeave}
                          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                          transformOrigin={{ vertical: "top", horizontal: "left" }}
                          PaperProps={{ sx: styles.menuPaper }}
                          MenuListProps={{ onMouseLeave: handleMenuLeave }}
                        >
                          {item.submenu.map((subItem, subIndex) => {
                            const isSubActive = location.pathname.startsWith(
                              subItem.link
                            );
                            return (
                              <MenuItem
                                key={subIndex}
                                sx={{
                                  ...styles.menuItem,
                                  ...(isSubActive && {
                                    backgroundColor: '#E9F5F2', // Light green background
                                    color: '#2A7F66', // Dark green text
                                    fontWeight: 700,
                                    '&:hover': { backgroundColor: '#E9F5F2' } // Keep background on hover
                                  }),
                                }}
                                onClick={() => handleNavigation(subItem.link)}
                              >
                                {subItem.label}
                              </MenuItem>
                            );
                          })}
                        </Menu>
                      </>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
        {/* Right Section: User Info */}
        {/* {token && user && ( */}
        <Box sx={styles.rightSection} onClick={handleUserMenuClick}>
          <Typography sx={styles.userName}>
            {user?.emp_name || "User"}
          </Typography>
          <Avatar sx={styles.avatar}>
            {user?.emp_name?.charAt(0).toUpperCase() || "U"}
          </Avatar>
        </Box>
        {/* )} */}

        {/* User Dropdown Menu */}
        <Menu
          anchorEl={userMenuAnchorEl}
          open={Boolean(userMenuAnchorEl)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{ sx: styles.menuPaper }}
        >
          <MenuItem
            sx={styles.menuItem}
            onClick={() => handleNavigation("/profile")}
          >
            <PersonOutlineIcon fontSize="small" />
            Profile
          </MenuItem>
          <Divider />
          <MenuItem
            sx={{ ...styles.menuItem, ...styles.logoutItem }}
            onClick={() => {
              handleLogout();
            }}
          >
            <LogoutIcon fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
      {renderMobileMenu}
    </AppBar>
  );
};

export default Header;