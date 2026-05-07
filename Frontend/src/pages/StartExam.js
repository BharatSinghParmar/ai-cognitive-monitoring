// src/pages/StartExam.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BehaviorMonitor from '../components/BehaviorMonitor';
import { calculateIntegrityScore, RISK_WEIGHTS, getSeverity } from '../utils/IntegrityScoreEngine';
import '../styles.css';

const StartExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [stressTimeline, setStressTimeline] = useState([]);
  const [currentStress, setCurrentStress] = useState({ visual: 0, voice: 0, typing: 0 });
  const [warningCountDisplay, setWarningCountDisplay] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFullScreenModal, setShowFullScreenModal] = useState(true);
  const [exam, setExam] = useState(null);
  const [message, setMessage] = useState('');
  const [examLocked, setExamLocked] = useState(false);
  const [responses, setResponses] = useState({});

  // Integrity Status State
  const [integrityScore, setIntegrityScore] = useState(100);
  const [integrityEvents, setIntegrityEvents] = useState([]);
  const [riskLevel, setRiskLevel] = useState('Low');
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [eventCounts, setEventCounts] = useState({
    TAB_SWITCH: 0,
    COPY_PASTE: 0,
    FACE_MISSING: 0,
    MULTIPLE_FACES: 0,
    STRESS_SPIKE: 0
  });

  const stressSpikeTimerRef = useRef(null);

  // Typing Analysis Refs
  const lastKeyTimeRef = useRef(Date.now());
  const typingSpeedsRef = useRef([]);

  // Performance Tracking Refs
  const performanceDataRef = useRef({}); // { [qId]: { timeTaken: 0, hesitation: 0, stressSamples: [], lastFocusTime: null } }
  const questionStressSamplesRef = useRef([]); // Keep for backward compatibility with current hud

  // Warning count local variable (sync with state for parent-child communication)
  const warningCountRef = useRef(0);

  // Full-screen request
  const requestFullScreen = async () => {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullScreen(true);
      setShowFullScreenModal(false);
    } catch (err) {
      console.error('Full-screen request failed:', err);
      alert('Full-screen mode is required to take the exam. Redirecting back to My Exams.');
      navigate('/my-exams');
    }
  };

  // Ref to collect stress timeline entries (most stable source)
  const timelineBufferRef = useRef([]);

  // Stress Aggregation & Recording
  // Ref to hold latest stress values for the interval
  const currentStressRef = useRef(currentStress);
  useEffect(() => {
    currentStressRef.current = currentStress;
  }, [currentStress]);

  // Stress Aggregation & Recording
  useEffect(() => {
    // Only record if the exam has actually started (modal is gone)
    if (showFullScreenModal) return;

    console.log("Initializing persistent stress recording (fail-safe enabled)...");

    // Reset buffer for new exam attempt
    timelineBufferRef.current = [];
    localStorage.removeItem('active_stress_timeline');

    const captureSample = () => {
      try {
        const stats = currentStressRef.current;
        const overall = (stats.visual + stats.voice + stats.typing) / 3;
        const entry = {
          timestamp: new Date().toISOString(),
          visualScore: stats.visual || 0,
          voiceScore: stats.voice || 0,
          typingScore: stats.typing || 0,
          overallScore: overall || 0
        };

        timelineBufferRef.current.push(entry);

        // Sync to state for chart/ui
        setStressTimeline([...timelineBufferRef.current]);

        // Fail-safe: sync to localStorage
        localStorage.setItem('active_stress_timeline', JSON.stringify(timelineBufferRef.current));

        console.log(`[STRESS RECORD] Sample #${timelineBufferRef.current.length} captured.`, entry);
      } catch (err) {
        console.error("Capture Sample Error:", err);
      }
    };

    // Capture first sample
    captureSample();

    const interval = setInterval(captureSample, 4000); // 4 seconds interval for stability

    return () => {
      console.log("Stopping stress recording interval.");
      clearInterval(interval);
    };
  }, [showFullScreenModal]); // Start as soon as modal is closed


  // Typing analysis: logic to measure keystroke dynamics
  const handleTypingActivity = () => {
    const now = Date.now();
    const diff = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    if (diff < 2000) { // Ignore long pauses
      typingSpeedsRef.current.push(diff);
      if (typingSpeedsRef.current.length > 10) {
        typingSpeedsRef.current.shift();
      }

      // Heuristic: Highly inconsistent or very fast typing might indicate stress
      const avgSpeed = typingSpeedsRef.current.reduce((a, b) => a + b, 0) / typingSpeedsRef.current.length;
      const variance = typingSpeedsRef.current.reduce((a, b) => a + Math.pow(b - avgSpeed, 2), 0) / typingSpeedsRef.current.length;

      const typingStress = Math.min(100, (variance / 5000) * 100);
      handleStressUpdate('typing', typingStress);
    }
  };

  // Proctoring logic
  useEffect(() => {
    if (!isFullScreen) return;

    const checkWarnings = () => {
      if (warningCountRef.current >= 3) {
        handleLockExam(true); // Auto-submit
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        warningCountRef.current++;
        setWarningCountDisplay(warningCountRef.current);

        logIntegrityEvent('TAB_SWITCH', RISK_WEIGHTS.TAB_SWITCH, 'Tab switch detected (Visibility Change)');

        alert(`Warning ${warningCountRef.current}: Do not switch tabs.`);
        checkWarnings();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        warningCountRef.current++;
        setWarningCountDisplay(warningCountRef.current);

        logIntegrityEvent('TAB_SWITCH', RISK_WEIGHTS.TAB_SWITCH, 'Exited full-screen mode');

        alert(`Warning ${warningCountRef.current}: Please remain in full-screen mode.`);
        checkWarnings();
      }
    };

    const handleKeyDown = (e) => {
      handleTypingActivity();
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        logIntegrityEvent('COPY_PASTE', RISK_WEIGHTS.COPY_PASTE, `Keyboard violation: ${e.key.toUpperCase()} operation blocked`);
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isFullScreen, navigate]);

  // Fetch exam
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/exams/${examId}`);
        if (res.data) setExam(res.data);
        else setMessage('No exam available.');
      } catch (error) {
        console.error('Error fetching exam:', error);
        setMessage('Error fetching exam details.');
      }
    };
    fetchExam();
  }, [examId]);

  // Integrity Event Logging
  const logIntegrityEvent = async (type, impact, text) => {
    try {
      const username = localStorage.getItem('username') || 'student123';
      const eventData = {
        userId: username,
        examId: examId,
        eventType: type,
        severity: getSeverity(impact),
        integrityImpact: impact,
        explanationText: text
      };

      // Update Local State
      setEventCounts(prev => {
        const newCounts = { ...prev, [type]: prev[type] + 1 };
        const newEvents = [...integrityEvents, eventData];
        const { integrityScore: newScore, riskLevel: newRisk } = calculateIntegrityScore(newCounts, newEvents);

        setIntegrityScore(newScore);
        setRiskLevel(newRisk);
        setIntegrityEvents(newEvents);

        return newCounts;
      });

      // API Call
      await axios.post('http://localhost:5001/api/integrity/log-event', eventData);
    } catch (err) {
      console.error('Error logging integrity event:', err);
    }
  };

  const handleStressUpdate = useCallback((type, score) => {
    setCurrentStress(prev => {
      const updated = { ...prev, [type]: score };

      // Track stress samples for current question
      const overall = (updated.visual + updated.voice + updated.typing) / 3;
      questionStressSamplesRef.current.push(overall);

      // Track per-question stress if active
      if (activeQuestionId) {
        if (!performanceDataRef.current[activeQuestionId]) {
          performanceDataRef.current[activeQuestionId] = { timeTaken: 0, hesitation: 0, stressSamples: [], lastFocusTime: Date.now() };
        }
        performanceDataRef.current[activeQuestionId].stressSamples.push(overall);
      }

      // Stress Spike Detection: Sustained > 75 for 60s
      if (overall > 75) {
        if (!stressSpikeTimerRef.current) {
          stressSpikeTimerRef.current = setTimeout(() => {
            logIntegrityEvent('STRESS_SPIKE', RISK_WEIGHTS.STRESS_SPIKE, 'Sustained high cognitive load detected (>60s)');
            stressSpikeTimerRef.current = null; // Reset to allow future spikes if persistent
          }, 60000);
        }
      } else {
        if (stressSpikeTimerRef.current) {
          clearTimeout(stressSpikeTimerRef.current);
          stressSpikeTimerRef.current = null;
        }
      }

      return updated;
    });
  }, [examId, integrityEvents]); // Add dependencies if needed

  const handleWarning = useCallback((count) => {
    warningCountRef.current = count;
    setWarningCountDisplay(count);

    logIntegrityEvent('FACE_MISSING', RISK_WEIGHTS.FACE_MISSING, `Biometric anomaly: Face detection failed (Warning #${count})`);

    alert(`Warning ${count}: Please focus on the exam (Face must be visible > 30%).`);
  }, [examId, integrityEvents]);

  const handleLockExam = useCallback((autoSubmit = false) => {
    if (autoSubmit) {
      alert('Maximum warnings reached. The exam will be automatically submitted.');
      // Direct call to handleSubmit with current state
      triggerAutoSubmit();
    } else {
      setExamLocked(true);
      alert('Exam locked due to suspicious activity.');
    }
  }, []);


  const triggerAutoSubmit = () => {
    handleSubmit(null, true);
  };

  const handleResponseChange = (questionId, value) => {
    // Record first activity for hesitation tracking
    if (!performanceDataRef.current[questionId]) {
      performanceDataRef.current[questionId] = { timeTaken: 0, hesitation: 0, stressSamples: [], lastFocusTime: Date.now() };
    }

    if (!performanceDataRef.current[questionId].hesitation && performanceDataRef.current[questionId].lastFocusTime) {
      const now = Date.now();
      performanceDataRef.current[questionId].hesitation = Math.round((now - performanceDataRef.current[questionId].lastFocusTime) / 1000);
    }
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleQuestionFocus = (questionId) => {
    const now = Date.now();

    // Update time for previous question
    if (activeQuestionId && performanceDataRef.current[activeQuestionId]) {
      const timeSpent = Math.round((now - performanceDataRef.current[activeQuestionId].lastFocusTime) / 1000);
      performanceDataRef.current[activeQuestionId].timeTaken += timeSpent;
    }

    setActiveQuestionId(questionId);

    // Initialize current question if needed
    if (!performanceDataRef.current[questionId]) {
      performanceDataRef.current[questionId] = { timeTaken: 0, hesitation: 0, stressSamples: [], lastFocusTime: now };
    } else {
      performanceDataRef.current[questionId].lastFocusTime = now;
    }
  };

  const getCorrectness = (question, answer) => {
    if (question.type === 'multiple_choice') {
      return Number(answer) === Number(question.correctAnswer);
    }
    // Descriptive correctness could be checked via similarity later, 
    // but for snapshot purposes, let's just mark it if not empty.
    return !!answer;
  };

  const logPerformanceSnapshot = async (questionId, isCorrect = false, topic = 'General') => {
    try {
      const data = performanceDataRef.current[questionId] || { timeTaken: 0, hesitation: 0, stressSamples: [] };

      // If still focusing this question at end, update time
      if (activeQuestionId === questionId && data.lastFocusTime) {
        data.timeTaken += Math.round((Date.now() - data.lastFocusTime) / 1000);
      }

      const avgStress = data.stressSamples.length > 0
        ? data.stressSamples.reduce((a, b) => a + b, 0) / data.stressSamples.length
        : 0;

      const snapshot = {
        userId: localStorage.getItem('username') || 'student123',
        examId: examId,
        questionId: questionId,
        topicTag: topic,
        timeTakenSeconds: data.timeTaken || 10, // Fallback to 10s if no data
        stressLevel: Math.round(avgStress),
        correctness: isCorrect,
        hesitationTimeSeconds: data.hesitation || 2 // Fallback to 2s
      };

      await axios.post('http://localhost:5001/api/performance/log', snapshot);
    } catch (err) {
      console.error('Error logging performance snapshot:', err);
    }
  };

  const handleSubmit = async (e, isAuto = false) => {
    if (e) e.preventDefault();
    if (!exam) return;

    // Use the latest buffer, try recovery if empty
    let timeline = timelineBufferRef.current;
    if (timeline.length === 0) {
      console.warn("Buffer empty, attempting recovery from localStorage...");
      const saved = localStorage.getItem('active_stress_timeline');
      if (saved) timeline = JSON.parse(saved);
    }

    // Calculate final stress level
    const finalAvgStress = timeline.length > 0
      ? timeline.reduce((a, b) => a + b.overallScore, 0) / timeline.length
      : 0;

    let stressLabel = 'Normal';
    if (finalAvgStress > 70) stressLabel = 'Extreme';
    else if (finalAvgStress > 40) stressLabel = 'High';

    const submission = {
      examId: exam._id,
      studentId: localStorage.getItem('username') || 'student123',
      responses: exam.questions.map((q) => ({
        questionId: String(q._id || q.questionText),
        answer: responses[q._id || q.questionText] || ''
      })),
      stressLevel: stressLabel,
      stressTimeline: timeline,
      warningCount: warningCountRef.current,
      isAutoSubmitted: isAuto,
      integrityScore: integrityScore,
      riskLevel: riskLevel
    };

    // Log all performance snapshots at the end
    for (const q of exam.questions) {
      const qId = q._id || q.questionText;
      const isCorrect = getCorrectness(q, responses[qId]);
      await logPerformanceSnapshot(qId, isCorrect, q.topic || 'General');
    }

    try {
      await axios.post('http://localhost:5001/api/exam-responses/submit', submission);
      localStorage.removeItem('active_stress_timeline'); // Clear on success
      setMessage(`Exam ${isAuto ? 'automatically ' : ''}submitted successfully!`);

      alert('Exam is over. You will be redirected to the home page in 10 seconds.');
      setTimeout(() => {
        // Clear full screen before redirect
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => { });
        }
        navigate('/');
      }, 10000);
    } catch (error) {
      console.error('Error submitting exam:', error);
      setMessage('Error submitting exam.');
    }
  };

  if (examLocked) {
    return (
      <div className="exam-container">

        <div className="exam-content">
          <h2>Exam Locked</h2>
          <p>The exam has been locked due to suspicious activity.</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="exam-container">

        <div className="exam-content">
          <p>{message || 'Loading exam details...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-container">

      {showFullScreenModal && (
        <div className="fullscreen-modal">
          <h2>Please allow full-screen mode to start the exam</h2>
          <button onClick={requestFullScreen} className="fullscreen-btn">
            Go Full Screen & Start Exam
          </button>
        </div>
      )}
      {!showFullScreenModal && (
        <div className="exam-content">
          <div className="exam-left">
            <h2>{exam.title}</h2>
            <p>Duration: {exam.duration} minutes</p>
            <form onSubmit={handleSubmit} className="exam-form">
              {exam.questions.map((question, index) => (
                <div key={index} className="question-group" onFocus={() => handleQuestionFocus(question._id || question.questionText)}>
                  <p>{question.questionText}</p>
                  {question.options && question.options.length > 0 ? (
                    <div className="options-group">
                      {question.options.map((option, idx) => (
                        <label key={idx} className="option-label">
                          <input
                            type="radio"
                            name={question._id || question.questionText}
                            value={idx}  // Use index as value
                            onChange={(e) =>
                              handleResponseChange(
                                question._id || question.questionText,
                                Number(e.target.value)
                              )
                            }
                            required
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Your answer"
                      onChange={(e) =>
                        handleResponseChange(
                          question._id || question.questionText,
                          e.target.value
                        )
                      }
                      required
                    />
                  )}
                </div>
              ))}
              <button type="submit" className="submit-exam-btn">
                Submit Exam
              </button>
            </form>
            {message && <p className="message">{message}</p>}
          </div>
          <div className="exam-right">
            <div className="live-stress-dashboard">
              <h3 style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', letterSpacing: '2px', textAlign: 'center', marginBottom: '25px', fontWeight: '800' }}>COGNITIVE HUD</h3>
              <div className="stress-stat">
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '1px' }}>VISUAL BIOMETRICS</span>
                <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.05)', height: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px' }}>
                  <div className="fill" style={{ width: `${currentStress.visual}%`, background: currentStress.visual > 70 ? 'var(--accent-secondary)' : 'var(--accent-primary)', boxShadow: `0 0 15px ${currentStress.visual > 70 ? 'var(--accent-secondary)' : 'var(--accent-primary)'}`, borderRadius: '5px' }}></div>
                </div>
                <span style={{ fontSize: '0.85rem', textAlign: 'right', fontWeight: '800', color: '#fff' }}>{Math.round(currentStress.visual)}%</span>
              </div>
              <div className="stress-stat">
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '1px' }}>ACOUSTIC FEEDBACK</span>
                <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.05)', height: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px' }}>
                  <div className="fill" style={{ width: `${currentStress.voice}%`, background: currentStress.voice > 70 ? 'var(--accent-secondary)' : 'var(--accent-primary)', boxShadow: `0 0 15px ${currentStress.voice > 70 ? 'var(--accent-secondary)' : 'var(--accent-primary)'}`, borderRadius: '5px' }}></div>
                </div>
                <span style={{ fontSize: '0.85rem', textAlign: 'right', fontWeight: '800', color: '#fff' }}>{Math.round(currentStress.voice)}%</span>
              </div>
              <div className="stress-stat">
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '1px' }}>KINETIC DYNAMICS</span>
                <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.05)', height: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px' }}>
                  <div className="fill" style={{ width: `${currentStress.typing}%`, background: currentStress.typing > 70 ? 'var(--accent-secondary)' : 'var(--accent-primary)', boxShadow: `0 0 15px ${currentStress.typing > 70 ? 'var(--accent-secondary)' : 'var(--accent-primary)'}`, borderRadius: '5px' }}></div>
                </div>
                <span style={{ fontSize: '0.85rem', textAlign: 'right', fontWeight: '800', color: '#fff' }}>{Math.round(currentStress.typing)}%</span>
              </div>
              <div className="overall-stress-stat" style={{ marginTop: '25px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--accent-glow)' }}>
                <strong style={{ fontSize: '1.1rem', color: '#fff', display: 'block', textAlign: 'center', textShadow: '0 0 10px var(--accent-glow)' }}>TOTAL SESSION LOAD: {Math.round((currentStress.visual + currentStress.voice + currentStress.typing) / 3)}%</strong>
              </div>
            </div>
            <BehaviorMonitor
              onWarning={handleWarning}
              onLockExam={handleLockExam}
              onStressUpdate={handleStressUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StartExam;