import pandas as pd
import numpy as np
import kagglehub
import glob
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Set seed
np.random.seed(42)

def generate_vitals_from_level(level):
    # Reverse engineer vitals from triage level for the Kaggle dataset
    # Level 1-2 (Critical): Bad vitals
    # Level 3-5 (Routine): Good/Ok vitals
    
    if level <= 2:
        temp = np.random.choice([39.8, 36.0, 37.5], p=[0.4, 0.1, 0.5])
        hr = np.random.normal(110, 15)
        spo2 = np.random.normal(88, 5)
        sys_bp = np.random.choice([160, 80, 120], p=[0.4, 0.3, 0.3])
    else:
        temp = np.random.normal(37.0, 0.4)
        hr = np.random.normal(75, 10)
        spo2 = np.random.normal(98, 1)
        sys_bp = np.random.normal(120, 10)
        
    return round(temp, 1), int(hr), int(min(100, max(60, spo2))), int(sys_bp)

def get_kaggle_data():
    try:
        path = kagglehub.dataset_download("xavierberge/hospital-emergency-dataset")
        csv_file = glob.glob(os.path.join(path, "*.csv"))[0]
        df = pd.read_csv(csv_file)
        
        # Select relevant columns
        # Map 'Patient Gender' to 'gender' (M/F -> Male/Female)
        df['gender'] = df['Patient Gender'].map({'M': 'Male', 'F': 'Female'}).fillna('Male')
        
        # Map 'Patient Age'
        df['age'] = df['Patient Age']
        
        # Infer Triage Level from Admission Flag
        # Admission = True -> More likely Critical (1, 2) or Urgent (3)
        # Admission = False -> More likely Routine (4, 5)
        
        def infer_level(row):
            if row['Patient Admission Flag']: 
                return np.random.choice([1, 2, 3], p=[0.3, 0.4, 0.3])
            else:
                return np.random.choice([3, 4, 5], p=[0.2, 0.4, 0.4])
                
        df['triage_level'] = df.apply(infer_level, axis=1)
        
        # Assign Symptoms based on Level (Correlation)
        critical_symptoms = ['Chest Pain', 'Difficulty Breathing', 'Stroke Symptoms', 'unconscious', 'Severe Bleeding']
        urgent_symptoms = ['High Fever', 'Abdominal Pain', 'Broken Bone', 'Vomiting']
        routine_symptoms = ['Cough', 'Headache', 'Dizziness', 'Sore Throat', 'Fatigue']
        
        def assign_symptom(level):
            if level <= 2: return np.random.choice(critical_symptoms)
            if level == 3: return np.random.choice(urgent_symptoms + critical_symptoms)
            return np.random.choice(routine_symptoms + urgent_symptoms)
            
        df['symptom'] = df['triage_level'].apply(assign_symptom)
        
        # Generate Vitals
        vitals = df['triage_level'].apply(generate_vitals_from_level)
        df['temperature'] = [x[0] for x in vitals]
        df['heart_rate'] = [x[1] for x in vitals]
        df['spo2'] = [x[2] for x in vitals]
        df['systolic_bp'] = [x[3] for x in vitals]
        
        # Keep only matching columns
        cols = ['age', 'gender', 'symptom', 'temperature', 'heart_rate', 'spo2', 'systolic_bp', 'triage_level']
        return df[cols]
        
    except Exception as e:
        print(f"Error processing Kaggle data: {e}")
        return pd.DataFrame()

def train():
    # 1. Load Synthetic Data
    try:
        df_synthetic = pd.read_csv('triage_dataset.csv')
    except:
        print("Please run generate_data.py first")
        return

    # 2. Load Kaggle Data
    print("Processing Kaggle Dataset...")
    df_kaggle = get_kaggle_data()
    print(f"Kaggle Data Loaded: {len(df_kaggle)} rows")
    
    # 3. Merge
    if not df_kaggle.empty:
        # Take a subset if Kaggle data is huge to keep balance, or use all
        # Kaggle dataset might be small or large. Let's cap it to match synthetic size order of magnitude if needed.
        # But commonly more data is better.
        df_final = pd.concat([df_synthetic, df_kaggle], ignore_index=True)
    else:
        df_final = df_synthetic

    print(f"Total Training Data: {len(df_final)} rows")

    # 4. Preprocessing
    le_gender = LabelEncoder()
    # Fit on all possible values just in case
    le_gender.fit(['Male', 'Female', 'Other']) 
    df_final['gender'] = df_final['gender'].apply(lambda x: x if x in ['Male', 'Female'] else 'Male') # Simple handling
    df_final['gender'] = le_gender.transform(df_final['gender'])
    
    le_symptom = LabelEncoder()
    df_final['symptom'] = df_final['symptom'].astype(str)
    le_symptom.fit(df_final['symptom'])
    df_final['symptom'] = le_symptom.transform(df_final['symptom'])

    X = df_final.drop('triage_level', axis=1)
    y = df_final['triage_level']

    # 5. Train
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    clf = RandomForestClassifier(n_estimators=150, random_state=42)
    clf.fit(X_train, y_train)

    print(f"Combined Model Accuracy: {clf.score(X_test, y_test):.2f}")

    # 6. Save (Overwrite the previous model so app functionality updates automatically)
    joblib.dump(clf, 'triage_model.pkl')
    joblib.dump(le_gender, 'le_gender.pkl')
    joblib.dump(le_symptom, 'le_symptom.pkl')
    print("Enhanced Model Saved.")

if __name__ == "__main__":
    train()
