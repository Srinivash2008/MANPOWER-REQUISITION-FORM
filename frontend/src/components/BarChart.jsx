import React from 'react';
import { Box, Typography, Card, useTheme, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

export const BarChart = ({ data }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return <Card sx={{ p: 3, textAlign: 'center' }}><Typography>No data available for chart.</Typography></Card>;
    }

    const maxValue = Math.max(...data.map(item => item.count), 0);
    const chartHeight = 250;
    const barWidth = 40;
    const barMargin = 25;
    const totalWidth = data.length * (barWidth + barMargin);

    const getPath = (w, h, r) => `
      M${r},0
      L${w - r},0
      A${r},${r} 0 0 1 ${w},${r}
      L${w},${h}
      L0,${h}
      L0,${r}
      A${r},${r} 0 0 1 ${r},0
      Z
    `;

    return (
        <Box sx={{ width: '100%', overflowX: 'auto', pb: 2 }}>
            <svg width={totalWidth} height={chartHeight} style={{ display: 'block', margin: '0 auto' }}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.primary.light} />
                        <stop offset="100%" stopColor={theme.palette.primary.main} />
                    </linearGradient>
                </defs>
                <g>
                    {data.map((item, index) => {
                        const barHeight = maxValue > 0 ? (item.count / maxValue) * (chartHeight - 60) : 0;
                        const x = index * (barWidth + barMargin);
                        const y = chartHeight - barHeight - 40;

                        return (
                            <g key={item.status}>
                                <Tooltip title={`${item.status}: ${item.count.toLocaleString()}`} placement="top">
                                    <motion.path
                                        d={getPath(barWidth, barHeight, 8)}
                                        transform={`translate(${x}, ${y})`}
                                        fill="url(#barGradient)"
                                        initial={{ height: 0, y: chartHeight - 40 }}
                                        animate={{ height: barHeight, y: y }}
                                        transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </Tooltip>
                                <motion.text
                                    x={x + barWidth / 2}
                                    y={y - 8}
                                    textAnchor="middle"
                                    fill={theme.palette.text.primary}
                                    style={{ fontSize: '14px', fontWeight: 700 }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + index * 0.05 }}
                                >
                                    {item.count.toLocaleString()}
                                </motion.text>
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight - 15}
                                    textAnchor="middle"
                                    fill={theme.palette.text.secondary}
                                    style={{ fontSize: '11px', fontWeight: 500, writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                                >
                                    {item.status}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </Box>
    );
};

export default BarChart;