import zipfile
import re

with zipfile.ZipFile("final_capstone_report_submission_ready.docx", "r") as z:
    rels = z.read("word/_rels/document.xml.rels").decode("utf-8")
    doc = z.read("word/document.xml").decode("utf-8")

matches = re.findall(r'Id="([^"]+)" Type="[^"]+image" Target="media/([^"]+)"', rels)
img_map = {m[0]: m[1] for m in matches}

for match in re.finditer(r'<w:drawing>.*?</w:drawing>', doc):
    drawing = match.group(0)
    embed_match = re.search(r'r:embed="([^"]+)"', drawing)
    if embed_match:
        rid = embed_match.group(1)
        img_name = img_map.get(rid, "Unknown")
        
        # look ahead for Figure caption
        # The caption usually follows the drawing in a new paragraph
        context = doc[match.end():match.end() + 800]
        text_nodes = re.findall(r'<w:t(?: xml:space="preserve")?>(.*?)</w:t>', context)
        text = "".join(text_nodes)
        
        # also get preceding just in case
        prev_context = doc[max(0, match.start() - 200):match.start()]
        prev_text = "".join(re.findall(r'<w:t(?: xml:space="preserve")?>(.*?)</w:t>', prev_context))
        
        print(f"--- {img_name} ---")
        print(f"Prev: {prev_text[-50:]}")
        print(f"Next: {text[:200]}")

