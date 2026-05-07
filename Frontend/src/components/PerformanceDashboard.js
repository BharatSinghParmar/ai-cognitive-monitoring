import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { analyzePerformance } from '../utils/PerformanceAnalyticsEngine';
import {
    Zap, Brain, Clock, Target, TrendingUp, AlertTriangle, Lightbulb
} from 'lucide-react';
import '../styles.css';

const PerformanceDashboard = ({ examId, studentId, onClose }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const sId = String(studentId);
                const eId = String(examId);
                const res = await axios.get(`http://localhost:5001/api/performance/report/${eId}/${sId}`);
                if (res.data.success) {
                    const stats = analyzePerformance(res.data.snapshots);
                    setAnalytics(stats);
                }
            } catch (err) {
                console.error('Error fetching performance stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, [examId, studentId]);

    if (loading) return <div className="loading">Initializing Intelligence Core...</div>;
    if (!analytics) return <div className="no-data">No performance snapshots available for this session.</div>;

    const COLORS = ['#a855f7', '#f0abfc', '#6366f1', '#ec4899'];

    return (
        <div className="modal-overlay">
            <div className="modal-content performance-dashboard-modal" style={{ maxWidth: '1200px', width: '98%' }}>
                <div className="modal-header">
                    <div className="header-title">
                        <h2 className="glow-text">Cognitive Performance Intelligence</h2>
                        <span className="subtitle">Real-time Productivity & Efficiency Analysis</span>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="kpi-grid">
                    <div className="kpi-card glass">
                        <div className="kpi-icon"><Target size={24} /></div>
                        <div className="kpi-info">
                            <label>Accuracy</label>
                            <h3>{analytics.accuracyScore}%</h3>
                        </div>
                    </div>
                    <div className="kpi-card glass">
                        <div className="kpi-icon"><Zap size={24} /></div>
                        <div className="kpi-info">
                            <label>Efficiency</label>
                            <h3>{analytics.efficiencyScore} <span className="unit">ans/min</span></h3>
                        </div>
                    </div>
                    <div className="kpi-card glass">
                        <div className="kpi-icon"><TrendingUp size={24} /></div>
                        <div className="kpi-info">
                            <label>Productivity</label>
                            <h3>{analytics.productivityIndex}%</h3>
                        </div>
                    </div>
                    <div className="kpi-card glass">
                        <div className="kpi-icon"><Brain size={24} /></div>
                        <div className="kpi-info">
                            <label>Avg Stress</label>
                            <h3>{analytics.avgStress}%</h3>
                        </div>
                    </div>
                </div>

                <div className="charts-main-grid">
                    <div className="chart-container glass">
                        <h4>Stress vs. Response Time</h4>
                        <div className="chart-box" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.rawSnapshots}>
                                    <defs>
                                        <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ background: '#0d0221', border: '1px solid var(--accent-glow)', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="stress" stroke="#a855f7" fillOpacity={1} fill="url(#colorStress)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="time" stroke="#f0abfc" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-container glass">
                        <h4>Topic Proficiency Map</h4>
                        <div className="chart-box" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.topicPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="topic" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ background: '#0d0221', border: '1px solid var(--accent-glow)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="accuracy" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="avgTime" fill="#f0abfc" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="insights-footer">
                    <div className="coaching-panel glass">
                        <div className="panel-header">
                            <Lightbulb className="icon" size={20} />
                            <h4>AI Coaching Suggestions</h4>
                        </div>
                        <ul className="suggestion-list">
                            {analytics.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>

                    <div className="hotspots-panel glass">
                        <div className="panel-header">
                            <AlertTriangle className="icon" size={20} />
                            <h4>Cognitive Hotspots</h4>
                        </div>
                        <div className="hotspot-tags">
                            {analytics.stressHotspots.length > 0 ? (
                                analytics.stressHotspots.map((h, i) => <span key={i} className="hotspot-badge">{h}</span>)
                            ) : (
                                <span className="nominal">Normal Load Distribution</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
