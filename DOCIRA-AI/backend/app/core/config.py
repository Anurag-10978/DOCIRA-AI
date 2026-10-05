from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    QDRANT_URL: str = "http://localhost:6333"
    OLLAMA_URL: str = "http://localhost:11434"

    GROQ_API_KEY: str
    SECRET_KEY: str

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    UPLOAD_DIR: str = "./uploads"
    APP_NAME: str = "DOCIRA-AI"
    DEBUG: bool = True

    LLM_MODEL: str
    EMBEDDING_MODEL: str = "nomic-embed-text"

    VECTOR_DIM: int = 768
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    MAX_CONTEXT_CHUNKS: int = 6

    class Config:
        env_file = ".env"


settings = Settings()