import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Award, Target, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import SkillRadarChart from '../components/training/SkillRadarChart';
import ActionPlanPanel from '../components/training/ActionPlanPanel';
import '../styles.css';

const TrainingReport = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = localStorage.getItem('username') || 'student123';

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/training/report/${userId}`);
                setData(res.data);
            } catch (err) {
                console.error("Report not found");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [userId]);

    if (loading) return <div className="report-loading">Analyzing your performance...</div>;
    if (!data) return <div className="report-loading">No training data found.</div>;

    const { session, analytics } = data;

    const radarData = Object.keys(session.masteryMap).map(topic => ({
        subject: topic,
        A: Math.min(100, (session.masteryMap[topic] || 0) * 10),
        fullMark: 100
    }));

    const getAccuracyColor = (val) => {
        if (val >= 80) return 'text-green';
        if (val >= 60) return 'text-yellow';
        return 'text-red';
    };

    return (
        <div className="training-report-page">
            <div className="report-header">
                <Award className="report-icon" size={48} />
                <h1>Session Analysis Complete</h1>
                <p>You've completed your cognitive workout. Here are your insights.</p>
            </div>

            <div className="report-summary-grid">
                <div className="summary-card">
                    <Target className="icon text-blue" />
                    <div className="details">
                        <span className="val">{Math.round(session.accuracy)}%</span>
                        <span className="lbl">Accuracy</span>
                    </div>
                </div>
                <div className="summary-card">
                    <TrendingUp className="icon text-purple" />
                    <div className="details">
                        <span className="val">{session.avgTimePerQuestion.toFixed(1)}s</span>
                        <span className="lbl">Response Time</span>
                    </div>
                </div>
                <div className="summary-card">
                    <Clock className="icon text-green" />
                    <div className="details">
                        <span className="val">25</span>
                        <span className="lbl">Drills Done</span>
                    </div>
                </div>
            </div>

            <div className="report-main-grid">
                <div className="report-left">
                    <div className="report-card">
                        <h3>Mastery Matrix</h3>
                        <SkillRadarChart data={radarData} />
                    </div>
                    <ActionPlanPanel actionPlan={analytics.actionPlan} />
                </div>

                <div className="report-right">
                    <div className="report-card hotspot-analysis">
                        <h3>Stress Hotspots</h3>
                        {analytics.hotspots.length > 0 ? (
                            <div className="hotspot-list">
                                {analytics.hotspots.map((topic, i) => (
                                    <div key={i} className="hotspot-item">
                                        <span>{topic}</span>
                                        <div className="heat-bar"><div className="fill" style={{ width: '85%' }}></div></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-hotspots">Your cognitive load remained optimal throughout!</p>
                        )}
                    </div>

                    <div className="report-card recommendation">
                        <h3>Next Session Strategy</h3>
                        <p>Based on your performance in <b>{analytics.weakTopics[0] || 'Logic'}</b>, we recommend starting your next session with focused foundational sprints.</p>
                        <button className="secondary-btn" onClick={() => navigate('/training')}>
                            GO TO HUB <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingReport;
