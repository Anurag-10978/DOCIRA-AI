import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.ai.embedder import ollama_embedder
from app.core.database import SessionLocal
from app.models.document import Document
from app.ai.text_extractor import text_extractor
from app.ai.chunker import document_chunker
from app.ai.vector_store import vector_store


def _now(): return datetime.utcnow().strftime("%H:%M:%S")


async def process_document(doc_id: int):
    """
    LangChain-powered pipeline:
    PyMuPDFLoader → RecursiveCharacterTextSplitter → OllamaEmbeddings → Qdrant
    """
    db: Session = SessionLocal()
    logs = []

    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return

        def save(status=None):
            doc.processing_logs = logs.copy()
            if status: doc.status = status
            db.commit()

        # Step 1: Extract with LangChain loaders
        logs.append(f"[{_now()}] 🚀 Starting LangChain pipeline: {doc.filename}")
        save("processing")

        logs.append(f"[{_now()}] 📄 Loading with LangChain {doc.file_type.upper()} loader...")
        save()
        extracted = text_extractor.extract(doc.file_path, doc.file_type)
        doc.num_pages = extracted["num_pages"]
        logs.append(f"[{_now()}] ✅ Loaded {doc.num_pages} pages via LangChain loader")
        save()

        # Step 2: Chunk with RecursiveCharacterTextSplitter
        logs.append(f"[{_now()}] ✂️  Chunking with RecursiveCharacterTextSplitter (size=1000, overlap=200)...")
        save()
        document_meta = {
            "document_id": doc.id,
            "knowledge_base_id": doc.knowledge_base_id,
            "title": doc.title,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "category": doc.category,
            "tags": doc.tags or [],
        }
        chunks = document_chunker.chunk(extracted["raw_docs"], document_meta)
        logs.append(f"[{_now()}] ✅ Created {len(chunks)} semantic chunks (sentence-boundary aware)")
        save()

        if not chunks:
            raise ValueError("No text content found in document")

        # Step 3 + 4: Embed + Store — ONE CALL via LangChain
        logs.append(f"[{_now()}] 🧠 Embedding + indexing via LangChain OllamaEmbeddings + Qdrant...")
        logs.append(f"[{_now()}]    Model: nomic-embed-text | Collection: kb_{doc.knowledge_base_id}")
        save()

        collection = f"kb_{doc.knowledge_base_id}"
        print("Testing embed inside pipeline...")

        test = await ollama_embedder.embed("hello world")
        print("Embedding length:", len(test))

        ids = await vector_store.add_chunks(collection, chunks)

        logs.append(f"[{_now()}] ✅ {len(ids)} vectors stored in Qdrant via LangChain")
        save()

        # Done
        doc.status = "completed"
        doc.chunk_count = len(chunks)
        doc.vector_ids = ids
        doc.processed_at = datetime.utcnow()
        logs.append(f"[{_now()}] 🎉 LangChain pipeline complete! {len(chunks)} chunks indexed.")
        save("completed")

    except Exception as e:
        logs.append(f"[{_now()}] ❌ Error: {str(e)}")
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = "failed"
            doc.error_message = str(e)
            doc.processing_logs = logs
            db.commit()
    finally:
        db.close()


async def reprocess_document(doc_id: int):
    db: Session = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc: return
        vector_store.delete_by_document(f"kb_{doc.knowledge_base_id}", doc_id)
        doc.status = "pending"
        doc.processing_logs = [f"[{_now()}] 🔄 Reprocessing with LangChain pipeline..."]
        doc.chunk_count = 0
        doc.vector_ids = []
        doc.error_message = None
        doc.processed_at = None
        db.commit()
        db.close()
        await process_document(doc_id)
    except Exception as e:
        db.close()
        raise e
    
    