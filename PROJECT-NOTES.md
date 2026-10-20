# Game Night project notes

## October 20, 2026

Source chat: Improve App Visibility (6acea27e-75cc-83e9-8f34-65e036c29272).
- Normal launch opens a chooser, with new sets, autosaved games and saved results. Do not automatically replace or erase a live game.
- Left/right navigate the show sequence. Undo is separate on U. Returning to a question must not expose an old answer unexpectedly.
- Presenter wording should describe the show, not internal state names or implementation details.

Current additions:
- October 20 PowerPoint is bundled as trivia-2026-10-20. Its 28 source slides become four round cards and 20 questions with 35 accepted answers. Bonus maximums are 10, 10, 10 and 30. Source text is retained; Facebook answer annotation belongs in private notes.
- Intro date and host name are editable from the intro controls. Trivia uses the event date rather than a hardcoded date in the set title. Both modes synchronize changes to the audience and persist them locally.

Standing preferences:
- White reading surfaces, black text, colorful edge accents. Audience readability takes priority.
- Normal questions and hidden answers share one stable layout; crowded finals have a separate answer view.
- Timer can be configured before revealing a question, with a full-width 0–10 minute slider, 30-second ticks, and one live timer button. Sound controls sit below.
- Full score entry is directly underneath the presenter controls and preview in both modes, with no page switching needed.
- Scores stay uncapped; all question columns and round/checkpoint totals remain visible.
- Test changes, then push to GitHub. Do not overwrite saved live events during verification.
