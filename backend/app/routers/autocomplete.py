# from fastapi import APIRouter
# from ..schemas import AutoCompleteRequest, AutoCompleteResponse

# router = APIRouter()

# @router.post("/autocomplete", response_model=AutoCompleteResponse)
# async def autocomplete(req: AutoCompleteRequest):
#     code = req.code or ""
#     tail = code[max(0, req.cursorPosition - 20): req.cursorPosition].lower()

#     if tail.strip().endswith("def") or "def " in tail:
#         suggestion = "def fn_name(params):\n    \"\"\"TODO: add description\"\"\"\n    pass"
#     elif tail.strip().endswith("import") or "import " in tail:
#         suggestion = "import os\nimport sys"
#     elif "print" in code:
#         suggestion = "print('Hello, world')"
#     else:
#         suggestion = "# TODO: continue implementation"

#     return {"suggestion": suggestion}
# backend/app/routers/autocomplete.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class AutoCompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str

class AutoCompleteResponse(BaseModel):
    suggestions: list[str]

@router.post("/autocomplete", response_model=AutoCompleteResponse)
async def autocomplete(req: AutoCompleteRequest):

    code = req.code
    cursor = req.cursorPosition

    # Extract last token
    before_cursor = code[:cursor]
    last_word = before_cursor.split()[-1]

    # -------------------------
    # 1. MODULE ATTRIBUTE SUGGESTIONS (ex: os.)
    # -------------------------
    if last_word.endswith("."):
        module = last_word[:-1]

        python_std = {
            "os": ["listdir", "getcwd", "path", "remove", "mkdir", "rename"],
            "sys": ["stdout", "stderr", "path", "modules", "argv"],
            "json": ["load", "loads", "dump", "dumps"],
        }

        if module in python_std:
            return {"suggestions": python_std[module]}

        return {"suggestions": ["attr1", "attr2", "attr3"]}

    # -------------------------
    # 2. FUNCTION DEF TEMPLATE
    # -------------------------
    if last_word.startswith("def"):
        return {
            "suggestions": [
                "def function_name(params):",
                "def main():",
                "def handler(event):"
            ]
        }

    # -------------------------
    # 3. IMPORT SUGGESTIONS
    # -------------------------
    if last_word.startswith("import"):
        return {
            "suggestions": ["os", "sys", "json", "re", "math", "datetime"]
        }

    # -------------------------
    # 4. PRINT SUGGESTIONS
    # -------------------------
    if "print" in last_word:
        return {
            "suggestions": ["print()", "print('Hello')", "print(variable)"]
        }

    # -------------------------
    # 5. DEFAULT FALLBACK SUGGESTIONS
    # -------------------------
    return {
        "suggestions": [
            "pass",
            "return",
            "# TODO: Implement this",
            "raise NotImplementedError()"
        ]
    }
