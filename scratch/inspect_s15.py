from pptx import Presentation

prs = Presentation('capstone_presentation_Paul_kouame_final.pptx')
s15 = prs.slides[14] # Slide 15
for j, shape in enumerate(s15.shapes):
    if shape.has_text_frame:
        print(f"Shape {j} ({shape.name}): {shape.text}")

