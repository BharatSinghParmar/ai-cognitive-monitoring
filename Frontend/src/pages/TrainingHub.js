import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, Trophy, History, Zap, Play } from 'lucide-react';
import XPProgressBar from '../components/training/XPProgressBar';
import SkillRadarChart from '../components/training/SkillRadarChart';
import '../styles.css';

const TrainingHub = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = localStorage.getItem('username') || 'student123';

    useEffect(() => {
        const fetchLatestReport = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/training/report/${userId}`);
                setReport(res.data);
            } catch (err) {
                console.log("No previous reports found");
            } finally {
                setLoading(false);
            }
        };
        fetchLatestReport();
    }, [userId]);

    const radarData = report ? Object.keys(report.session.masteryMap).map(topic => ({
        subject: topic,
        A: Math.min(100, (report.session.masteryMap[topic] || 0) * 10),
        fullMark: 100
    })) : [
        { subject: 'Logic', A: 40, fullMark: 100 },
        { subject: 'Memory', A: 30, fullMark: 100 },
        { subject: 'Attention', A: 20, fullMark: 100 },
        { subject: 'Verbal', A: 50, fullMark: 100 },
        { subject: 'Math', A: 30, fullMark: 100 }
    ];

    return (
        <div className="training-hub">
            <div className="hub-hero">
                <div className="hero-content">
                    <h1>Cognitive Growth Lab</h1>
                    <p>Sharpen your mind with adaptive, stress-aware training drills.</p>
                    <button className="start-training-btn" onClick={() => navigate('/training/session')}>
                        <Play size={20} fill="currentColor" /> ENTER ARENA
                    </button>
                </div>
                <div className="hero-stats">
                    <XPProgressBar currentXP={450} level={4} nextLevelXP={1000} />
                </div>
            </div>

            <div className="hub-grid">
                <div className="hub-card skill-matrix">
                    <div className="card-header">
                        <Brain size={20} className="text-purple" />
                        <h3>Cognitive Fingerprint</h3>
                    </div>
                    <SkillRadarChart data={radarData} />
                </div>

                <div className="hub-card stats-overview">
                    <div className="card-header">
                        <Zap size={20} className="text-yellow" />
                        <h3>Performance Snapshot</h3>
                    </div>
                    <div className="stats-row">
                        <div className="stat-box">
                            <label>AVG ACCURACY</label>
                            <span>{report ? Math.round(report.session.accuracy) : '--'}%</span>
                        </div>
                        <div className="stat-box">
                            <label>COGNITIVE SPEED</label>
                            <span>{report ? report.session.avgTimePerQuestion.toFixed(1) : '--'}s</span>
                        </div>
                    </div>
                    <div className="recent-activity">
                        <h4>Recent Milestones</h4>
                        <div className="milestone-item">
                            <Trophy size={16} className="text-gold" />
                            <p>Reached Level 4 in Logic Reasoning</p>
                        </div>
                        <div className="milestone-item">
                            <History size={16} className="text-blue" />
                            <p>Completed 5 sessions this week</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="training-modes">
                <h3>Daily Challenges</h3>
                <div className="modes-grid">
                    <div className="mode-card locked">
                        <div className="mode-overlay">Coming Soon</div>
                        <h4>Concentration Sprint</h4>
                        <p>Enhance sustained focus under pressure.</p>
                    </div>
                    <div className="mode-card locked">
                        <div className="mode-overlay">Coming Soon</div>
                        <h4>Memory Palace</h4>
                        <p>Build advanced spatial recall techniques.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingHub;
