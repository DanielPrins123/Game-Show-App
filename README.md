# Game Night

A local browser app for hosting trivia and survey-answer games. It includes a presenter view, a separate audience display, question editors, team scoring, standings reveals, timers, and saved results.

## Run on Windows

Install Node.js 22 or newer, then double-click **Start Game.cmd**. The launcher installs dependencies when needed, builds the app, and opens the game chooser. First setup requires an internet connection; installed games run locally afterward.

- **Build Game.cmd** rebuilds the app.
- **Stop Game.cmd** stops the local server.
- The app opens at `http://127.0.0.1:4173/`.

Keep the project folder together. Use the local server rather than opening `dist/index.html` directly. After pulling an update, restart the launcher and refresh existing browser tabs.

## Choose a game

The opening page provides separate Trivia and Family Feud choices. Start a set, resume the current game, open saved results, or edit a set. Starting a new game archives the current scores. Intro date and host name are editable; the host name is blank by default.

## Presenter and audience

Keep the presenter on the host computer. **Open audience display** opens a separate view for the TV. On Windows, use **Win + P → Extend**, then move the audience window to the TV. Double-click that window for fullscreen. Both windows must use the same browser profile and server address.

The presenter shows navigation and reveal controls beside a large audience preview. The score grid and answer key sit below it. Sound controls, result saving, and exports are near the bottom of the page.

**Next / Previous** and the arrow keys move through the show. Intro, instructions, round titles, question titles, questions, and standings are part of the sequence. Opening a question starts its timer. Moving backward pauses the timer and does not undo entered scores. Revisited questions start with answers hidden.

Family Feud answer buttons toggle individual answers. **Space** reveals the next hidden answer or the next standings group. Trivia uses the reveal button or Space. Multiple-part trivia questions can pair each hint with an equally sized answer box.

| Key | Action |
| --- | --- |
| Left / Right | Previous / next slide |
| Space | Reveal next answer or standings group |
| U | Undo the last presentation action |
| T | Start / pause timer |
| + | Add 30 seconds |
| 1–8 | Toggle the corresponding Family Feud answer |
| X | Add a strike during a Family Feud final turn |

Presentation shortcuts do not run while entering scores or editing fields.

## Timers and sound

Set question time with the 0–10 minute slider in 30-second steps. Changes made on a question title are saved before the question opens. **+30 sec** adds time during play. Timers use timestamps, so background tabs do not slow them down.

Automatic trivia times are 3:30 for one answer, 4:30 for two to four answers, 5:30 for larger questions, and 6:30 for finals. Explicit custom times take precedence. Family Feud final turns default to 60 seconds and can be adjusted.

Use **Enable / test sound** to activate audio in the presenter. Choose volume, mute, or countdown ticks below the score grid. Sounds are generated locally; no external audio files are required. Select the desired speakers or HDMI output in Windows.

## Scores and standings

Enter points directly in the grid. All question columns, round subtotals, totals, and team ranks are available together. Score fields do not impose a question maximum. Blank cells mean no grade has been entered; zero is a recorded score.

Selecting a score cell shows that question's private answer key without changing the audience slide. Enter moves down to the next team, Shift+Enter moves up, and Tab moves across the row. Up/down arrows also move between teams.

**Remove teams** below the grid shows removal buttons; press it again to hide them. Deletion requires confirmation. At least one team remains.

Standings appear at the scheduled breaks and at the end. The display shows up to ten teams, lowest score first. Hidden rows do not reveal ranks or ties. Teams with equal scores appear together. Tied ranks use competition ranking, such as 1, 1, 3.

## Family Feud format

The included source retains four rounds, sixteen questions, and eighty-two ranked answers with their survey counts. Live play uses fifteen questions followed by a timed final. The original sixteenth question is available as a final option with its six highest-ranked answers.

Regular answers are worth one point; bonus answers are worth two. Final answers are worth four points each. Scores are entered manually; revealing an answer never grades a team. Survey counts are displayed separately from earned points.

Select up to five finalists at the standings break before the final. Each team has a title and question in the show sequence. The host can change its question, restart a turn, or go back. Three strikes, time expiry, or revealing all answers ends the timed turn. Answers can still be reviewed afterward without changing scores.

## Editors and imports

Trivia sets support editable questions, prompts, answers, scoring text, and individual timers. Drag questions in the editor list to reorder them. Applying edits preserves the current audience question when possible and does not expose unrevealed answers. Deleting the current question returns to a title card.

Trivia text import accepts round headings, questions, answers, and optional scoring/timing fields. JSON exports preserve a full editable set. PowerPoint import extracts content for review; it does not reproduce every PowerPoint layout or animation. Review imported content before starting.

The Family Feud editor supports JSON, TXT, CSV, and pasted questions. CSV columns are `round,question,bonus,points,timer,rank,answer,count`, with one answer per row. Quote fields containing commas. Review the parser preview before saving.

## Saving and moving between computers

Game state and score entry save locally in the browser. Reopening the same browser profile and address restores them. Clearing browser storage removes these saves.

Use **Save result** or **Save dated result** at the bottom of the page to keep an event record. Export results JSON for backup or transfer, and CSV for spreadsheet use. Export game JSON to transfer an editable set. GitHub synchronizes app files, not browser saves.

## Development

Built with React, TypeScript, and Vite.

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

Browser checks use Playwright with Microsoft Edge and an isolated profile. With the production server running on port 4173, run `node scripts/presenter-stack-test.mjs`. Optional PowerPoint integration tests use the `PPTX_SAMPLE_PATH` environment variable. Generated screenshots and result exports are stored locally under `qa/` and excluded from Git.
