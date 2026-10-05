"""
All LangChain PromptTemplate definitions for DOCIRA-AI.
Using PromptTemplate instead of raw f-strings gives:
  - Input variable validation
  - Easy chaining with | operator
  - Reusable across chains
"""
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate


# ── QA Prompt ────────────────────────────────────────────────────────────────

QA_SYSTEM = """You are DOCIRA-AI, a precise enterprise document analyst.
Answer questions ONLY using the provided document context.
Rules:
- If the answer is in the context, answer clearly and directly.
- Always mention which document(s) your answer comes from.
- If the answer is NOT in the context, say: "I could not find this in the uploaded documents."
- Never make up information. Never guess.
- Be concise but complete."""

qa_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(QA_SYSTEM),
    HumanMessagePromptTemplate.from_template(
        "DOCUMENT CONTEXT:\n{context}\n\nQUESTION: {query}\n\n"
        "Answer using only the information above. Reference document names."
    ),
])


# ── Summarize Prompt ──────────────────────────────────────────────────────────

SUMMARIZE_SYSTEM = """You are DOCIRA-AI, an expert document summarizer for enterprise teams.
Produce structured, professional summaries that executives can act on.
Be accurate, organized, and highlight what matters most."""

summarize_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(SUMMARIZE_SYSTEM),
    HumanMessagePromptTemplate.from_template(
        "DOCUMENT CONTENT:\n{context}\n\nUSER REQUEST: {query}\n\n"
        "Produce a structured summary:\n"
        "## Key Points\n(3-5 bullet points)\n\n"
        "## Main Topics\n(What subjects does this cover?)\n\n"
        "## Important Details\n(Dates, numbers, names, amounts)\n\n"
        "## Summary\n(2-3 sentence conclusion)"
    ),
])


# ── Compare Prompt ────────────────────────────────────────────────────────────

COMPARE_SYSTEM = """You are DOCIRA-AI, an expert at comparing enterprise documents.
Your analysis must be structured, fair, and actionable.
Always use the exact document names provided."""

compare_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(COMPARE_SYSTEM),
    HumanMessagePromptTemplate.from_template(
        "DOCUMENT A — {doc_a_title}:\n{context_a}\n\n"
        "DOCUMENT B — {doc_b_title}:\n{context_b}\n\n"
        "USER REQUEST: {query}\n\n"
        "Provide:\n"
        "## Similarities\n"
        "## Key Differences\n"
        "## Unique to {doc_a_title}\n"
        "## Unique to {doc_b_title}\n"
        "## Recommendation"
    ),
])


# ── Extract Prompt ────────────────────────────────────────────────────────────

EXTRACT_SYSTEM = """You are DOCIRA-AI, a structured information extraction specialist.
Extract data fields accurately from the document context.
Always return valid JSON only. Use null for missing values. No markdown fences."""

extract_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(EXTRACT_SYSTEM),
    HumanMessagePromptTemplate.from_template(
        "DOCUMENT CONTENT:\n{context}\n\nUSER REQUEST: {query}\n\n"
        "Return ONLY a valid JSON object with all relevant extracted fields."
    ),
])
