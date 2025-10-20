import pandas as pd
import os
from datetime import datetime
from openpyxl import load_workbook
from openpyxl.styles import PatternFill, Font, Alignment

# Path to the folder containing all reconciliation files:
folder = r"C:\Users\InêsClemente\Downloads\Reconciliation"

# Period of analysis:
start_date = "2025-09-01"
end_date = "2025-09-30"

# Reading and validating files
dfs = []

for file in os.listdir(folder):
    if file.endswith(".csv"):
        file_path = os.path.join(folder, file)
        try:
            df = pd.read_csv(file_path, sep=";", encoding="utf-8")
            df.columns = df.columns.str.strip().str.upper()

            if {"TRANSACTION_GROSS_AMOUNT","COMMISSION_PCT","COMMISSION_FXD","COMMISSION_AMT","PAYOUT_AMOUNT","PAYOUT_DATE"}.issubset(df.columns):
                dfs.append(df)
            else:
                print(f"⚠️ ficheiro ignorado (colunas em falta): {file}")
        except Exception as e:
            print(f"❌ Erro ao ler {file}: {e}")

if not dfs:
    raise ValueError("Não foi encontrado nenhum ficheiro válido com as colunas esperadas!")

df_total = pd.concat(dfs, ignore_index=True)
df_total["PAYOUT_DATE"] = pd.to_datetime(df_total["PAYOUT_DATE"], errors="coerce")
df_total = df_total.dropna(subset=["PAYOUT_DATE"])

# Filter by the date range selected above
df_total = df_total[
    (df_total["PAYOUT_DATE"] >= pd.to_datetime(start_date)) &
    (df_total["PAYOUT_DATE"] <= pd.to_datetime(end_date))
]

# Aggregate and transform data
sum_columns = ["PAYOUT_AMOUNT","COMMISSION_PCT","COMMISSION_FXD","COMMISSION_AMT","TRANSACTION_GROSS_AMOUNT",]

all_dates = pd.date_range(start=start_date, end=end_date, freq="D")

result = (
    df_total
    .groupby("PAYOUT_DATE", as_index=True)[sum_columns]
    .sum()
    .sort_values("PAYOUT_DATE")
    .reindex(all_dates, fill_value=0)
    .rename_axis("PAYOUT_DATE")
    .reset_index()
)

# Format dates as DD/MM/YYYY
result["PAYOUT_DATE"] = result["PAYOUT_DATE"].dt.strftime("%d/%m/%Y")

# Transpose the result
result_transposed = result.set_index("PAYOUT_DATE").T
result_transposed.reset_index(inplace=True)
result_transposed.rename(columns={"index": "Data"}, inplace=True)

# Calculates the total and accumulated value
totals = result_transposed.iloc[:, 1:].sum(numeric_only=True)
total_line = pd.DataFrame([["Total"] + totals.tolist()], columns=result_transposed.columns)

accumulated = totals.cumsum()
accumulated_line = pd.DataFrame([["Total acumulado"] + accumulated.tolist()], columns=result_transposed.columns)

result_transposed = pd.concat([result_transposed, total_line], ignore_index=True)

# Add to column: Total acumulado
result_transposed["Total acumulado"] = result_transposed.iloc[:, 1:].sum(axis=1, numeric_only=True)

# =====================================================================================================================================================================
# Format the Excel file and export it.

month_name = datetime.strptime(start_date, "%Y-%m-%d").strftime("%B").capitalize()
output_file = os.path.join(folder, f"CUT_Valores_{month_name}.xlsx")

result_transposed.to_excel(output_file, index=False)

# Applies Excel formatting (openpyxl)
wb = load_workbook(output_file)
ws = wb.active

# Style: black header, white text
header_fill = PatternFill(start_color="000000", end_color="000000", fill_type="solid")
header_font = Font(color="FFFFFF", bold=True)
center_align = Alignment(horizontal="center", vertical="center")

# Style: alternating light grey lines
gray_fill = PatternFill(start_color="DDDDDD", end_color="DDDDDD", fill_type="solid")
bold_font = Font(bold=True)

# Format header
for cell in ws[1]:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = center_align

# Format alternating rows
for i, row in enumerate(ws.iter_rows(min_row=2, max_col=ws.max_column), start=2):
    if i % 2 == 0:
        for cell in row:
            cell.fill = gray_fill
    if row[0].value in ["Total", "Total acumulado"]:
        for cell in row:
            cell.font = bold_font
            cell.fill = PatternFill(start_color="C0C0C0", end_color="C0C0C0", fill_type="solid")

# Automatic length adjustment
for col in ws.columns:
    max_length = 0
    col_letter = col[0].column_letter
    for cell in col:
        if cell.value:
            max_length = max(max_length, len(str(cell.value)))
    ws.column_dimensions[col_letter].width = max_length + 2

wb.save(output_file)
wb.close()
# ==================================================================================================================================================================

print(f"✅ ficheiro Excel criado com sucesso: {output_file}")