import kagglehub
import pandas as pd
import os
import glob

path = kagglehub.dataset_download("xavierberge/hospital-emergency-dataset")
csv_file = glob.glob(os.path.join(path, "*.csv"))[0]

df = pd.read_csv(csv_file)

with open('data_info.txt', 'w') as f:
    f.write("Columns:\n")
    f.write('\n'.join(df.columns.tolist()))
    f.write("\n\nFirst Row:\n")
    f.write(str(df.iloc[0].to_dict()))
