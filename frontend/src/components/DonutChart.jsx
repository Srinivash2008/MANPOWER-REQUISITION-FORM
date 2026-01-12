import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export const DonutChart = ({ data, total, size = 200, strokeWidth = 25 }) => {
    const theme = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercentage = 0;

    return (
        <Box sx={{ width: size, height: size, position: 'relative' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Circle */}
                <circle
                    stroke={theme.palette.grey[200]}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Data Segments */}
                {data.map((item) => {
                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                    const segmentLength = (percentage / 100) * circumference;
                    const paletteColor = theme.palette[item.color] || theme.palette.grey[900];

                    const startingOffset = (accumulatedPercentage / 100) * circumference;
                    const strokeDashoffset = circumference - startingOffset;

                    accumulatedPercentage += percentage;

                    if (segmentLength <= 0) return null;

                    return (
                        <circle
                            key={item.status}
                            stroke={paletteColor.main}
                            fill="transparent"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                            strokeDashoffset={strokeDashoffset}
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                        />
                    );
                })}
            </svg>
            <Box
                sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <Typography variant="h4" fontWeight={900} color="text.primary">{total.toLocaleString()}</Typography>
                <Typography variant="body1" color="text.secondary" style={{ fontSize: "11px", fontWeight: "900" }}>Total</Typography>
            </Box>
        </Box>
    );
};

export default DonutChart;