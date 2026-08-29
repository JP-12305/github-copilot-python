# GitHub Copilot Python Sudoku

A feature-rich Sudoku game built with Python Flask and JavaScript as
part of the Udacity **GitHub Copilot Python** project.

The original starter application was a simple Sudoku game. The project
was refactored and extended with puzzle validation, difficulty levels,
interactive feedback, hints, a timer, completion detection, a persistent
Top 10 leaderboard, dark/light mode, responsive design, and
accessibility improvements.

## Features

### Sudoku Game

-   9×9 Sudoku board.
-   Generates valid Sudoku puzzles.
-   Generated puzzles are required to have exactly one unique solution.
-   Easy, Medium, and Hard difficulty levels.
-   Difficulty levels control the number of prefilled cells.
-   Prefilled cells are locked and cannot be edited.
-   User-entered values are validated immediately.
-   Conflicting/incorrect entries receive visual feedback.
-   Check button identifies incorrect entries.
-   Hint button fills one correct empty cell and locks it.
-   Hint count is tracked for completed games.
-   Completion is detected only when the entire board is correctly
    solved.
-   A completion message is displayed when the puzzle is solved.

### Timer

-   Timer starts with a new game.
-   Tracks the player's solving time.
-   Stops when the puzzle is completed.
-   Timer state resets for a new puzzle.

### Top 10 Leaderboard

-   Stores completed-game scores locally in the browser.
-   Records player name, completion time, difficulty, and number of
    hints.
-   Keeps the fastest 10 scores.
-   Persists between browser sessions using `localStorage`.
-   Handles corrupted or unexpected `localStorage` data safely.
-   Player names are sanitized and rendered safely.

### Dark/Light Mode

-   Dark/light mode toggle.
-   Theme preference persists using browser storage.
-   Sudoku cells, controls, messages, timer, modal, and leaderboard
    remain readable in both themes.

### Visual Design

-   Alternating background treatment for the nine 3×3 Sudoku regions.
-   Strong borders separate the 3×3 regions.
-   Prefilled, hinted, focused, and incorrect states remain visually
    distinguishable.
-   Responsive layout for desktop, tablet, and mobile screen sizes.

### Accessibility

-   Keyboard-accessible controls.
-   Visible focus indicators.
-   Accessible labels for Sudoku cells and controls.
-   `aria-invalid` feedback for invalid/conflicting entries where
    appropriate.
-   Semantic page/table markup.
-   Color is not intended to be the only indicator of important states.
-   Contrast and readability are maintained across light and dark
    themes.

## Technology Stack

-   Python 3
-   Flask
-   JavaScript
-   HTML5
-   CSS3
-   pytest
-   Browser `localStorage`
-   Git and GitHub
-   GitHub Copilot

## Project Structure

``` text
github-copilot-python/
├── starter/
│   ├── static/
│   │   ├── main.js
│   │   └── styles.css
│   ├── templates/
│   │   └── index.html
│   ├── tests/
│   │   ├── test_app.py
│   │   └── test_sudoku_logic.py
│   ├── .venv/
│   ├── app.py
│   ├── sudoku_logic.py
│   ├── pytest.ini
│   └── requirements.txt
├── screenshots/
│   ├── initial_tests.png
│   ├── copilot_testing_setup.png
│   ├── copilot_unique_solution.png
│   ├── copilot_difficulty_levels.png
│   ├── copilot_cell_validation.png
│   ├── copilot_hint_feature.png
│   ├── copilot_timer_completion.png
│   ├── copilot_leaderboard_localstorage.png
│   ├── copilot_dark_mode.png
│   ├── copilot_3x3_colors.png
│   ├── copilot_responsive_accessibility.png
│   ├── difficulty_levels_working.png
│   ├── invalid_entry.png
│   ├── check_incorrect_entry.png
│   ├── prefilled_cells_locked.png
│   ├── hint_working.png
│   ├── light_mode_working.png
│   └── dark_mode_working.png
├── .gitignore
├── CODEOWNERS
├── LICENSE.txt
└── README.md
```

## Setup

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd github-copilot-python/starter
```

### 2. Create a virtual environment

On Windows:

``` powershell
py -m venv .venv
```

Activate it in PowerShell:

``` powershell
.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

``` powershell
py -m pip install -r requirements.txt
```

### 4. Run the Flask application

From the `starter` directory:

``` powershell
py app.py
```

Open:

``` text
http://127.0.0.1:5000/
```

## Running the Tests

The project uses **pytest**.

From the `starter` directory:

``` powershell
py -m pytest
```

The test suite covers Sudoku logic and Flask application behavior,
including unique-solution validation, difficulty handling, board
validation, Check behavior, Hint behavior, completion behavior, and
state-reset behavior.

The current verified test suite contains **21 tests**. Run the command
locally to obtain the current result after future changes.

## Development and Testing Approach

The project was developed incrementally with GitHub Copilot.

Major milestones were:

1.  Set up pytest.
2.  Ensure generated puzzles have exactly one unique solution.
3.  Implement Easy, Medium, and Hard difficulty levels.
4.  Add prefilled-cell tracking and locking.
5.  Implement immediate conflict/invalid-entry feedback.
6.  Implement Check functionality.
7.  Implement Hint functionality and hint tracking.
8.  Implement timer and completion detection.
9.  Implement the Top 10 leaderboard and `localStorage` persistence.
10. Implement dark/light mode.
11. Add alternating 3×3 region colors.
12. Improve responsive behavior and accessibility.
13. Verify the complete test suite and manually validate the browser UI.

GitHub Copilot was used as an assistant rather than blindly accepting
generated code. Suggestions were reviewed, tested, and adjusted when
necessary. Tests were run after major implementation stages to ensure
existing functionality was preserved.

## Copilot Evidence

The `screenshots` folder contains screenshots documenting the
Copilot-assisted development process and application results.

### Testing

-   `copilot_testing_setup.png` --- pytest setup and baseline testing.
-   `initial_tests.png` --- initial test-suite verification.

### Sudoku Logic

-   `copilot_unique_solution.png` --- unique-solution implementation.

### Difficulty Levels

-   `copilot_difficulty_levels.png` --- difficulty implementation.
-   `difficulty_levels_working.png` --- working difficulty selector.

### Validation

-   `copilot_cell_validation.png` --- immediate validation
    implementation.
-   `invalid_entry.png` --- incorrect entry feedback.
-   `check_incorrect_entry.png` --- Check functionality.
-   `prefilled_cells_locked.png` --- locked prefilled cells.

### Hint

-   `copilot_hint_feature.png` --- Hint implementation.
-   `hint_working.png` --- working Hint behavior.

### Timer and Completion

-   `copilot_timer_completion.png` --- timer and completion
    implementation.

### Leaderboard

-   `copilot_leaderboard_localstorage.png` --- Top 10 leaderboard and
    `localStorage` persistence.

### Dark/Light Mode

-   `copilot_dark_mode.png` --- theme implementation.
-   `light_mode_working.png` --- light mode.
-   `dark_mode_working.png` --- dark mode.

### 3×3 Colors

-   `copilot_3x3_colors.png` --- alternating colors for the nine 3×3
    regions.

### Responsive and Accessibility

-   `copilot_responsive_accessibility.png` --- responsive layout and
    accessibility improvements.

## Manual Verification Checklist

After starting the Flask application, verify:

-   [ ] New Game generates a new puzzle.
-   [ ] Easy, Medium, and Hard generate different clue counts.
-   [ ] Prefilled cells cannot be edited.
-   [ ] User-entered conflicts are highlighted immediately.
-   [ ] Check identifies incorrect entries.
-   [ ] Hint fills one correct empty cell and locks it.
-   [ ] Hint count increases appropriately.
-   [ ] Timer starts with a new game.
-   [ ] Timer stops when the puzzle is correctly completed.
-   [ ] Completing a puzzle displays the completion message.
-   [ ] Player-name entry appears for a completed score.
-   [ ] Completed scores appear in the Top 10 leaderboard.
-   [ ] Leaderboard survives a browser refresh.
-   [ ] More than 10 scores are limited to the fastest 10.
-   [ ] Dark mode changes the complete interface.
-   [ ] Theme preference persists after refresh.
-   [ ] The nine 3×3 regions have alternating visual treatments.
-   [ ] Incorrect, hinted, focused, and prefilled cells remain
    distinguishable.
-   [ ] The interface fits on mobile without unwanted horizontal
    scrolling.
-   [ ] Keyboard users can navigate the controls.
-   [ ] Focus indicators remain visible.
-   [ ] Text and controls remain readable in both themes.

## Project Requirements Covered

  Requirement                            Status
  -------------------------------------- ----------
  Flask Sudoku application               Complete
  Easy / Medium / Hard difficulty        Complete
  Exactly one unique solution            Complete
  Prefilled cells locked                 Complete
  Immediate invalid-move feedback        Complete
  Check button                           Complete
  Hint button                            Complete
  Timer                                  Complete
  Completion detection/message           Complete
  Top 10 leaderboard                     Complete
  Name/time/difficulty/hints in scores   Complete
  `localStorage` persistence             Complete
  Dark/light mode                        Complete
  Alternating 3×3 colors                 Complete
  Responsive desktop/mobile layout       Complete
  Accessibility improvements             Complete
  Automated pytest coverage              Complete
  Copilot milestone screenshots          Included

## Notes

The project intentionally keeps the frontend lightweight and uses the
existing Flask + HTML/CSS/JavaScript architecture rather than
introducing a frontend framework.

The leaderboard and theme preference are browser-side features and
depend on browser `localStorage`.

For the final submission, make sure the repository includes both the
complete application and the `screenshots` folder containing the Copilot
and application evidence requested by the project rubric.

## License

See `LICENSE.txt` for license information.
