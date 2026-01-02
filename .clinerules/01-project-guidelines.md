# Project Overview

## Basic Information

- **Project**: Legal AI Reception Desk
- **Purpose**: Automate initial response for legal consultations and conduct comprehensive initial hearings
- **Target Users**: General users seeking legal consultation
- **Architecture**: Simple configuration for fast validation cycles

## Technology Stack

- **Backend**: Python 3.12, FastAPI 0.104+, WebSockets, Uvicorn
- **Package Management**: UV (Python)

## Folder Structure

docs/ (Project-related documentation)
example/ (Sample code)
experiment/case{N}/ (Each experimental case)
src/ (Common functionality modules)
src/core/log.py (Logging functionality)
src/infrastructure/llm.py (LLM client)  # LLM Client (OpenAI/Bedrock support)

## Common Module Usage

**Logging Functionality**:

- Use `src.core.log.get_logger()` in new code
- Output logs with appropriate log levels (`info`, `warning`, `error`) instead of `print()`
- Log files are saved per module at `experiment/case{N}/logs/<module_name>.log`

**LLM Client**:

- Use `src.infrastructure.llm.get_llm_client()` when using LLM
- Select OpenAI as the provider
- Use through LangChain's `BaseChatModel` interface

## Response Language

- Always respond to users in Japanese (日本語)
