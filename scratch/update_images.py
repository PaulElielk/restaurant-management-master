import shutil
import zipfile
import os

# Mapping old images to new screenshots
mapping = {
    "image6.png": "screenshots/recommendation.png",
    "image8.png": "screenshots/drinks.png",
    "image10.png": "screenshots/admin-dashboard.png",
    "image11.png": "screenshots/ai demand forecasting.png",
}

media_dir = "scratch/docx_extract/word/media"

# Overwrite files
for old_img, new_img in mapping.items():
    dest = os.path.join(media_dir, old_img)
    print(f"Replacing {old_img} with {new_img}")
    shutil.copy(new_img, dest)

# Zip it back
docx_path = "final_capstone_report_submission_ready.docx"
with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk("scratch/docx_extract"):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, "scratch/docx_extract")
            z.write(file_path, arcname)

print("Done creating updated docx.")

