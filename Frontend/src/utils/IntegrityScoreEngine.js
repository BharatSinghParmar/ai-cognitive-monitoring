/**
 * IntegrityScoreEngine.js
 * 
 * Computes a unified Integrity Score (0–100) based on proctoring events.
 * This is an AI-based risk indicator, not a final cheating verdict.
 */

export const RISK_WEIGHTS = {
    TAB_SWITCH: 8,
    COPY_PASTE: 15,
    FACE_MISSING: 20,
    MULTIPLE_FACES: 25,
    STRESS_SPIKE: 10 // Sustained high stress (>75) for a period
};

/**
 * Calculates the current integrity score and risk level.
 * 
 * @param {Object} eventCounts - Object containing counts of various violations
 * @param {Array} events - List of all logged integrity events
 * @returns {Object} { integrityScore, riskLevel, reasons }
 */
export const calculateIntegrityScore = (eventCounts = {}, events = []) => {
    let penaltyTotal = 0;

    // Apply weights
    penaltyTotal += (eventCounts.TAB_SWITCH || 0) * RISK_WEIGHTS.TAB_SWITCH;
    penaltyTotal += (eventCounts.COPY_PASTE || 0) * RISK_WEIGHTS.COPY_PASTE;
    penaltyTotal += (eventCounts.FACE_MISSING || 0) * RISK_WEIGHTS.FACE_MISSING;
    penaltyTotal += (eventCounts.MULTIPLE_FACES || 0) * RISK_WEIGHTS.MULTIPLE_FACES;
    penaltyTotal += (eventCounts.STRESS_SPIKE || 0) * RISK_WEIGHTS.STRESS_SPIKE;

    const integrityScore = Math.max(0, 100 - penaltyTotal);

    let riskLevel = "Low";
    if (integrityScore < 50) {
        riskLevel = "High";
    } else if (integrityScore < 80) {
        riskLevel = "Medium";
    }

    // Generate unique reasons
    const reasons = Array.from(new Set(events.map(e => e.explanationText))).filter(Boolean);

    return {
        integrityScore,
        riskLevel,
        reasons
    };
};

export const getSeverity = (impact) => {
    if (impact >= 20) return 'high';
    if (impact >= 10) return 'medium';
    return 'low';
};
