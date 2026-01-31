
import sys
import os
import json

# Add the directory containing predict.py to sys.path
sys.path.append(os.path.join(os.getcwd(), 'server', 'ml'))

try:
    from predict import predict
except ImportError:
    # Try direct import if we are in the root
    sys.path.append(os.path.join(os.getcwd(), 'server/ml'))
    from predict import predict

input_data = {
    "age": 30,
    "gender": "Male",
    "symptoms": ["Fever"],
    "vitals": {
        "temperature": 38,
        "spo2": 95,
        "bloodPressure": "120/80"
    }
}

print(json.dumps(predict(json.dumps(input_data)), indent=2))
