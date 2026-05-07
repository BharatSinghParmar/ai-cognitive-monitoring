// src/components/StressRadar.js
import React from 'react';

const StressRadar = ({ summary }) => {
    if (!summary) return null;

    const size = 300;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.4;

    const points = [
        { label: 'Visual', val: summary.visualAvg || 0 },
        { label: 'Voice', val: summary.voiceAvg || 0 },
        { label: 'Typing', val: summary.typingAvg || 0 }
    ];

    const getPoint = (val, angle) => {
        const radius = (val / 100) * r;
        const x = cx + radius * Math.cos(angle - Math.PI / 2);
        const y = cy + radius * Math.sin(angle - Math.PI / 2);
        return `${x},${y}`;
    };

    const getBgPoint = (angle) => {
        const x = cx + r * Math.cos(angle - Math.PI / 2);
        const y = cy + r * Math.sin(angle - Math.PI / 2);
        return `${x},${y}`;
    };

    const polyPoints = points.map((p, i) => getPoint(p.val, (i * 2 * Math.PI) / 3)).join(' ');
    const bgPoints = points.map((_, i) => getBgPoint((i * 2 * Math.PI) / 3)).join(' ');

    return (
        <div className="stress-radar-container" style={{ textAlign: 'center' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background Triangle */}
                <polygon points={bgPoints} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                {[0.25, 0.5, 0.75].map(scale => (
                    <polygon
                        key={scale}
                        points={points.map((_, i) => {
                            const angle = (i * 2 * Math.PI) / 3;
                            const x = cx + (r * scale) * Math.cos(angle - Math.PI / 2);
                            const y = cy + (r * scale) * Math.sin(angle - Math.PI / 2);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                    />
                ))}

                {/* Data Shape */}
                <polygon points={polyPoints} fill="rgba(138, 43, 226, 0.3)" stroke="#8a2be2" strokeWidth="2" />

                {/* Labels */}
                {points.map((p, i) => {
                    const angle = (i * 2 * Math.PI) / 3;
                    const x = cx + (r + 25) * Math.cos(angle - Math.PI / 2);
                    const y = cy + (r + 25) * Math.sin(angle - Math.PI / 2);
                    return (
                        <text key={p.label} x={x} y={y} textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">
                            {p.label}: {Math.round(p.val)}%
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

export default StressRadar;
