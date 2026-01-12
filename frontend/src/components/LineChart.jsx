import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Card, useTheme, Tooltip } from '@mui/material';

export const LineChart = ({ data }) => {
    const theme = useTheme();
    const chartContainerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(950); // Default, will be updated dynamically

    useEffect(() => {
        const handleResize = () => {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.offsetWidth);
            }
        };
        handleResize(); // Set initial width
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!data || data.length === 0) {
        return <Card sx={{ p: 3, textAlign: 'center' }}><Typography>No data available for chart.</Typography></Card>;
    }
    const maxValue = Math.max(...data.map(item => item.count), 1); // Ensure maxValue is at least 1 to avoid division by zero
    const chartHeight = 250; // Fixed height for the chart area
    const padding = { top: 20, right: 40, bottom: 40, left: 40 };
    const drawingWidth = Math.max(chartWidth - padding.left - padding.right, 1); // Ensure drawingWidth is at least 1

    // Calculate points for the line chart
    const points = data.map((item, index) => {
        const x = padding.left + (index / (data.length - 1 || 1)) * drawingWidth;
        const y = padding.top + (1 - (item.count / maxValue)) * (chartHeight - padding.top - padding.bottom);
        return { x, y, ...item };
    });

    // Function to create a smooth SVG path
    const createPath = (pts) => {
        if (pts.length === 0) return "";
        if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;

        let path = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const x_mid = (pts[i].x + pts[i + 1].x) / 2;
            const y_mid = (pts[i].y + pts[i + 1].y) / 2;
            const cp_x1 = (x_mid + pts[i].x) / 2;
            const cp_x2 = (x_mid + pts[i + 1].x) / 2;
            path += ` Q ${cp_x1},${pts[i].y} ${x_mid},${y_mid}`;
            path += ` Q ${cp_x2},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`;
        }
        return path;
    };

    // Generate SVG path for the line and area
    const linePath = createPath(points);
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x},${chartHeight - padding.bottom} L ${points[0].x},${chartHeight - padding.bottom} Z`
        : "";

    return (
        <Box ref={chartContainerRef}> {/* Attach ref to the outer Box */}
            <Box sx={{ position: 'relative', height: chartHeight, width: '100%' ,padding:"1%"}}>
                <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <path d={areaPath} fill="url(#areaGradient)" />

                    <path
                        d={linePath}
                        fill="none"
                        stroke={theme.palette.primary.main}
                        strokeWidth="3"
                        strokeLinecap="round"
                        sx={{
                            strokeDasharray: 1000,
                            strokeDashoffset: 1000,
                            animation: 'dash 1.5s ease-out forwards',
                            '@keyframes dash': { to: { strokeDashoffset: 0 } },
                        }}
                    />

                    {points.map((point) => (
                        <Tooltip title={`${point.status}: ${point.count.toLocaleString()}`} key={point.status} placement="top">
                            <g>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="6"
                                    fill={theme.palette.background.paper}
                                    stroke={theme.palette[point.color]?.main || theme.palette.primary.main}
                                    strokeWidth="3"
                                    style={{ cursor: 'pointer', transition: 'r 0.2s ease, fill 0.2s ease' }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.setAttribute('r', '8');
                                        e.currentTarget.style.fill = theme.palette[point.color]?.light || theme.palette.primary.light;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.setAttribute('r', '6');
                                        e.currentTarget.style.fill = theme.palette.background.paper;
                                    }}
                                />
                            </g>
                        </Tooltip>
                    ))}

                    {points.map(point => (
                        <text
                            key={`label-${point.status}`}
                            x={point.x} // X position of the label
                            y={chartHeight - padding.bottom + 30} // Adjusted Y position for more space
                            textAnchor="end" // Align text to the end for rotation
                            fill={theme.palette.text.secondary}
                            style={{ fontSize: '10px', fontWeight: 600, whiteSpace: 'nowrap' }} // Added whiteSpace: 'nowrap' to prevent wrapping
                        >
                            {point.status}
                        </text>
                    ))}
                </svg>
            </Box>
        </Box>
    );
};

export default LineChart;
