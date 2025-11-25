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

import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUser } from "../../redux/auth/authSlice";
import Logo from "../../assets/images/logo_MRF.png";
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
      // position: "fixed",
      width: "100%",
      background: colors.lightGreenBg, // Use light green background
      height: 64, // Slightly taller for better spacing
      boxShadow: 'none', // Remove shadow for a flatter, modern look
      borderBottom: `1px solid ${colors.lightBorder}`, // Use a subtle border instead
      zIndex: theme.zIndex.drawer + 1,
      padding: 0,
      margin: 0,
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: '64px !important', // Ensure toolbar height is consistent
      padding: theme.spacing(0, 3),
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(10),
    },
    logo: {
      height: 100,
      width: 150,
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
      color: colors.mediumText, // Use medium text for inactive items
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "0.9rem",
      padding: theme.spacing(0.5, 0), // Adjust padding for underline effect
      margin: theme.spacing(0, 1.5),
      borderBottom: '3px solid transparent', // Placeholder for hover/active underline
      transition: "all 0.3s ease",
      "&:hover": {
        color: colors.darkAccent, // Accent color on hover
        borderBottomColor: colors.darkAccent, // Show underline on hover
      },
    },
    activeNavItem: {
      color: colors.darkAccent, // Use accent color for active text
      fontWeight: 600,
      borderBottomColor: colors.darkAccent, // Persistent underline for active item
      '&:hover': {
        borderBottomColor: colors.darkAccent,
      }
    },
    rightSection: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      cursor: "pointer",
      padding: theme.spacing(0.75, 1.5),
      width: "fit-content",
      borderRadius: 2, // Pill shape
      transition: 'background-color 0.3s ease',
      "&:hover": {
        backgroundColor: "rgba(42, 127, 102, 0.08)", // Subtle hover effect
      },
    },
    userName: {
      color: colors.darkText,
      fontWeight: 500,
      textAlign: "right",
      whiteSpace: "nowrap",
      fontSize: "0.9rem",
    },
    avatar: {
      width: 36,
      height: 36,
      fontSize: "1rem",
      bgcolor: colors.darkAccent, // Use accent for avatar
    },
    menuPaper: {
      mt: theme.spacing(1.5),
      width: 200,

      boxShadow: theme.shadows[4],
      backgroundColor: colors.white,
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      fontSize: "0.95rem",
      padding: theme.spacing(1, 2),
      color: colors.darkText,
      "&:hover": {
        backgroundColor: "rgba(42, 127, 102, 0.08)",
      },
    },
    logoutItem: {
      color: theme.palette.error.main,
      fontWeight: 600,
      '&:hover': {
        // color: theme.palette.error.main,
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
      }
    },
    drawerPaper: {
      width: 240,
      background: colors.white,
      color: colors.darkText,
    },
    drawerItem: {
      color: colors.mediumText,
      "&:hover": {
        backgroundColor: "rgba(42, 127, 102, 0.08)",
      },
    },
    activeDrawerItem: {
      backgroundColor: colors.darkAccent,
      color: colors.white,
      '&:hover': {
        backgroundColor: colors.darkAccent,
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
    handleUserMenuClose();
    setDrawerOpen(false);
    navigate("/login");
  };



  const menuItems = [
    { label: "Dashboard", link: "/dashboard", icon: "dashboard" },
    { label: "ADD MRF", link: "/add-mrf", icon: "add" },
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
                          }}
                        >
                          {item.label}
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
                                  ...(isSubActive
                                    ? { backgroundColor: "#1976d2", color: "#fff" }
                                    : {}),
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
            {user.emp_name || "User"}
          </Typography>
          <Avatar sx={styles.avatar}>
            {user.emp_name?.charAt(0).toUpperCase() || "U"}
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