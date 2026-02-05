import React from 'react';
import { Box, Typography, useTheme, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

const RadialBarChart = ({ data = [] }) => {
    const theme = useTheme();
    if (!data || data.length === 0) {
        return <Typography>No data available</Typography>;
    }

    const size = 400;
    const center = size / 2;
    const maxRadius = center - 40;
    const barWidth = (maxRadius / data.length) * 0.7;
    const maxValue = Math.max(...data.map(d => d.count), 1);

    const colors = [
        theme.palette.primary.main,
        theme.palette.success.main,
        theme.palette.secondary.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.tertitary.main,
        '#6c757d',
        '#17a2b8',
    ];

    const getPath = (radius, startAngle, endAngle) => {
        const start = {
            x: center + radius * Math.cos(startAngle),
            y: center + radius * Math.sin(startAngle),
        };
        const end = {
            x: center + radius * Math.cos(endAngle),
            y: center + radius * Math.sin(endAngle),
        };
        const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g>
                    {data.map((item, index) => {
                        const radius = maxRadius - index * (barWidth + 5);
                        if (radius <= 0) return null;

                        const angle = (item.count / maxValue) * (2 * Math.PI * 0.95); // Use 95% of circle
                        const startAngle = -Math.PI / 2;
                        const endAngle = startAngle + angle;

                        return (
                            <g key={item.status}>
                                <Tooltip title={`${item.status}: ${item.count.toLocaleString()}`} placement="right">
                                    <motion.path
                                        d={getPath(radius, startAngle, endAngle)}
                                        fill="none"
                                        stroke={item.color ? theme.palette[item.color]?.main : colors[index % colors.length]}
                                        strokeWidth={barWidth}
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1, ease: 'easeInOut', delay: index * 0.1 }}
                                    />
                                </Tooltip>
                            </g>
                        );
                    })}
                </g>
            </svg>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 250 }}>
                {data.map((item, index) => (
                    <React.Fragment key={item.status}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 14,
                                height: 14,
                                borderRadius: '4px',
                                bgcolor: item.color ? theme.palette[item.color]?.main : colors[index % colors.length],
                            }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.status}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', ml: 'auto' }}>
                                {item.count.toLocaleString()}
                            </Typography>
                        </Box>
                        {(item.status === 'MRF Withdrawn' || item.status === 'Director Rejected') && (
                            <hr style={{
                                border: 'none',
                                borderTop: `1px dashed ${theme.palette.divider}`,
                                margin: '8px 0'
                            }} />
                        )}
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
};

export default RadialBarChart;