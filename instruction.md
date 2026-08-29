# GitHub Copilot Instructions

## Project Overview

This repository contains a Flask-based Sudoku game developed as part of the Udacity GitHub Copilot Python project.

The application uses:
- Python and Flask for the backend
- JavaScript for interactive game behavior
- HTML for the user interface
- CSS for styling and responsive design
- pytest for automated testing

The goal is to refactor the original legacy Sudoku application into a maintainable, accessible, responsive game while preserving existing functionality.

## General Development Principles

When modifying this project:

- Prefer clear, readable, maintainable code.
- Make focused changes related to the requested feature.
- Do not rewrite working functionality unnecessarily.
- Preserve existing behavior unless the requirement explicitly asks for a change.
- Avoid unnecessary dependencies.
- Prefer reusable functions and components.
- Use meaningful variable and function names.
- Keep frontend, backend, and Sudoku logic responsibilities separated.
- Add comments only where they improve understanding.
- Handle invalid input and unexpected data safely.

## Sudoku Logic

The Sudoku logic must:

- Use a 9x9 board.
- Follow standard Sudoku rules.
- Ensure generated puzzles are solvable.
- Ensure generated puzzles have exactly one unique solution.
- Keep puzzle generation separate from presentation logic.
- Never allow invalid difficulty values to silently produce an invalid puzzle.

The solver and validation functions should remain deterministic in their behavior where practical and should be easy to test.

## Difficulty Levels

The application supports:

- Easy
- Medium
- Hard

Difficulty controls the number of prefilled cells.

When changing difficulty behavior:

- Keep the generated puzzle valid.
- Preserve the unique-solution requirement.
- Keep prefilled cells locked.
- Validate invalid difficulty values appropriately.

## User Interaction

The application supports:

- New Game
- Difficulty selection
- Immediate invalid/conflicting-entry feedback
- Check
- Hint
- Timer
- Completion detection
- Player-name entry
- Top 10 leaderboard
- Dark/light mode

Do not break an existing feature when implementing another feature.

## Prefilled and Hint Cells

Prefilled cells must remain locked and cannot be edited.

Hint-filled cells must:

- Contain the correct solution value.
- Become locked.
- Remain visually distinguishable from ordinary user-entered cells.
- Be counted toward the hint count.

## Validation

Invalid or conflicting user entries should provide immediate visual feedback.

The Check feature should identify incorrect user-entered values without incorrectly flagging:

- Correct entries
- Prefilled cells
- Hint-filled cells

An incomplete board must not be treated as a successfully solved puzzle.

## Timer and Completion

The timer should:

- Start when a new puzzle begins.
- Track elapsed solving time.
- Stop when the puzzle is correctly completed.
- Reset when a new puzzle begins.

Completion should only occur when:

- The board is completely filled.
- Every value matches the stored solution.

## Leaderboard

The Top 10 leaderboard should store:

- Player name
- Completion time
- Difficulty
- Number of hints

Leaderboard data is stored using browser localStorage.

When working with localStorage:

- Handle missing data safely.
- Handle malformed/corrupted JSON safely.
- Validate stored entries before rendering them.
- Keep only the fastest 10 valid scores.
- Never allow untrusted player names to become executable HTML.

Use safe DOM APIs such as textContent rather than inserting untrusted names through innerHTML.

## Dark and Light Mode

The application supports both dark and light themes.

When modifying styles:

- Keep text readable in both themes.
- Maintain sufficient contrast.
- Preserve visible focus indicators.
- Ensure buttons, inputs, messages, timer, leaderboard, and Sudoku cells remain readable.
- Preserve the alternating 3x3 Sudoku region styling in both themes.

## Sudoku Grid Styling

The nine 3x3 Sudoku regions should remain visually distinguishable.

Use the existing reusable region classes/data attributes where possible.

The alternating 3x3 region colors must not interfere with:

- Prefilled cells
- Hint cells
- Incorrect cells
- Focus states
- Editable cells

Special cell states should remain visually obvious.

## Responsive Design

The interface must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Avoid unnecessary fixed widths.

The Sudoku board must remain a square 9x9 grid.

Do not introduce horizontal scrolling on normal mobile screen sizes.

Buttons, selectors, messages, timer, and leaderboard should remain usable and readable on small screens.

## Accessibility

Follow practical WCAG 2.1 AA principles.

When adding or modifying UI elements:

- Use semantic HTML where appropriate.
- Provide accessible labels for controls.
- Ensure keyboard users can reach interactive elements.
- Preserve visible focus indicators.
- Use meaningful accessible labels for Sudoku cells.
- Use aria-invalid when appropriate for invalid entries.
- Do not rely solely on color to communicate important states.
- Maintain readable contrast in both themes.

## Testing Requirements

The existing pytest suite must be preserved.

After making a significant change, run:

```text
python -m pytest