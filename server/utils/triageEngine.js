/**
 * Hybrid Triage Scoring Engine
 * Combines rule-based logic (vital signs thresholds) with weighted symptom scoring.
 */

const calculateTriageScore = (patient) => {
    let score = 0;
    let explanation = [];

    // 1. Symptom Severity (Simple Keyword Matching)
    const criticalKeywords = ['chest pain', 'stroke', 'unconscious', 'severe bleeding', 'difficulty breathing'];
    const urgentKeywords = ['broken bone', 'high fever', 'abdominal pain', 'vomiting'];

    const symptoms = patient.symptoms.map(s => s.toLowerCase());

    let symptomScore = 0;
    criticalKeywords.forEach(k => {
        if (symptoms.some(s => s.includes(k))) {
            symptomScore += 50;
            explanation.push(`Critical symptom detected: ${k}`);
        }
    });

    urgentKeywords.forEach(k => {
        if (symptoms.some(s => s.includes(k))) {
            symptomScore += 20;
            explanation.push(`Urgent symptom detected: ${k}`);
        }
    });

    score += symptomScore;

    // 2. Vitals Analysis
    // Temperature
    if (patient.vitals.temperature >= 39.5) {
        score += 15;
        explanation.push('High Fever (>39.5C)');
    } else if (patient.vitals.temperature >= 38) {
        score += 5;
    }

    // SpO2
    if (patient.vitals.spo2 && patient.vitals.spo2 < 90) {
        score += 40;
        explanation.push('Critical Low SpO2 (<90%)');
    } else if (patient.vitals.spo2 && patient.vitals.spo2 < 95) {
        score += 10;
        explanation.push('Low SpO2 (<95%)');
    }

    // 3. Age Factors
    if (patient.age < 5) {
        score += 5;
        explanation.push('Pediatric patient bonus');
    } else if (patient.age > 70) {
        score += 10;
        explanation.push('Geriatric patient bonus');
    }

    // Determine Priority Level
    let level = 'Routine';
    if (score >= 50) level = 'Critical';
    else if (score >= 25) level = 'Urgent';
    else if (score >= 10) level = 'Semi-Urgent';

    return { score, level, explanation: explanation.join('; ') };
};

module.exports = { calculateTriageScore };
