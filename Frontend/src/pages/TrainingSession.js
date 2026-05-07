import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Timer, AlertTriangle, ShieldCheck } from 'lucide-react';
import LiveCognitiveHUD from '../components/training/LiveCognitiveHUD';
import QuestionArena from '../components/training/QuestionArena';
import BehaviorMonitor from '../components/BehaviorMonitor';
import '../styles.css';

const TrainingSession = () => {
    const [sessionId, setSessionId] = useState(null);
    const [currentQ, setCurrentQ] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [totalQ, setTotalQ] = useState(25);
    const [stress, setStress] = useState(10);
    const [accuracy, setAccuracy] = useState(100);
    const [correctCount, setCorrectCount] = useState(0);
    const [focus, setFocus] = useState(95);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState(null);

    const navigate = useNavigate();
    const userId = localStorage.getItem('username') || 'student123';

    // Refs for tracking performance during interval
    const stressRef = useRef(10);
    const accuracyRef = useRef(100);

    useEffect(() => {
        const startSession = async () => {
            try {
                const res = await axios.post('http://localhost:5001/api/training/start', { userId });
                setSessionId(res.data._id);
                fetchNextQuestion(res.data._id, null, 10, 0);
            } catch (err) {
                console.error("Failed to start session:", err);
            }
        };
        startSession();
    }, []);

    const fetchNextQuestion = async (sid, correct, currentStress, timeTaken) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5001/api/training/next-question', {
                sessionId: sid,
                lastAnswerCorrect: correct,
                stressLevel: currentStress,
                timeTaken: timeTaken
            });

            if (res.data.isCompleted) {
                completeSession(sid);
            } else {
                setCurrentQ(res.data.question);
                setQIndex(res.data.currentQuestionIndex);
                setTotalQ(res.data.totalQuestions);
                setStartTime(Date.now());
                setLoading(false);
            }
        } catch (err) {
            console.error("Next question error:", err);
        }
    };

    const handleAnswer = (answer) => {
        const isCorrect = answer === currentQ.answer;
        const timeTaken = (Date.now() - startTime) / 1000;

        // Update local metrics
        const newCorrect = isCorrect ? correctCount + 1 : correctCount;
        setCorrectCount(newCorrect);
        const newAccuracy = (newCorrect / qIndex) * 100;
        setAccuracy(newAccuracy);
        accuracyRef.current = newAccuracy;

        fetchNextQuestion(sessionId, isCorrect, stressRef.current, timeTaken);
    };

    const completeSession = async (sid) => {
        try {
            await axios.post('http://localhost:5001/api/training/complete', { sessionId: sid });
            navigate('/training/report');
        } catch (err) {
            console.error("Completion error:", err);
        }
    };

    const handleStressUpdate = (type, value) => {
        // Very basic smoothing for the HUD
        const newStress = Math.round(value);
        setStress(newStress);
        stressRef.current = newStress;
    };

    return (
        <div className="training-session-page">
            <div className="session-top-bar">
                <div className="progress-info">
                    <span className="q-count">QUESTION {qIndex} / {totalQ}</span>
                    <div className="progress-mini-bar">
                        <div className="fill" style={{ width: `${(qIndex / totalQ) * 100}%` }}></div>
                    </div>
                </div>
                <LiveCognitiveHUD stress={stress} accuracy={accuracy} focus={focus} />
            </div>

            <div className="session-main-grid">
                <div className="arena-side">
                    {loading ? (
                        <div className="arena-loading">
                            <div className="loader-pulse"></div>
                            <p>Optimizing next challenge based on your current cognitive state...</p>
                        </div>
                    ) : (
                        <QuestionArena question={currentQ} onAnswer={handleAnswer} />
                    )}
                </div>

                <div className="monitor-side">
                    <div className="monitor-card">
                        <div className="card-header">
                            <ShieldCheck size={18} className="text-green" />
                            <span>COGNITIVE BIO-FEEDBACK</span>
                        </div>
                        <BehaviorMonitor
                            onStressUpdate={handleStressUpdate}
                            onWarning={(w) => console.log("Training Warning:", w)}
                        />
                        <div className="monitor-tips">
                            <p className="tip-title">PRO TIP</p>
                            <p className="tip-text">Maintain steady breathing. High stress triggers foundational reinforcement drills.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingSession;
