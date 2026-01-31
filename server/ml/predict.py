import sys
import json
import joblib
import pandas as pd
import numpy as np
import os

# Suppress warnings
import warnings
warnings.filterwarnings("ignore")

def predict(input_json):
    # Load Model artifacts
    # Ensure paths are correct relative to where script is run
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    try:
        clf = joblib.load(os.path.join(base_path, 'triage_model.pkl'))
        le_gender = joblib.load(os.path.join(base_path, 'le_gender.pkl'))
        le_symptom = joblib.load(os.path.join(base_path, 'le_symptom.pkl'))
    except Exception as e:
        return {"error": f"Model loading failed: {str(e)}"}

    data = json.loads(input_json)
    
    # Map input to model features
    # Input keys: age, gender, symptoms (list), vital_signs
    
    # Handle multiple symptoms - we pick the most severe or first one for this simple model
    # (Real-world models would encodings for multi-label)
    primary_symptom = data['symptoms'][0] if len(data['symptoms']) > 0 else 'Initial'
    
    # Fallback if symptom unknown to model
    try:
        symptom_enc = le_symptom.transform([primary_symptom])[0]
    except:
        # Default to a mid-severity symptom if unknown
        symptom_enc = le_symptom.transform(['Headache'])[0] 
        
    gender_enc = le_gender.transform([data['gender']])[0] if data['gender'] in ['Male', 'Female'] else 0
    
    # Parse BP
    sys_bp = 120
    if '/' in str(data['vitals'].get('bloodPressure', '')):
        try:
            sys_bp = int(data['vitals']['bloodPressure'].split('/')[0])
        except:
            pass

    features = pd.DataFrame([{
        'age': int(data['age']),
        'gender': gender_enc,
        'symptom': symptom_enc,
        'temperature': float(data['vitals'].get('temperature', 37)),
        'heart_rate': 80, # Default if missing (not in form currently)
        'spo2': float(data['vitals'].get('spo2', 98)),
        'systolic_bp': sys_bp
    }])
    
    # Predict
    predicted_level = clf.predict(features)[0]
    
    # Map Level to Category
    # 1-2: Critical, 3: Urgent, 4: Semi-Urgent, 5: Routine
    level_map = {
        1: 'Critical',
        2: 'Critical',
        3: 'Urgent',
        4: 'Semi-Urgent',
        5: 'Routine'
    }
    
    category = level_map.get(predicted_level, 'Routine')
    
    # Heuristic score for the UI (0-100) based on level
    # Level 1 -> 95, Level 5 -> 10
    score_base = {1: 95, 2: 85, 3: 65, 4: 40, 5: 15}
    score = score_base.get(predicted_level, 10)
    

    # Generate Explanation
    reasons = []
    
    # Check Vitals
    if features['spo2'][0] < 90:
        reasons.append(f"Critical SpO2 ({features['spo2'][0]}%)")
    elif features['spo2'][0] < 95:
        reasons.append(f"Low SpO2 ({features['spo2'][0]}%)")
        
    if features['temperature'][0] > 39.5:
        reasons.append(f"High Fever ({features['temperature'][0]}°C)")
    elif features['temperature'][0] > 38:
        reasons.append(f"Fever ({features['temperature'][0]}°C)")

    if features['systolic_bp'][0] > 160:
        reasons.append(f"Hypertension (BP {features['systolic_bp'][0]})")
    elif features['systolic_bp'][0] < 90:
        reasons.append(f"Hypotension (BP {features['systolic_bp'][0]})")

    # Check Symptom
    # (In a real app, we'd have a map of symptom severity)
    critical_symptoms = ['Chest Pain', 'Stroke Symptoms', 'Unconscious', 'Severe Bleeding', 'Difficulty Breathing']
    if primary_symptom in critical_symptoms:
        reasons.append(f"Critical Symptom: {primary_symptom}")
    else:
        reasons.append(f"Symptom: {primary_symptom}")
        
    reason_str = "; ".join(reasons)
    
    return {
        "score": score,
        "level": category,
        "ml_level": int(predicted_level),
        "explanation": reason_str
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Read from raw input or arg
        print(json.dumps(predict(sys.argv[1])))
    else:
        print(json.dumps({"error": "No input provided"}))
