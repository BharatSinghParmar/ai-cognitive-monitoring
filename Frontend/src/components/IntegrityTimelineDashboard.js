import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

const IntegrityTimelineDashboard = ({ examId, studentId, onClose }) => {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [summary, setSummary] = useState({ score: 100, risk: 'Low' });

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const sId = String(studentId);
                const eId = String(examId);
                const res = await axios.get(`http://localhost:5001/api/integrity/timeline/${eId}/${sId}`);
                if (res.data.success) {
                    setTimeline(res.data.timeline);

                    // Fetch final score from exam-responses if available
                    const responseRes = await axios.get(`http://localhost:5001/api/exam-responses`);
                    const myResponse = responseRes.data.find(r =>
                        String(r.examId) === String(examId) && String(r.studentId) === String(studentId)
                    );
                    if (myResponse) {
                        setSummary({
                            score: myResponse.integrityScore || 100,
                            risk: myResponse.riskLevel || 'Low'
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching integrity data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeline();
    }, [examId, studentId]);

    const filteredEvents = filter === 'ALL'
        ? timeline
        : timeline.filter(e => e.eventType === filter);

    if (loading) return <div className="loading">Initializing Neural Timeline...</div>;

    return (
        <div className="modal-overlay">
            <div className="modal-content integrity-dashboard-modal" style={{ maxWidth: '1000px', width: '95%' }}>
                <div className="modal-header">
                    <h2 className="glow-text">Cognitive Integrity Analysis</h2>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="integrity-summary-grid">
                    <div className="integrity-gauge-container">
                        <div className={`integrity-gauge ${summary.risk.toLowerCase()}`}>
                            <svg viewBox="0 0 100 100">
                                <circle className="gauge-bg" cx="50" cy="50" r="45" />
                                <circle className="gauge-fill" cx="50" cy="50" r="45"
                                    style={{ strokeDasharray: `${(summary.score / 100) * 283} 283` }} />
                            </svg>
                            <div className="gauge-value">
                                <span className="score-num">{summary.score}</span>
                                <span className="score-label">INTEGRITY</span>
                            </div>
                        </div>
                        <div className={`risk-badge ${summary.risk.toLowerCase()}`}>{summary.risk} RISK</div>
                    </div>

                    <div className="integrity-stats-panel">
                        <div className="stat-card">
                            <label>Candidate</label>
                            <p>{studentId}</p>
                        </div>
                        <div className="stat-card">
                            <label>Total Events</label>
                            <p>{timeline.length}</p>
                        </div>
                        <div className="stat-card">
                            <label>Major Drops</label>
                            <p>{timeline.filter(e => e.severity === 'high').length}</p>
                        </div>
                    </div>
                </div>

                <div className="timeline-controls">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="glass-select">
                        <option value="ALL">All Events</option>
                        <option value="TAB_SWITCH">Tab Switches</option>
                        <option value="COPY_PASTE">Clipboard Violations</option>
                        <option value="FACE_MISSING">Biometric Anomaly</option>
                        <option value="STRESS_SPIKE">Cognitive Load Spikes</option>
                    </select>
                </div>

                <div className="integrity-timeline">
                    {filteredEvents.length === 0 ? (
                        <p className="no-events">No integrity events recorded for this session.</p>
                    ) : (
                        filteredEvents.map((event, index) => (
                            <div key={index} className={`timeline-event ${event.severity}`}>
                                <div className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</div>
                                <div className="event-dot"></div>
                                <div className="event-content glass">
                                    <div className="event-header">
                                        <span className="event-type">{event.eventType.replace('_', ' ')}</span>
                                        <span className={`severity-tag ${event.severity}`}>{event.severity}</span>
                                    </div>
                                    <p className="event-explanation">{event.explanationText}</p>
                                    <div className="event-impact">Impact: -{event.integrityImpact} pts</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntegrityTimelineDashboard;
