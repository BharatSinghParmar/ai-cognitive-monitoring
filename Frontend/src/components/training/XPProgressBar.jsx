import React from 'react';

const XPProgressBar = ({ currentXP, level, nextLevelXP }) => {
    const progress = (currentXP / nextLevelXP) * 100;

    return (
        <div className="xp-container">
            <div className="xp-header">
                <span className="level-badge">LEVEL {level}</span>
                <span className="xp-text">{currentXP} / {nextLevelXP} XP</span>
            </div>
            <div className="xp-bar-bg">
                <div
                    className="xp-bar-fill"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default XPProgressBar;
