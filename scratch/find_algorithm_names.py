from pptx import Presentation

prs = Presentation('capstone_presentation_Paul_kouame_final.pptx')

keywords = ['moving-average', 'moving average', 'run-rate', 'run rate', 'velocity', 'forecast', 'forecasting']

print("=== Search in capstone_presentation_Paul_kouame_final.pptx ===")
matches = []
for i, slide in enumerate(prs.slides):
    slide_title = ""
    for s in slide.shapes:
        if s.name.startswith('title') or s.name.startswith('section'):
            if s.has_text_frame:
                slide_title += f"[{s.text.strip()}] "
                
    for j, shape in enumerate(slide.shapes):
        if shape.has_text_frame:
            txt = shape.text.strip()
            txt_lower = txt.lower()
            found_kw = [kw for kw in keywords if kw in txt_lower]
            if found_kw:
                matches.append((i + 1, slide_title, shape.name, txt, found_kw))

for slide_num, slide_title, shape_name, text, kws in matches:
    print(f"\nSlide {slide_num} {slide_title} -> Shape '{shape_name}' (Keywords: {kws}):")
    for line in text.split('\n'):
        if any(kw in line.lower() for kw in keywords):
            print(f"  > {line.strip()}")

