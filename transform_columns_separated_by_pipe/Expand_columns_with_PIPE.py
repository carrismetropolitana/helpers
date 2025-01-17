import pandas as pd
import os
from unidecode import unidecode

# Paths to the file to be transformed
path_to_the_file_to_transform = r"C:\Users\InêsClemente\Downloads"
file_to_transform = os.path.join(path_to_the_file_to_transform, 'VSCODE_IMPORTAR.csv')

# Try reading the file, ignoring the lines with problems
try:
    # Use 'on_bad_lines' to treat malformed lines
    df = pd.read_csv(file_to_transform, on_bad_lines='skip')
except Exception as e:
    print(f"Erro ao ler o ficheiro: {e}")
    exit()

# Checks the columns of the uploaded file
print("Colunas disponíveis no ficheiro:", df.columns)

# Check if the columns to be dealt with exist
if 'name' not in df.columns or 'lines' not in df.columns:
    print("Certifique-se de que o arquivo contém as colunas 'name' e 'lines'.")
    exit()

# Normalizes the column containing special characters
df['name'] = df['name'].apply(lambda x: unidecode(x) if isinstance(x, str) else x)

# Split the column with the '|' separator
df['lines'] = df['lines'].str.split('|')

# Expands only rows with multiple values
df_expanded = df.explode('lines').reset_index(drop=True)

# Save the generated file
result = os.path.join(path_to_the_file_to_transform, 'linhas_por_paragens_result_.csv')
df_expanded.to_csv(result, index=False)

print(f"O ficheiro foi guardado em: {result}")
