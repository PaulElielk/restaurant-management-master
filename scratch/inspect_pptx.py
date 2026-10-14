import sys
from pptx import Presentation

try:
    prs = Presentation('capstone_presentation_Paul_kouame.pptx')
    for i, slide in enumerate(prs.slides):
        print(f"\n--- Slide {i} ---")
        for j, shape in enumerate(slide.shapes):
            if not shape.has_text_frame:
                continue
            text = shape.text.replace('\n', ' | ')
            print(f"Shape {j}: {text}")
except Exception as e:
    print(f"Error: {e}")
