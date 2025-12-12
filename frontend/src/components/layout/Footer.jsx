import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Link, IconButton, Zoom } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Logo from "../../assets/images/logo_MRF_new.png"; // Assuming you have the logo here

const Footer = () => {
  // State to control the visibility of the "Back to Top" button
  const [showScroll, setShowScroll] = useState(false);

  // Function to check the scroll position and update state
  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  // Function to handle the smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add and remove the event listener for scrolling
  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showScroll]);

  return (
    <>
      <Box
        component="footer"
        sx={{
          background: '#F3FAF8', // Light green background from your theme
          py: 3,
          mt: 'auto', // Pushes footer to the bottom
          borderTop: '1px solid #C0D1C8', // Light green border
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <img src={Logo} alt="Logo" style={{ height: '28px', opacity: 0.8 }} />
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Manpower Requisition
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: { xs: 'center', sm: 'right' } }}
            >
              Developed by{' '}
              <Link
                href="#"
                color="#2A7F66" // Dark accent green
                sx={{ fontWeight: 'bold', textDecoration: 'none' }}
              >
                PDMR WEB TEAM
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* The Floating "Back to Top" Button */}
      <Zoom in={showScroll}>
        <Box
          onClick={scrollToTop}
          role="presentation"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
        >
          <IconButton
            color="primary"
            sx={{
              bgcolor: '#2A7F66', // Dark accent green
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#256e5a', // Slightly darker green on hover
                transform: 'scale(1.1)',
              },
            }}
            aria-label="Back to Top"
          >
            <ArrowUpwardIcon />
          </IconButton>
        </Box>
      </Zoom>
    </>
  );
};

export default Footer;