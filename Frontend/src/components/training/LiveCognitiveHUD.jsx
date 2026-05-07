import React from 'react';

const LiveCognitiveHUD = ({ stress, accuracy, focus }) => {
    const getStressColor = (val) => {
        if (val < 30) return '#00ff88'; // Calm
        if (val < 70) return '#ffcc00'; // Moderate
        return '#ff4d4d'; // High
    };

    return (
        <div className="cognitive-hud">
            <div className="hud-metric">
                <label>COGNITIVE LOAD</label>
                <div className="metric-value" style={{ color: getStressColor(stress) }}>
                    {Math.round(stress)}%
                </div>
            </div>
            <div className="hud-metric">
                <label>FOCUS INDEX</label>
                <div className="metric-value">
                    {Math.round(focus)}%
                </div>
            </div>
            <div className="hud-metric">
                <label>ACCURACY</label>
                <div className="metric-value accent">
                    {Math.round(accuracy)}%
                </div>
            </div>
        </div>
    );
};

export default LiveCognitiveHUD;
