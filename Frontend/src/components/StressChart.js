// src/components/StressChart.js
import React from 'react';

const StressChart = ({ timeline }) => {
    if (!timeline || timeline.length === 0) return <p>No stress data available.</p>;

    const width = 800;
    const height = 300;
    const padding = 40;

    const startTime = new Date(timeline[0].timestamp).getTime();
    const endTime = new Date(timeline[timeline.length - 1].timestamp).getTime();
    const timeRange = Math.max(1, endTime - startTime);

    const getPoints = (key) => {
        return timeline.map((entry, i) => {
            const x = padding + ((new Date(entry.timestamp).getTime() - startTime) / timeRange) * (width - 2 * padding);
            const val = entry[key] || 0;
            const y = height - padding - (val / 100) * (height - 2 * padding);
            return `${x},${y}`;
        }).join(' ');
    };

    const lines = [
        { key: 'visualScore', color: '#8a2be2', label: 'Visual' },
        { key: 'voiceScore', color: '#ff00ff', label: 'Voice' },
        { key: 'typingScore', color: '#00d4ff', label: 'Typing' },
        { key: 'overallScore', color: '#ffffff', label: 'Overall', width: 3 }
    ];

    return (
        <div className="stress-chart-outer">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="stress-svg" preserveAspectRatio="none">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map(val => {
                    const y = height - padding - (val / 100) * (height - 2 * padding);
                    return (
                        <g key={val}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" />
                            <text x={padding - 35} y={y + 5} fontSize="12" fill="rgba(255,255,255,0.4)" fontWeight="600">{val}%</text>
                        </g>
                    );
                })}

                {/* Vertical Grid Lines */}
                {timeline.filter((_, i) => i % Math.max(1, Math.floor(timeline.length / 5)) === 0).map((entry, i) => {
                    const x = padding + ((new Date(entry.timestamp).getTime() - startTime) / timeRange) * (width - 2 * padding);
                    return <line key={i} x1={x} y1={padding} x2={x} y2={height - padding} stroke="rgba(255,255,255,0.03)" />;
                })}

                {/* Stress Lines */}
                {lines.map(line => (
                    <polyline
                        key={line.key}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={line.width || 2}
                        points={getPoints(line.key)}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                ))}

                {/* Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" />
            </svg>

            <div className="chart-legend">
                {lines.map(line => (
                    <div key={line.key} className="legend-item">
                        <span className="legend-color" style={{ background: line.color }}></span>
                        <span>{line.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StressChart;
