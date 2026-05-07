/**
 * PerformanceAnalyticsEngine.js
 * 
 * Computes deep analytics from raw performance snapshots.
 * Formulas focused on productivity, efficiency, and cognitive load.
 */

export const analyzePerformance = (snapshots = []) => {
    if (snapshots.length === 0) return null;

    const totalQuestions = snapshots.length;
    const correctCount = snapshots.filter(s => s.correctness).length;

    // 1. Accuracy Score (%)
    const accuracyScore = (correctCount / totalQuestions) * 100;

    // 2. Efficiency Score (Correct answers per minute)
    const totalTimeSeconds = snapshots.reduce((acc, s) => acc + s.timeTakenSeconds, 0);
    const totalTimeMinutes = totalTimeSeconds / 60;
    const efficiencyScore = totalTimeMinutes > 0 ? correctCount / totalTimeMinutes : 0;

    // 3. Productivity Index (Active vs Hesitation/Idle time)
    const totalHesitationSeconds = snapshots.reduce((acc, s) => acc + s.hesitationTimeSeconds, 0);
    const activeTimeSeconds = totalTimeSeconds - totalHesitationSeconds;
    const productivityIndex = totalTimeSeconds > 0 ? (activeTimeSeconds / totalTimeSeconds) * 100 : 0;

    // 4. Avg Stress Level
    const avgStress = snapshots.reduce((acc, s) => acc + s.stressLevel, 0) / totalQuestions;

    // 5. Stress Hotspots (Questions with stress > 70)
    const stressHotspots = snapshots
        .filter(s => s.stressLevel > 70)
        .map(s => `Q${s.questionId.substring(0, 4)}...`);

    // 6. Topic Strength Map
    const topicMap = {};
    snapshots.forEach(s => {
        if (!topicMap[s.topicTag]) {
            topicMap[s.topicTag] = { total: 0, correct: 0, time: 0 };
        }
        topicMap[s.topicTag].total++;
        topicMap[s.topicTag].time += s.timeTakenSeconds;
        if (s.correctness) topicMap[s.topicTag].correct++;
    });

    const topicPerformance = Object.keys(topicMap).map(tag => ({
        topic: tag,
        accuracy: (topicMap[tag].correct / topicMap[tag].total) * 100,
        avgTime: topicMap[tag].time / topicMap[tag].total
    }));

    // 7. Coaching Suggestions
    const suggestions = [];
    if (accuracyScore < 50) suggestions.push("Review core concepts in high-stress topics.");
    if (productivityIndex < 70) suggestions.push("Reduce hesitation by practicing time-boxed drills.");
    if (avgStress > 60) suggestions.push("Consider cognitive breathing exercises to lower session load.");
    if (efficiencyScore < 0.5) suggestions.push("Focus on increasing solving speed for simple concepts.");

    return {
        accuracyScore: Math.round(accuracyScore),
        efficiencyScore: parseFloat(efficiencyScore.toFixed(2)),
        productivityIndex: Math.round(productivityIndex),
        avgStress: Math.round(avgStress),
        stressHotspots,
        topicPerformance,
        suggestions,
        rawSnapshots: snapshots.map((s, idx) => ({
            name: `Q${idx + 1}`,
            time: s.timeTakenSeconds,
            stress: s.stressLevel,
            hesitation: s.hesitationTimeSeconds
        }))
    };
};
