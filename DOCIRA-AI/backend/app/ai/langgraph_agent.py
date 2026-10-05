"""
LangGraph agent with 5 nodes.
Each node uses a LangChain LCEL chain: prompt | ChatOllama | StrOutputParser
This is the key architectural point — LangGraph for orchestration,
LangChain for generation inside each node.
"""
import json
import time
from typing import TypedDict, Optional, List, Dict, Any

from langgraph.graph import StateGraph, END

from app.ai.ollama_client import ollama_client
from app.ai.rag_engine import rag_engine
from app.ai.prompts import qa_prompt, summarize_prompt, compare_prompt, extract_prompt
from app.schemas.chat import CitationOut


# ── Agent State ───────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    # Input
    query: str
    knowledge_base_id: int
    document_ids: Optional[List[int]]
    forced_task_type: Optional[str]

    # Routing
    task_type: str              # qa | summarize | compare | extract

    # Retrieval results (from LangChain vectorstore)
    retrieved_chunks: List[Dict]
    context_text: str
    context_a: str
    context_b: str
    doc_a_title: str
    doc_b_title: str
    citations: List[CitationOut]
    chunks_retrieved: int

    # Generation results (from LangChain LCEL chain)
    llm_response: str
    tokens_used: int
    latency_ms: int
    model: str

    error: Optional[str]


# ── Node 1: Classify Query ────────────────────────────────────────────────────

async def classify_query(state: AgentState) -> AgentState:
    """
    Route the query to correct task.
    Uses keyword heuristics — fast, no LLM call needed for routing.
    """
    if state.get("forced_task_type"):
        return {**state, "task_type": state["forced_task_type"]}

    q = state["query"].lower()

    if any(kw in q for kw in ["compare", "difference", "vs", "versus", "contrast", "both documents", "which is better"]):
        task = "compare"
    elif any(kw in q for kw in ["summarize", "summary", "overview", "brief", "tldr", "key points", "main points"]):
        task = "summarize"
    elif any(kw in q for kw in ["extract", "list all", "find all", "get all", "invoice", "parties", "payment terms", "structured"]):
        task = "extract"
    else:
        task = "qa"

    return {**state, "task_type": task}


# ── Node 2: Retrieve Chunks (LangChain Vectorstore) ──────────────────────────

async def retrieve_chunks(state: AgentState) -> AgentState:
    """
    Uses LangChain QdrantVectorStore.similarity_search_with_score().
    For compare: parallel retrieval from two docs using asyncio.gather().
    """
    query   = state["query"]
    kb_id   = state["knowledge_base_id"]
    doc_ids = state.get("document_ids")

    if state["task_type"] == "compare" and doc_ids and len(doc_ids) >= 2:
        # Parallel retrieval for two documents
        result = await rag_engine.retrieve_for_compare(
            query, kb_id, doc_ids[0], doc_ids[1]
        )
        return {
            **state,
            "retrieved_chunks": result["chunks_a"] + result["chunks_b"],
            "context_text":     "",
            "context_a":        result["context_a"],
            "context_b":        result["context_b"],
            "doc_a_title":      result["doc_a_title"],
            "doc_b_title":      result["doc_b_title"],
            "citations":        result["citations"],
            "chunks_retrieved": len(result["chunks_a"]) + len(result["chunks_b"]),
        }
    else:
        limit = 8 if state["task_type"] == "summarize" else 6
        result = await rag_engine.retrieve(query, kb_id, limit=limit, document_ids=doc_ids)
        return {
            **state,
            "retrieved_chunks": result["chunks"],
            "context_text":     result["context_text"],
            "context_a":        "",
            "context_b":        "",
            "doc_a_title":      "",
            "doc_b_title":      "",
            "citations":        result["citations"],
            "chunks_retrieved": len(result["chunks"]),
        }


# ── Node 3: QA (LangChain LCEL: qa_prompt | ChatOllama | StrOutputParser) ───

async def run_qa(state: AgentState) -> AgentState:
    """
    LangChain chain: qa_prompt | llm | parser
    Grounded Q&A using retrieved context.
    """
    if not state["retrieved_chunks"]:
        return {
            **state,
            "llm_response": "I could not find relevant information in the uploaded documents. Ensure documents are fully indexed (status: Completed).",
            "tokens_used": 0, "latency_ms": 0,
        }

    result = await ollama_client.generate_from_prompt(
        prompt=qa_prompt,
        variables={
            "context": state["context_text"],
            "query":   state["query"],
        },
        temperature=0.1,
    )
    return {**state, "llm_response": result["text"], "tokens_used": result["tokens_used"],
            "latency_ms": result["latency_ms"], "model": result["model"]}


# ── Node 4: Summarize (LangChain LCEL: summarize_prompt | ChatOllama | parser)

async def run_summarize(state: AgentState) -> AgentState:
    """
    LangChain chain: summarize_prompt | llm | parser
    Generates structured ## Key Points / ## Summary format.
    """
    if not state["retrieved_chunks"]:
        return {
            **state,
            "llm_response": "No document content found to summarize. Ensure the document is fully indexed.",
            "tokens_used": 0, "latency_ms": 0,
        }

    result = await ollama_client.generate_from_prompt(
        prompt=summarize_prompt,
        variables={
            "context": state["context_text"],
            "query":   state["query"],
        },
        temperature=0.2,
    )
    return {**state, "llm_response": result["text"], "tokens_used": result["tokens_used"],
            "latency_ms": result["latency_ms"], "model": result["model"]}


# ── Node 5: Compare (LangChain LCEL: compare_prompt | ChatOllama | parser) ───

async def run_compare(state: AgentState) -> AgentState:
    """
    LangChain chain: compare_prompt | llm | parser
    Side-by-side diff of two documents.
    """
    if not state["retrieved_chunks"]:
        return {
            **state,
            "llm_response": "No document content found. Select two fully indexed documents to compare.",
            "tokens_used": 0, "latency_ms": 0,
        }

    doc_a_title = state.get("doc_a_title") or "Document A"
    doc_b_title = state.get("doc_b_title") or "Document B"

    result = await ollama_client.generate_from_prompt(
        prompt=compare_prompt,
        variables={
            "doc_a_title": doc_a_title,
            "context_a":   state.get("context_a") or state["context_text"],
            "doc_b_title": doc_b_title,
            "context_b":   state.get("context_b") or "",
            "query":       state["query"],
        },
        temperature=0.15,
    )
    return {**state, "llm_response": result["text"], "tokens_used": result["tokens_used"],
            "latency_ms": result["latency_ms"], "model": result["model"]}


# ── Node 6: Extract (LangChain LCEL: extract_prompt | ChatOllama | parser) ───

async def run_extract(state: AgentState) -> AgentState:
    """
    LangChain chain: extract_prompt | llm | parser
    Returns structured JSON extracted from document.
    """
    if not state["retrieved_chunks"]:
        return {**state, "llm_response": "{}", "tokens_used": 0, "latency_ms": 0}

    result = await ollama_client.generate_from_prompt(
        prompt=extract_prompt,
        variables={
            "context": state["context_text"],
            "query":   state["query"],
        },
        temperature=0.0,    # zero temp for deterministic JSON
    )

    # Clean and validate JSON
    raw = result["text"].strip()
    try:
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        parsed = json.loads(raw.strip())
        formatted = json.dumps(parsed, indent=2)
    except Exception:
        formatted = raw

    return {**state, "llm_response": formatted, "tokens_used": result["tokens_used"],
            "latency_ms": result["latency_ms"], "model": result["model"]}


# ── Routing Function ──────────────────────────────────────────────────────────

def route_after_retrieve(state: AgentState) -> str:
    """
    Conditional edge: after retrieval, route to correct task node.
    This is what makes LangGraph an orchestrator, not a simple chain.
    """
    return state["task_type"]


# ── Build LangGraph ───────────────────────────────────────────────────────────

def build_agent():
    """
    Graph topology:
    classify → retrieve → [qa | summarize | compare | extract] → END

    Each task node uses LangChain LCEL internally:
        ChatPromptTemplate | ChatOllama | StrOutputParser
    """
    graph = StateGraph(AgentState)

    # Register nodes
    graph.add_node("classify",  classify_query)
    graph.add_node("retrieve",  retrieve_chunks)
    graph.add_node("qa",        run_qa)
    graph.add_node("summarize", run_summarize)
    graph.add_node("compare",   run_compare)
    graph.add_node("extract",   run_extract)

    # Entry
    graph.set_entry_point("classify")

    # classify → retrieve (always)
    graph.add_edge("classify", "retrieve")

    # retrieve → conditional branch to task node
    graph.add_conditional_edges(
        "retrieve",
        route_after_retrieve,
        {
            "qa":        "qa",
            "summarize": "summarize",
            "compare":   "compare",
            "extract":   "extract",
        },
    )

    # All task nodes → END
    graph.add_edge("qa",        END)
    graph.add_edge("summarize", END)
    graph.add_edge("compare",   END)
    graph.add_edge("extract",   END)

    return graph.compile()


# Singleton
_agent = None

def get_agent():
    global _agent
    if _agent is None:
        _agent = build_agent()
    return _agent


# ── Public entry point ────────────────────────────────────────────────────────

async def run_agent(
    query: str,
    knowledge_base_id: int,
    document_ids: Optional[List[int]] = None,
    forced_task_type: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Run the full LangGraph agent.
    Returns response + citations + metadata.
    """
    agent = get_agent()

    initial_state: AgentState = {
        "query":             query,
        "knowledge_base_id": knowledge_base_id,
        "document_ids":      document_ids,
        "forced_task_type":  forced_task_type,
        "task_type":         "qa",
        "retrieved_chunks":  [],
        "context_text":      "",
        "context_a":         "",
        "context_b":         "",
        "doc_a_title":       "",
        "doc_b_title":       "",
        "citations":         [],
        "chunks_retrieved":  0,
        "llm_response":      "",
        "tokens_used":       0,
        "latency_ms":        0,
        "model":             "",
        "error":             None,
    }

    final_state = await agent.ainvoke(initial_state)

    return {
        "response":  final_state["llm_response"],
        "task_type": final_state["task_type"],
        "citations": final_state["citations"],
        "metadata": {
            "model":           final_state.get("model", settings.LLM_MODEL),
            "task_type":       final_state["task_type"],
            "chunks_retrieved":final_state["chunks_retrieved"],
            "tokens_used":     final_state.get("tokens_used", 0),
            "latency_ms":      final_state.get("latency_ms", 0),
            "embedding_model": settings.EMBEDDING_MODEL,
        },
    }


# import at bottom to avoid circular
from app.core.config import settings