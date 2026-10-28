# Validation

Validated on October 27, 2026.

- TypeScript typecheck: passed.
- ESLint: passed.
- Production build: passed.
- Unit and integration tests: 67 passed, including the supplied-game parser, PowerPoint extraction, question data, persistence, timers, scoring, tied reveals, and show navigation.
- Isolated Edge browser check: passed for presenter/audience synchronization, forward/back navigation, clickable answer toggles, sequential Space reveals, score-cell answer keys, standings, finalist turns, reload persistence, and +30-second controls in both modes.
- All included Family Feud question controls and the two tested finalist turns fit a 1366×768 presenter viewport. The audience preview is wider than the control column. The new layout was visually inspected.
- Starting a new Family Feud game from the chooser archives existing scores and creates an empty score sheet with no default host name.
- Tracked text was checked for personal host names and local user-directory paths. Generated screenshots and result exports are excluded from the current repository tree.

Browser checks use a separate profile and do not modify the user's saved event. Physical TV output and speaker volume still depend on the connected equipment and operating-system settings.

Run `node scripts/presenter-stack-test.mjs` with the production server on port 4173 to repeat the current presenter workflow checks. Some older browser scripts describe previous interfaces; the unit suite and current presenter workflow check are the validation targets for this revision.
