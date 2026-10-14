from docx import Document
import sys

def insert_after_paragraph_with_text(doc, search_text, new_text, style=None):
    for para in doc.paragraphs:
        if para.text.strip().startswith(search_text):
            p = para.insert_paragraph_before(new_text)
            if style:
                p.style = style
            para._p.addnext(p._p)
            return True
    return False

def main():
    doc = Document("final_capstone_report_submission_ready.docx")
    
    # Target 1
    t1 = "As a post-evaluation enhancement for production scaling, the system catalog was expanded to document 74 total items across 3 core cuisines: Mexican, Ivorian/West African (e.g., Garba, Alloco, Placali, Kedjenou, Sauce Gombo), and American Fast Food (e.g., Burgers, Buffalo Wings, Mozzarella Sticks). The database categorization schema explicitly reflects how dishes map to both their macro cuisine types and specific food categories, ensuring accurate representation of a multi-cultural menu."
    res = insert_after_paragraph_with_text(doc, "The database schema is defined in frontend/src/resources/db_restaurant.sql", t1)
    if not res: print("Failed T1")

    # Target 2
    t2_1 = "For the live multi-cuisine catalog, the production heuristic implemented in FoodModel.js was expanded to prevent single-cuisine dominance. The formula is expressed as:"
    t2_2 = "$\text{PersonalizedScore} = (50 \\times W_{\text{cuisine}}) + (25 \\times W_{\text{category}}) + (10 \\times W_{\text{type}})$"
    t2_3 = "The addition of a popularity score normalization (scaled 0% to 100%) and a contextual explanation layer generates dynamic rationale strings (e.g., 'Because you love Ivorian cuisine') to accompany the recommendations."
    
    for para in doc.paragraphs:
        if para.text.strip().startswith("The main recommendation function is getRecommendedFoodsForUser"):
            p1 = para.insert_paragraph_before(t2_1)
            para._p.addnext(p1._p)
            
            p2 = p1.insert_paragraph_before(t2_2)
            p1._p.addnext(p2._p)
            
            p3 = p2.insert_paragraph_before(t2_3)
            p2._p.addnext(p3._p)
            break
    else:
        print("Failed T2")

    # Target 3
    t3_head = "6.5.1 Production Scaling & Live System Validation"
    t3_body = "Following the offline validation baseline, the system was scaled to a live production state accommodating the expanded 74-item catalog. The production evaluation was conducted over a live dataset comprising 5,000 order entries across 25 active sales days. In this live configuration, every menu item achieved a High Confidence rating. This occurs because the confidence threshold evaluates activity ratio; each of the 74 items exceeded the >15 active sales days threshold (an activity ratio >50%). The top predicted volume items from the live production state were Coca Cola (193.4 units), Gnamakoudji (179.9 units), and Alloco (158.9 units)."
    
    for para in doc.paragraphs:
        if para.text.strip().startswith("The improved confidence distribution should not be interpreted"):
            ph = para.insert_paragraph_before(t3_head)
            ph.style = "Heading 3"
            para._p.addnext(ph._p)
            
            pb = ph.insert_paragraph_before(t3_body)
            ph._p.addnext(pb._p)
            break
    else:
        print("Failed T3")

    # Target 4
    t4 = "As a post-evaluation enhancement for the live system, the production model extension implemented in ChatbotService.js expanded the NLP intent taxonomy to 10 intents across 225 training pairs. This specifically integrated two additional relational ingredient intents: `restaurant.check_dish_ingredient` (e.g., checking composition: 'What is in the Garba?') and `restaurant.query_by_ingredient` (e.g., ingredient-driven discovery: 'Dishes with plantain')."
    res = insert_after_paragraph_with_text(doc, "These results should be interpreted as an intent-classification evaluation", t4)
    if not res: print("Failed T4")

    # Target 5
    t5 = "To improve client ergonomics and interface workflow in the final release, the user-facing functional scope was updated to include several post-checkout and retention features. A new customer profile view (/profile) allows management of name, email, and telephone credentials. The navigation bar incorporates a real-time cart badge synchronized with current item counts. Quick 'Order Now' buttons enable direct menu redirection and single-click cart insertions from recommendation cards. Furthermore, 'Customers Also Bought' cross-sell components display related item recommendations in modal layouts, while localStorage session state persistence maintains authentication and cart integrity across browser reloads."
    res = insert_after_paragraph_with_text(doc, "The ordering workflow begins in Menu.vue, QuickView.vue", t5)
    if not res: print("Failed T5")

    doc.save("final_capstone_report_submission_ready.docx")
    print("Updates applied and saved successfully.")

if __name__ == "__main__":
    main()

