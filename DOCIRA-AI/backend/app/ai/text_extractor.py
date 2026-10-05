from langchain_community.document_loaders import (
    PyMuPDFLoader,
    Docx2txtLoader,
    TextLoader,
    UnstructuredMarkdownLoader,
)
from langchain_core.documents import Document
from typing import List
import os


class LangChainTextExtractor:
    """
    Uses LangChain's document loaders.
    Each loader returns List[Document] with page_content + metadata.
    Metadata includes: source, page (for PDF), etc.
    """

    def extract(self, file_path: str, file_type: str) -> dict:
        file_type = file_type.lower().lstrip(".")

        loaders = {
            "pdf":  lambda: PyMuPDFLoader(file_path),          # per-page Documents
            "docx": lambda: Docx2txtLoader(file_path),          # full text as 1 Document
            "txt":  lambda: TextLoader(file_path, encoding="utf-8"),
            "md":   lambda: UnstructuredMarkdownLoader(file_path),
        }

        loader_fn = loaders.get(file_type)
        if not loader_fn:
            raise ValueError(f"Unsupported file type: {file_type}")

        loader = loader_fn()
        docs: List[Document] = loader.load()

        # Normalize page numbers — PyMuPDF gives page in metadata, others don't
        pages = []
        for i, doc in enumerate(docs):
            page_num = doc.metadata.get("page", i + 1)
            if isinstance(page_num, int):
                page_num = page_num + 1  # PyMuPDF is 0-indexed
            pages.append({
                "page": page_num,
                "text": doc.page_content.strip(),
                "metadata": doc.metadata,
            })

        full_text = "\n\n".join(p["text"] for p in pages if p["text"])

        return {
            "pages": pages,
            "num_pages": len(pages),
            "full_text": full_text,
            "raw_docs": docs,   # keep raw for chunker
        }


text_extractor = LangChainTextExtractor()