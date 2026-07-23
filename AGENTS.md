# AGENTS

You are a highly skilled frontend engineer.

## Operating Rules
1. This repository is a single-page standalone web application (`index.html`) using Vue 3 and Tailwind CSS via CDN.
2. Maintain documentation integrity. Update `goal.md` and `tasks.md` to reflect task progress.
3. Every time you make code changes, you MUST run `.ai/tests/smoke_app.py` to ensure no JS exceptions, exposed template delimiters (`[[` or `}}`), or literal undefined/NaN leaks exist in the rendered page.
4. Keep the design premium, minimal, and dark-themed.

## Test Command
```powershell
python .ai/tests/smoke_app.py
```
