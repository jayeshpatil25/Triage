import kagglehub
import pandas as pd
import os
import glob

# Download latest version
print("Downloading dataset...")
path = kagglehub.dataset_download("xavierberge/hospital-emergency-dataset")
print("Path to dataset files:", path)

# Find the csv file
csv_files = glob.glob(os.path.join(path, "*.csv"))

if csv_files:
    print(f"Found CSV: {csv_files[0]}")
    df = pd.read_csv(csv_files[0])
    print("\nColumns:")
    print(df.columns.tolist())
    print("\nFirst 3 rows:")
    print(df.head(3))
else:
    print("No CSV found in the downloaded path.")
