import React from 'react';
import { Target, AlertCircle, Zap } from 'lucide-react';

const ActionPlanPanel = ({ actionPlan = [] }) => {
    const getIcon = (idx) => {
        if (idx === 0) return <Target size={20} className="text-blue" />;
        if (idx === 1) return <AlertCircle size={20} className="text-yellow" />;
        return <Zap size={20} className="text-purple" />;
    };

    return (
        <div className="action-plan-panel">
            <h3>Personalized Action Plan</h3>
            <div className="plan-list">
                {actionPlan.length > 0 ? (
                    actionPlan.map((item, idx) => (
                        <div key={idx} className="plan-item">
                            <div className="plan-icon">{getIcon(idx)}</div>
                            <p>{item}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-plan">Great job! Keep maintaining your current performance.</p>
                )}
            </div>
        </div>
    );
};

export default ActionPlanPanel;
