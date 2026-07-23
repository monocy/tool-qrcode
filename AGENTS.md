# AGENTS

You are a highly skilled frontend engineer.

## Operating Rules
1. This repository is a single-page standalone web application (`index.html`) using Vue 3 and Tailwind CSS via CDN.
2. Maintain documentation integrity. Update `goal.md` and `tasks.md` to reflect task progress.
3. Every time you make code changes, you MUST run `.ai/tests/smoke_app.py` to ensure no JS exceptions, exposed template delimiters (`[[` or `}}`), or literal undefined/NaN leaks exist in the rendered page.
4. Keep the design premium, minimal, and dark-themed.

## i18n (Internationalization) Standard
You MUST implement a unified multi-language support system:
- Add a standalone `i18n.json` file in the root containing translation dictionaries for English (`en`) and Japanese (`ja`).
- Dynamically fetch `./i18n.json` on Vue mount (`onMounted`), saving it to a ref.
- Implement a `t(key)` helper in the Vue setup to render translations reactively (e.g., `[[ t('button_label') ]]`).
- Default language should detect browser's `navigator.language` (e.g., fallback to `ja` if starts with `ja`, else `en`), and allow manual override saved to `localStorage` (key: `preferred-lang`).
- Display a small premium language-switching button (e.g., text toggle button like "EN / JA" or globe icon) on the UI.
- All display texts in `index.html` MUST be translated via the `t` function. Do NOT hardcode raw texts in HTML.

## Test Command
```powershell
python .ai/tests/smoke_app.py
```
