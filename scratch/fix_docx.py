from docx import Document
doc = Document("final_capstone_report_submission_ready.docx")
for para in doc.paragraphs:
    if "ext{PersonalizedScore}" in para.text or "ext{cuisine" in para.text:
        para.text = r"$\text{PersonalizedScore} = (50 \times W_{\text{cuisine}}) + (25 \times W_{\text{category}}) + (10 \times W_{\text{type}})$"
        print("Fixed.")
        break
doc.save("final_capstone_report_submission_ready.docx")

