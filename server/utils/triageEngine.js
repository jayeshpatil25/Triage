/**
 * Hybrid Triage Scoring Engine
 * Combines rule-based logic (vital signs thresholds) with weighted symptom scoring.
 */

const { spawn } = require('child_process');
const path = require('path');

const calculateTriageScore = async (patient) => {
    return new Promise((resolve, reject) => {
        // Prepare input for Python script
        const inputData = JSON.stringify(patient);

        // Path to python script
        const scriptPath = path.join(__dirname, '../ml/predict.py');

        // Spawn python process
        const pythonProcess = spawn('python', [scriptPath, inputData]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${error}`);
                // Fallback to basic logic if ML fails
                resolve(fallbackLogic(patient));
            } else {
                try {
                    const prediction = JSON.parse(result);
                    if (prediction.error) {
                        console.error("ML Error:", prediction.error);
                        resolve(fallbackLogic(patient));
                    } else {
                        if (prediction.explanation) {
                            prediction.explanation = prediction.explanation.replace('ML Model (Random Forest) Assessment: ', '');
                        }
                        resolve(prediction);
                    }
                } catch (e) {
                    console.error("Failed to parse ML output", result);
                    resolve(fallbackLogic(patient));
                }
            }
        });
    });
};

// Fallback Rule-based logic (original logic)
const fallbackLogic = (patient) => {
    let score = 0;
    let explanation = [];

    // Quick basic implementation of original logic for redundancy
    const criticalKeywords = ['chest pain', 'stroke', 'unconscious', 'severe bleeding', 'difficulty breathing'];
    const symptoms = (patient.symptoms || []).map(s => s.toLowerCase());

    if (criticalKeywords.some(k => symptoms.some(s => s.includes(k)))) {
        score += 50;
        explanation.push('Critical symptom (Fallback)');
    }

    if (patient.vitals?.temperature > 39) score += 10;

    let level = 'Routine';
    if (score >= 50) level = 'Critical';
    else if (score >= 20) level = 'Urgent';

    return { score, level, explanation: explanation.join('; ') + " (Rule-based Fallback)" };
};

module.exports = { calculateTriageScore };
