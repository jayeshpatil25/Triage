import pandas as pd
import numpy as np
import random

# Seed for reproducibility
np.random.seed(42)

def generate_triage_data(n_samples=5000):
    data = []
    
    # Common symptoms and their typical severity (lower is more critical in ESI)
    symptoms_map = {
        'Chest Pain': [1, 2],
        'Difficulty Breathing': [1, 2],
        'Severe Bleeding': [1],
        'Unconscious': [1],
        'Stroke Symptoms': [1, 2],
        'High Fever': [2, 3],
        'Abdominal Pain': [2, 3],
        'Vomiting': [3, 4],
        'Broken Bone': [3],
        'Headache': [3, 4, 5],
        'Dizziness': [3, 4],
        'Cough': [4, 5],
        'Sore Throat': [5],
        'Fatigue': [4, 5]
    }

    symptoms_list = list(symptoms_map.keys())

    for _ in range(n_samples):
        age = np.random.randint(1, 95)
        gender = np.random.choice(['Male', 'Female'])
        symptom = np.random.choice(symptoms_list)
        
        # Base vitals (healthy-ish)
        temp = np.random.normal(37.0, 0.5)
        hr = np.random.normal(75, 10)
        spo2 = np.random.normal(98, 1)
        sys_bp = np.random.normal(120, 10)
        
        # Adjust vitals based on symptom to make it realistic
        if symptom in ['High Fever', 'sore Throat']:
            temp += np.random.uniform(1.5, 3.0)
            hr += 20
        
        if symptom in ['Chest Pain', 'Difficulty Breathing']:
            hr += 20
            spo2 -= np.random.uniform(5, 15)
            sys_bp += 30
            
        if symptom == 'Unconscious':
            sys_bp -= 40
            spo2 -= 10
            
        if symptom == 'Severe Bleeding':
            hr += 40
            sys_bp -= 30

        # Cap values
        spo2 = min(100, max(60, spo2))
        temp = round(temp, 1)
        hr = int(hr)
        sys_bp = int(sys_bp)
        
        # Determine Logic-based label first, then add noise (simulating human error/complexity)
        # ESI Levels: 1 (Resuscitation) -> 5 (Non-urgent)
        # Our App Levels: Critical (1-2), Urgent (3), Semi-Urgent (4), Routine (5)
        
        possible_levels = symptoms_map[symptom]
        base_level = np.random.choice(possible_levels)
        
        # Upgrade priority if vitals are bad
        if spo2 < 90 or sys_bp < 90 or hr > 130 or temp > 39.5:
            base_level = max(1, base_level - 1)
            
        # Age Factor
        if (age > 75 or age < 1) and base_level > 2:
            base_level -= 1

        data.append([age, gender, symptom, temp, hr, spo2, sys_bp, base_level])
        
    df = pd.DataFrame(data, columns=['age', 'gender', 'symptom', 'temperature', 'heart_rate', 'spo2', 'systolic_bp', 'triage_level'])
    df.to_csv('triage_dataset.csv', index=False)
    print("Dataset generated: triage_dataset.csv with 5000 samples")

if __name__ == "__main__":
    generate_triage_data()
