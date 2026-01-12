import React from 'react';
import { Box, Typography, Card, useTheme } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';

export const StatRow = ({ status, count, icon: Icon, color, total }) => {
    const theme = useTheme();
    const percentage = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
    const navigate = useNavigate();
    const paletteColor = theme.palette[color];

    return (
        <Card sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            mb: 2,
            borderRadius: 4,
            boxShadow: 'none',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${theme.palette.grey[200]}`,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateX(8px)',
                boxShadow: `0 8px 20px -5px ${theme.palette.mode === 'light' ? '#2A7F66' : paletteColor.main}30`,
                borderColor: theme.palette.mode === 'light' ? '#2A7F66' : paletteColor.main,
            },
        }}
            onClick={() => navigate(`/mrf-list/`)}
        >
            <Box sx={{
                width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${paletteColor.light || paletteColor.main}, ${paletteColor.main})`,
                color: 'white', flexShrink: 0, mr: 2,
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
    );
};

export default StatRow;