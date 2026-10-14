import sys
import copy
from pptx import Presentation
from pptx.util import Pt

def add_bullet(text_frame, text, base_font):
    p = text_frame.add_paragraph()
    p.text = text
    p.level = 0
    if base_font:
        p.font.name = base_font.name
        p.font.size = base_font.size
        p.font.color.rgb = base_font.color.rgb if hasattr(base_font.color, 'rgb') else None

try:
    prs = Presentation('capstone_presentation_Paul_kouame.pptx')
    
    # Slide 8: Recommendation (Index 8)
    slide8 = prs.slides[8]
    for shape in slide8.shapes:
        if shape.has_text_frame and "Completed orders determine" in shape.text:
            base_font = shape.text_frame.paragraphs[0].runs[0].font if shape.text_frame.paragraphs[0].runs else None
            add_bullet(shape.text_frame, "- Algorithm limitation: Cold-start problem for new users (requires fallback to global popularity).", base_font)
            break
            
    # Slide 9: Chatbot (Index 9)
    slide9 = prs.slides[9]
    for shape in slide9.shapes:
        if shape.has_text_frame and "Core intent benchmark" in shape.text:
            base_font = shape.text_frame.paragraphs[0].runs[0].font if shape.text_frame.paragraphs[0].runs else None
            # Prepend algorithm info by modifying the first paragraph? 
            # Easier to just append all to the end to not break structure.
            add_bullet(shape.text_frame, "- Algorithm used: Supervised Intent Classification (Logistic Regression).", base_font)
            add_bullet(shape.text_frame, "- Algorithm limitation: Deterministic routing cannot generate text like LLMs.", base_font)
            add_bullet(shape.text_frame, "- Algorithm limitation: Struggles with long multi-turn context retention.", base_font)
            break

    # Slide 10: Forecasting (Index 10)
    slide10 = prs.slides[10]
    for shape in slide10.shapes:
        if shape.has_text_frame and "Moving-average daily run rate" in shape.text:
            base_font = shape.text_frame.paragraphs[0].runs[0].font if shape.text_frame.paragraphs[0].runs else None
            add_bullet(shape.text_frame, "- Algorithm limitation: Purely historical model, unable to predict external anomalies (e.g., weather, holidays).", base_font)
            break

    prs.save('capstone_presentation_Paul_kouame.pptx')
    print("Presentation successfully updated with algorithms and limitations.")
except Exception as e:
    print(f"Error: {e}")
