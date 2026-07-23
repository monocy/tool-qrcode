# Goal

## Status

`in_progress`

## Objective

Build, refine, and verify the standalone frontend tool with full internationalization (i18n) support.

## Next actions

1. Run standalone Playwright smoke test (`python .ai/tests/smoke_app.py`) to verify current baseline.
2. Implement the unified i18n support standard: create `i18n.json`, implement dynamic translation loading via fetch and `t(key)` function in `index.html`, integrate a premium language-switching button on the UI, and replace all hardcoded text strings with translations.
3. Improve design detailing (transitions, premium micro-animations) to make it look premium and state-of-the-art.

## Acceptance criteria

- [ ] Standalone Playwright smoke test PASS
- [ ] i18n.json file is created and loaded dynamically
- [ ] Translation helper `t` is implemented and active for all UI strings
- [ ] Language switching button is functional and state persists in localStorage
