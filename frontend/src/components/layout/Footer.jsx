import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Divider, IconButton, Zoom } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

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
          bgcolor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          py: 4,
          mt: 8,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Divider sx={{ mb: 3 }} />
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.9rem" }}
            >
              © {new Date().getFullYear()}{" "}
              <Box
                component="span"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                PDMR Manpower Requisition Form
              </Box>
              . All rights reserved.
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
              width:'fit-content',
              float:'right',
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'background.paper',
              },
              boxShadow: 3,
            }}
            aria-label="Back to Top"
          >
            <ArrowUpwardIcon sx={{fontSize:'25px'}}/>
          </IconButton>
        </Box>
      </Zoom>
    </>
  );
};

export default Footer;