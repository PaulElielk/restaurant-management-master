import zipfile
import os
import shutil

docx_path = "final_capstone_report_submission_ready_updated.docx"
with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk("scratch/docx_extract"):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, "scratch/docx_extract")
            z.write(file_path, arcname)
print("Saved to final_capstone_report_submission_ready_updated.docx")

try:
    shutil.copy(docx_path, "final_capstone_report_submission_ready.docx")
    print("Successfully overwrote the original docx")
except Exception as e:
    print(f"Could not overwrite the original docx: {e}")

