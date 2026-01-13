import React from 'react';
import { Box, Typography, Card, useTheme } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const StatRow = ({ filterType,status, count, icon: Icon, color, total }) => {
    console.log(filterType,"filterType")
    const theme = useTheme();
    const percentage = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
    const navigate = useNavigate();
    const paletteColor = theme.palette[color];

    const handleNavigation = () => {
        let complete_status = status + ' ' + filterType.toLowerCase();

        let filterQuery = '';
        const lowerStatus = complete_status.toLowerCase();
        console.log(lowerStatus,"lowerStatus")

        if (lowerStatus.includes('director') || lowerStatus.includes('rajesh')) {
            if (lowerStatus.includes('query')) filterQuery = 'director_status=Raise Query';
            else if (lowerStatus.includes('approved')) filterQuery = 'director_status=Approve';
            else if (lowerStatus.includes('rejected')) filterQuery = 'director_status=Reject';
            else if (lowerStatus.includes('on-hold') || lowerStatus.includes('on hold')) filterQuery = 'director_status=On Hold';
        } else if (lowerStatus.includes('hr') || lowerStatus.includes('selvi')) {
            if (lowerStatus.includes('query')) filterQuery = 'hr_status=Raise Query';
            else if (lowerStatus.includes('approved')) filterQuery = 'hr_status=HR Approve';
            else if (lowerStatus.includes('rejected')) filterQuery = 'hr_status=Reject';
            else if (lowerStatus.includes('on-hold') || lowerStatus.includes('on hold')) filterQuery = 'hr_status=On Hold';
        }
        console.log(filterQuery,"filterQuery")
        navigate(`/mrf-list?${filterQuery}`);
    };

    return ( 
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
            <Card sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                mb: 2,
                borderRadius: 4,
                boxShadow: 'none',
                background: `linear-gradient(to right, ${paletteColor.light}15, transparent)`,
                border: `1px solid ${theme.palette.grey[200]}`,
                borderLeft: `5px solid ${paletteColor.main}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: `0 8px 20px -5px ${paletteColor.main}30`,
                    borderColor: paletteColor.main,
                },
            }}
                onClick={handleNavigation}
            >
                <Box sx={{
                    width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, ${paletteColor.light || paletteColor.main}, ${paletteColor.main})`,
                    color: 'white', flexShrink: 0, mr: 2, boxShadow: `0 4px 12px ${paletteColor.main}50`
                }}>
                    <Icon sx={{ fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                        {status === 'Draft' ? 'My Drafts' :
                            status === 'Withdraw' ? 'My Withdraws' : status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{percentage}% of total requisitions</Typography>
                </Box>
                <Typography variant="h5" fontWeight={800} color={paletteColor.main}>{count.toLocaleString()}</Typography>
                <ArrowForwardIosIcon sx={{ color: 'text.secondary', ml: 1.5, fontSize: '1rem' }} />
            </Card>
        </motion.div>
    );
};

export default StatRow;