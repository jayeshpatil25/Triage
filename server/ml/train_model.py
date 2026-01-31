import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

def train():
    # Load Data
    try:
        df = pd.read_csv('triage_dataset.csv')
    except FileNotFoundError:
        print("Dataset not found! Run generate_data.py first.")
        return

    # Preprocessing
    le_gender = LabelEncoder()
    df['gender'] = le_gender.fit_transform(df['gender'])
    
    le_symptom = LabelEncoder()
    df['symptom'] = le_symptom.fit_transform(df['symptom'])

    X = df.drop('triage_level', axis=1)
    y = df['triage_level']

    # Train Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Model Training (Random Forest)
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    # Evaluation
    acc = clf.score(X_test, y_test)
    print(f"Model Training Complete. Accuracy: {acc:.2f}")

    # Save Artifacts
    joblib.dump(clf, 'triage_model.pkl')
    joblib.dump(le_gender, 'le_gender.pkl')
    joblib.dump(le_symptom, 'le_symptom.pkl')
    print("Model and encoders saved.")

if __name__ == "__main__":
    train()
