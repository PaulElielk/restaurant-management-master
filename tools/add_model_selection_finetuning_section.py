from __future__ import annotations

import sys
from pathlib import Path

from docx import Document

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

import build_evaluation_chapter as base  # noqa: E402

DOCX = ROOT / "final_capstone_report_ai_enhanced_final.docx"


SECTION_TITLE = "5.4 Model Selection, Training Strategy, and Fine-Tuning Considerations"
NEXT_HEADING = "5.5 Recommendation Engine Implementation"


def paragraph_text(element) -> str:
    return "".join(t.text or "" for t in element.iter(base.qn("w:t"))).strip()


def remove_existing_section(doc: Document):
    body = doc._body._element
    children = list(body)
    start = end = None
    for idx, child in enumerate(children):
        if child.tag.endswith("}p"):
            text = paragraph_text(child)
            if text == SECTION_TITLE:
                start = idx
            elif start is not None and text == NEXT_HEADING:
                end = idx
                break
    if start is not None and end is not None:
        for child in children[start:end]:
            body.remove(child)


def renumber_chapter_5(doc: Document):
    replacements = {
        "5.4 Recommendation Engine Implementation": "5.5 Recommendation Engine Implementation",
        "5.5 Chatbot Implementation": "5.6 Chatbot Implementation",
        "5.6 Demand Forecasting Implementation": "5.7 Demand Forecasting Implementation",
        "5.6.1 Forecast Generation Process": "5.7.1 Forecast Generation Process",
        "5.7 Ordering Workflow Implementation": "5.8 Ordering Workflow Implementation",
        "5.8 Admin Dashboard Implementation": "5.9 Admin Dashboard Implementation",
    }
    for para in doc.paragraphs:
        text = para.text.strip()
        if text in replacements:
            para.text = replacements[text]


def update_list_of_tables(doc: Document):
    anchor_text = "Table 4.4 - Main API domains"
    new_text = "Table 5.1 - Model selection, training, and fine-tuning summary"
    if any(p.text.strip() == new_text for p in doc.paragraphs):
        return
    for idx, para in enumerate(doc.paragraphs):
        if para.text.strip() == anchor_text and idx < 90:
            new_p = doc.add_paragraph(new_text, style="List Bullet")
            doc.paragraphs[idx]._p.addnext(new_p._p)
            return


def find_anchor_before(doc: Document, heading_text: str):
    body = doc._body._element
    children = list(body)
    for idx, child in enumerate(children):
        if child.tag.endswith("}p") and paragraph_text(child) == heading_text:
            if idx == 0:
                raise RuntimeError("Cannot insert before first body element")
            return children[idx - 1]
    raise RuntimeError(f"Could not find insertion heading: {heading_text}")


def add_section(doc: Document):
    anchor = find_anchor_before(doc, NEXT_HEADING)

    def p(text: str, style: str | None = None):
        nonlocal anchor
        anchor = base.add_paragraph_after(doc, anchor, text, style)

    def table(rows: list[list[str]]):
        nonlocal anchor
        anchor = base.add_table_after(doc, anchor, rows)

    p(SECTION_TITLE, "Heading 2")
    p(
        "This section directly addresses the model-training and fine-tuning question raised during review. The project includes three "
        "AI-related modules, but they do not all use the same kind of model. The recommendation engine is a custom algorithmic recommender, "
        "the chatbot is a supervised intent classifier, and the demand forecasting module is a deterministic statistical model. For that "
        "reason, the term fine-tuning must be used carefully and only where it is technically accurate."
    )

    p("5.4.1 Training and Fine-Tuning Terminology", "Heading 3")
    p(
        "In machine-learning projects, training generally refers to learning task-specific patterns from data. Supervised training uses labeled "
        "examples to teach a model how inputs should be mapped to outputs. Fine-tuning is more specific: it refers to adapting an already "
        "pre-trained model, such as a large language model or deep neural network, to a narrower task or domain. Algorithmic scoring systems, "
        "rule-based systems, and deterministic statistical formulas do not require fine-tuning because they do not begin from pre-trained model "
        "weights. Similarly, the moving-average forecasting approach used in this project computes demand from historical aggregates rather "
        "than learning neural parameters."
    )
    table(
        [
            [
                "Module",
                "Technique Used",
                "Training Performed?",
                "Fine-Tuning Performed?",
                "Explanation",
            ],
            [
                "Recommendation Engine",
                "Hybrid algorithmic recommender",
                "No neural training",
                "No",
                "Custom scoring algorithm using order history, preference signals, repeated purchases, co-purchases, and popularity",
            ],
            [
                "Chatbot / NLP",
                "node-nlp intent classifier",
                "Yes",
                "No",
                "Trained on 170 labeled utterances and validated on 64 held-out validation utterances",
            ],
            [
                "Demand Forecasting",
                "Moving-average velocity model",
                "No",
                "No",
                "Deterministic statistical model based on completed-order quantities over a lookback window",
            ],
        ]
    )
    p("Table 5.1 - Model selection, training, and fine-tuning summary", "Caption")

    p("5.4.2 Recommendation Engine: Model Selection and Fine-Tuning Decision", "Heading 3")
    p(
        "The recommendation engine was implemented as a custom hybrid algorithmic recommender rather than as a neural recommender. It combines "
        "signals from user order history, category preferences, food type preferences, repeated purchase behavior, co-purchase behavior, and "
        "global menu popularity. This design was selected because it is transparent, easy to inspect, and appropriate for a restaurant system "
        "where administrators and developers need to understand why an item is recommended."
    )
    p(
        "Neural fine-tuning was not applicable to this module because the recommender is not a pre-trained model, a matrix-factorization model, "
        "or a deep-learning recommender. Matrix factorization and deep-learning recommenders were not selected because the project did not have "
        "a large real-world restaurant transaction history and because the capstone also needed to deliver a complete working full-stack system. "
        "The expanded synthetic development dataset was used to simulate denser restaurant interaction patterns and evaluate the recommender "
        "under more realistic development conditions. The resulting improvement therefore came from richer interaction data and better "
        "evaluation conditions, not from neural model fine-tuning."
    )

    p("5.4.3 Chatbot: Intent Training Without LLM Fine-Tuning", "Heading 3")
    p(
        "The chatbot uses node-nlp for supervised intent classification and rule-based backend actions for menu-related responses. The training "
        "examples are defined in backend/models/ChatbotService.js. The current classifier was trained on 170 labeled utterances across eight "
        "restaurant-specific intent classes and evaluated on 64 held-out validation utterances. The measured validation results were Accuracy = "
        "0.9375, Macro Precision = 0.9405, Macro Recall = 0.9375, and Macro F1-score = 0.9373."
    )
    p(
        "This process is supervised intent-classifier training, not large language model fine-tuning. The chatbot does not use ChatGPT, Gemini, "
        "Claude, Llama, Mistral, or another transformer-based large language model. LLM fine-tuning was not used because the project did not "
        "include a large real restaurant conversation dataset, and because an externally hosted generative model would add computational cost, "
        "deployment complexity, reproducibility concerns, and API dependency. The node-nlp approach was selected because it provides better "
        "control over predefined restaurant intents and can run within the existing backend. The validation metrics are based on controlled "
        "held-out synthetic validation utterances, not production customer conversations."
    )

    p("5.4.4 Demand Forecasting: Statistical Modeling Without Fine-Tuning", "Heading 3")
    p(
        "The demand forecasting module uses a moving-average velocity method. For each food item, the backend aggregates completed-order "
        "quantities over a lookback period, computes average daily demand, and multiplies that value by the forecast horizon. This method was "
        "selected because it is interpretable, requires relatively little data, and is suitable for demonstrating operational planning logic in "
        "an undergraduate capstone project."
    )
    p(
        "The forecasting model is deterministic and does not have a training phase in the neural machine-learning sense. It also does not involve "
        "fine-tuning because there is no pre-trained forecasting model being adapted. The confidence indicator measures activity-day regularity, "
        "not statistical forecast accuracy. Advanced methods such as ARIMA, Prophet, LSTM models, or transformer-based forecasting were left for "
        "future work because the project does not contain a long-term real restaurant history or a stored actual-versus-predicted benchmark."
    )

    p("5.4.5 Why Advanced Fine-Tuned Models Were Not Used", "Heading 3")
    p(
        "Advanced fine-tuned models were not used as an intentional engineering tradeoff. A fine-tuned LLM chatbot would require a substantial "
        "domain-specific conversation dataset and additional safeguards for response quality. A deep-learning recommender or matrix-factorization "
        "model would require denser real user-item interaction data than the original project database contained. LSTM or transformer forecasting "
        "would require long historical demand sequences and future actual-demand benchmarks. These approaches would also increase computational "
        "cost, deployment complexity, and evaluation burden. The selected methods prioritize explainability, reproducibility, and integration "
        "with a working restaurant management application."
    )

    p("5.4.6 Future Work", "Heading 3")
    p(
        "Future versions of the project could investigate fine-tuned open-source language models for restaurant dialogue if a sufficiently large "
        "real customer conversation dataset becomes available. The recommendation engine could also be compared with matrix factorization or "
        "learning-to-rank methods, and the forecasting module could be benchmarked against ARIMA, Prophet, LSTM, or transformer-based forecasting "
        "once real historical transaction data and actual future demand outcomes are collected. These are future research directions and were not "
        "implemented in the current system."
    )


def main():
    doc = Document(DOCX)
    renumber_chapter_5(doc)
    remove_existing_section(doc)
    update_list_of_tables(doc)
    add_section(doc)
    doc.save(DOCX)
    print(f"Updated {DOCX}")


if __name__ == "__main__":
    main()
