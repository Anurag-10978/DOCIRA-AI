"""
LangChain ChatOllama wrapper.
Replaces raw httpx calls with the official LangChain LLM interface.
Benefits:
  - Chains with | operator (prompt | llm | parser)
  - Consistent .invoke() / .ainvoke() interface
  - Built-in retry and timeout handling
  - Swap to ChatOpenAI / ChatAnthropic with 1 line
"""
import time
import asyncio
from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings


class LangChainOllamaClient:

    def __init__(self):
        # LangChain ChatOllama — same model, different interface
        self.llm = ChatGroq(
        model=settings.LLM_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0,
    )
        self.parser = StrOutputParser()

    async def generate_from_prompt(
        self,
        prompt: ChatPromptTemplate,
        variables: dict,
        temperature: float = 0.1,
    ) -> dict:
        """
        Run: prompt | llm | parser using LangChain LCEL (pipe operator).
        This is the canonical LangChain way — no manual string building.
        """
        start = time.time()

        # Build chain using LangChain pipe operator
        llm = self.llm.with_config({"temperature": temperature})
        chain = prompt | llm | self.parser

        # Run async
        text = await chain.ainvoke(variables)

        latency_ms = int((time.time() - start) * 1000)

        # Token count from LangChain callback (approximate)
        word_count = len(text.split())
        tokens_approx = int(word_count * 1.33)

        return {
            "text": text.strip(),
            "tokens_used": tokens_approx,
            "latency_ms": latency_ms,
            "model": settings.LLM_MODEL,
        }

    
    async def is_available(self) -> bool:
        try:
            await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.llm.invoke("ping")
            )
            return True
        except Exception:
            return False

    async def list_models(self) -> list[str]:
        return [settings.LLM_MODEL]


ollama_client = LangChainOllamaClient()