import zipfile
with zipfile.ZipFile("final_capstone_report_submission_ready.docx", "r") as z:
    z.extractall("scratch/docx_extract")

