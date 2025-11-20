import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  IconButton,
  useMediaQuery, // 👈 New hook for responsive behavior
  Drawer, // 👈 New component for mobile navigation
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // 👈 New icon for mobile menu
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutUser } from "../../redux/auth/authSlice";
import Logo from "../../assets/images/acs_hd_logo.jpg";
import Swal from "sweetalert2";
//import { fetchTodayLogin, shiftUpdateUser } from "../../redux/cases/caseEntrySlice";

const useHeaderStyles = () => {
  const theme = useTheme();
  return {
    appBar: {
      position: "fixed",
      width: "100%",
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      height: 60,
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      zIndex: theme.zIndex.drawer + 1,
      color: theme.palette.primary.contrastText,
      borderRadius: 1,
      padding: 0,
      margin: 0,
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 64,
      padding: theme.spacing(0, 3),
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(10),
    },
    logo: {
      height: 50,
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
      color: "#fff",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "0.9rem",
      textAlign: "center",
      padding: theme.spacing(1, 1.5),
      borderRadius: 6,
      transition: "background-color 0.3s ease, color 0.3s ease",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.15)",
      },
    },
    activeNavItem: {
      backgroundColor: "rgba(255,255,255,0.25)",
      fontWeight: 600,
    },
    rightSection: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      cursor: "pointer",
      padding: theme.spacing(0.5, 1.5),
      width: "fit-content",
      borderRadius: 6,
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.15)",
      },
    },
    userName: {
      color: "#fff",
      fontWeight: 500,
      textAlign: "right",
      whiteSpace: "nowrap",
      fontSize: "0.9rem",
    },
    avatar: {
      width: 36,
      height: 36,
      fontSize: "1rem",
      bgcolor: theme.palette.secondary.main,
    },
    menuPaper: {
      mt: theme.spacing(1.5),
      width: 200,
      borderRadius: 8,
      boxShadow: theme.shadows[4],
      backgroundColor: "#fff",
    },
    menuItem: {
      fontSize: "0.95rem",
      padding: theme.spacing(1, 2),
      color: theme.palette.text.primary,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
      },
    },
    logoutItem: {
      color: theme.palette.error.main,
      fontWeight: 600,
    },
    drawerPaper: {
      width: 240,
      background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      color: "#fff",
    },
    drawerItem: {
      color: "#fff",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.15)",
      },
    },
    activeDrawerItem: {
      backgroundColor: "rgba(255,255,255,0.25)",
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


  // const handleLogout = () => {
  //   const shiftcount = userLoginStatus[0].shift_count;
  //   const login_id = userLoginStatus[0].login_id;
  //   console.log(login_id,"login_id");
  //   console.log(shiftcount,"shiftcount");
    
  //   if (user?.emp_id) {
  //     if(shiftcount === 1 )
  //     {
  //       Swal.fire({
  //         title: 'Select a Shift',
  //         input: 'select',
  //         inputOptions: {
  //           'SHIFT_I': 'SHIFT I - 3.30 AM to 12.30 PM',
  //           'SHIFT_II': 'SHIFT II - 12.30 PM to 7.30 PM',
  //           'SHIFT_III': 'SHIFT III - 7.30 PM to 3.30 AM',
  //         },
  //         inputPlaceholder: 'Choose Shift',
  //         showCancelButton: true,
  //         confirmButtonText: 'Submit',
  //         cancelButtonText: 'Cancel',
  //         confirmButtonColor: theme.palette.error.main,
  //         didOpen: () => {
  //           const select = Swal.getPopup().querySelector('select');
  //           if (select) {
  //             select.style.width = '440px';  // Change only select width
  //             select.style.maxWidth = '100%';
  //             select.style.padding = '8px';
  //             select.style.fontSize = '15px';
  //           }
  //         },
  //         preConfirm: (value) => {
  //           if (!value) {
  //             Swal.showValidationMessage('Please select a shift before submitting.');
  //             return false;
  //           }
  //           return value;
  //         }
  //       }).then((selection) => {
  //         if (selection.isConfirmed) {
  //           const caseData = {
  //             shift: selection.value,
  //             login_id: login_id,  // Fix: obtain selected value here
  //           };

  //           dispatch(shiftUpdateUser({
  //             login_id: login_id,
  //             caseData: caseData
  //           })).unwrap();
  //           Swal.fire({
  //             title: 'Logout',
  //             text: 'User Last Logout is Confirmed',
  //             icon: '',
  //             iconHtml: `<img src="/validation/warning.gif" alt="Custom Icon" style="width: 100px; height: 100px;">`,
  //             showCancelButton: true,
  //             confirmButtonText: 'Yes',
  //             cancelButtonText: 'No',
  //             confirmButtonColor: theme.palette.error.main,
  //           }).then((result) => {
  //             const status = result.isConfirmed ? "last_logout" : "normal";

  //             // ✅ Wait for the actual logout to complete
  //             dispatch(logoutUser({ emp_id: user.emp_id, status }))
  //               .unwrap()
  //               .then(() => {
  //                 // Logout successful — now redirect
  //                 dispatch(logout());
  //                 handleUserMenuClose();
  //                 setDrawerOpen(false);
  //                 navigate("/login");
  //               })
  //               .catch((error) => {
  //                 console.error("Logout failed:", error);
  //                 Swal.fire({
  //                   title: 'Logout Failed',
  //                   text: error || 'Something went wrong.',
  //                   icon: 'error',
  //                 });
  //               });
  //           });
  //         }
  //       });

  //     } else {
  //       Swal.fire({
  //         title: 'Logout',
  //         text: 'User Last Logout is Confirmed',
  //         icon: '',
  //         iconHtml: `<img src="/validation/warning.gif" alt="Custom Icon" style="width: 100px; height: 100px;">`,
  //         showCancelButton: true,
  //         confirmButtonText: 'Yes',
  //         cancelButtonText: 'No',
  //         confirmButtonColor: theme.palette.error.main,
  //       }).then((result) => {
  //         const status = result.isConfirmed ? "last_logout" : "normal";

  //         // ✅ Wait for the actual logout to complete
  //         dispatch(logoutUser({ emp_id: user.emp_id, status }))
  //           .unwrap()
  //           .then(() => {
  //             // Logout successful — now redirect
  //             dispatch(logout());
  //             handleUserMenuClose();
  //             setDrawerOpen(false);
  //             navigate("/login");
  //           })
  //           .catch((error) => {
  //             console.error("Logout failed:", error);
  //             Swal.fire({
  //               title: 'Logout Failed',
  //               text: error || 'Something went wrong.',
  //               icon: 'error',
  //             });
  //           });
  //       });
  //     }
      
  //   }
  // };


  
  const menuItems = [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Entry", link: "/case-entry" },
    // ✅ Conditional Quality Menu
  isAdmin
  ? {
      label: "Quality",
      submenu: [
        { label: "Internal Quality List", link: "/quality" },
        { label: "Internal Quality Completed", link: "/quality-approved" },
        { label: "External Quality List", link: "/external-quality-cases" },
      ],
    }
  : {
      label: "Quality",
      submenu: [
        { label: "Internal Quality", link: "/quality-approved" },
        { label: "External Quality", link: "/external-quality-cases" },
      ],
    },
    {
      label: "Updates",
      submenu: [
        ...(isAdmin ? [{ label: "Assessment/Feedback", link: "/assessment" }] : [{ label: "Assessment", link: "/assessment-view" }]),
        { label: "Latest Updates", link: "/system-updates" },
        { label: "Email Templates", link: "/email-template" },
        ...(isAdmin ? [{ label: "User Registration", link: "/user-registration" }] : []),
      ],
    },
    { label: "Report", link: "/report" },
    
    
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
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
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
            onClick={() => handleNavigation("/")}
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
        {token && user && (
          <Box sx={styles.rightSection} onClick={handleUserMenuClick}>
            <Typography sx={styles.userName}>
              {user.emp_name || "User"}
            </Typography>
            <Avatar sx={styles.avatar}>
              {user.emp_name?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </Box>
        )}
        {/* User Dropdown */}
        <Menu
          anchorEl={userMenuAnchorEl}
          open={Boolean(userMenuAnchorEl)}
          onClose={handleUserMenuClose}
          PaperProps={{ sx: styles.menuPaper }}
        >
          <MenuItem
            sx={styles.menuItem}
            onClick={() => {
              handleNavigation("/profile");
              handleUserMenuClose();
            }}
          >
            Profile
          </MenuItem>
          <Divider />
          <MenuItem
            sx={{ ...styles.menuItem, ...styles.logoutItem }}
            onClick={handleLogout}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
      {renderMobileMenu}
    </AppBar>
  );
};

export default Header;