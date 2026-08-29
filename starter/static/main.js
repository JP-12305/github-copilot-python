// Client-side rendering and interaction for the Flask-backed Sudoku
// Copilot review note: an earlier Copilot suggestion auto-saved the leaderboard as soon as the board was solved.
// That suggestion was rejected after review because it bypassed the required name prompt and could create
// duplicate or unintended leaderboard entries. The app now waits for an explicit player-name submit and only
// records the score if it qualifies for the Top 10 fastest times.
const SIZE = 9;
const LEADERBOARD_STORAGE_KEY = 'sudokuTopScores';
const THEME_STORAGE_KEY = 'sudokuTheme';
const MAX_LEADERBOARD_SIZE = 10;
const MAX_NAME_LENGTH = 30;
const DEFAULT_THEME = 'light';
const VALID_THEMES = new Set(['light', 'dark']);

let puzzle = [];
let lockedCells = [];
let hintedCells = [];
let hintCount = 0;
let gameActive = false;
let puzzleSolved = false;
let scoreRecordedForCompletedGame = false;
let timerIntervalId = null;
let timerStartedAt = 0;
let elapsedSeconds = 0;

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const displaySeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(displaySeconds).padStart(2, '0')}`;
}

function capitalize(value) {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function sanitizeName(value) {
  return String(value ?? '').trim().slice(0, MAX_NAME_LENGTH);
}

function getSavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && VALID_THEMES.has(savedTheme)) {
      return savedTheme;
    }
  } catch (error) {
    console.warn('Unable to read saved theme preference.', error);
  }
  return DEFAULT_THEME;
}

function applyTheme(theme) {
  const normalizedTheme = VALID_THEMES.has(theme) ? theme : DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', normalizedTheme);

  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    return;
  }

  const isDarkTheme = normalizedTheme === 'dark';
  themeToggle.textContent = isDarkTheme ? '☀️ Light Mode' : '🌙 Dark Mode';
  themeToggle.setAttribute('aria-label', isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.setAttribute('aria-pressed', String(isDarkTheme));

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  } catch (error) {
    console.warn('Unable to persist theme preference.', error);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function loadScores() {
  try {
    const rawScores = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!rawScores) {
      return [];
    }

    const parsedScores = JSON.parse(rawScores);
    if (!Array.isArray(parsedScores)) {
      return [];
    }

    return parsedScores
      .filter((score) => score && typeof score === 'object')
      .map((score) => ({
        name: sanitizeName(score.name),
        time: Number(score.time) || 0,
        difficulty: typeof score.difficulty === 'string' ? score.difficulty.toLowerCase() : 'medium',
        hints: Number(score.hints) || 0,
      }))
      .filter((score) => score.name.length > 0);
  } catch (error) {
    return [];
  }
}

function saveScores(scores) {
  try {
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(scores));
  } catch (error) {
    console.warn('Unable to persist leaderboard scores.', error);
  }
}

function sortScores(scores) {
  return [...scores].sort((left, right) => (Number(left.time) || 0) - (Number(right.time) || 0));
}

function limitScores(scores) {
  return sortScores(scores).slice(0, MAX_LEADERBOARD_SIZE);
}

function qualifiesForLeaderboard(existingScores, newScore) {
  const safeExistingScores = [...existingScores];
  if (safeExistingScores.length < MAX_LEADERBOARD_SIZE) {
    return true;
  }

  const sortedScores = sortScores(safeExistingScores);
  const tenthPlaceScore = sortedScores[MAX_LEADERBOARD_SIZE - 1];
  return Boolean(tenthPlaceScore) && Number(newScore.time || 0) < Number(tenthPlaceScore.time || 0);
}

function addScore(score) {
  const playerName = sanitizeName(score.name);
  if (!playerName) {
    return false;
  }

  const newScore = {
    name: playerName,
    time: Number(score.time) || 0,
    difficulty: typeof score.difficulty === 'string' ? score.difficulty.toLowerCase() : 'medium',
    hints: Number(score.hints) || 0,
  };

  const existingScores = loadScores();
  if (!qualifiesForLeaderboard(existingScores, newScore)) {
    return false;
  }

  const updatedScores = limitScores([...existingScores, newScore]);
  saveScores(updatedScores);
  renderLeaderboard();
  return true;
}

function renderLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboard-body');
  if (!leaderboardBody) {
    return;
  }

  const scores = limitScores(loadScores());
  leaderboardBody.innerHTML = '';

  if (scores.length === 0) {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 5;
    emptyCell.textContent = 'No completed games yet.';
    row.appendChild(emptyCell);
    leaderboardBody.appendChild(row);
    return;
  }

  scores.forEach((score, index) => {
    const row = document.createElement('tr');

    const rankCell = document.createElement('td');
    rankCell.textContent = String(index + 1);

    const nameCell = document.createElement('td');
    nameCell.textContent = score.name;

    const timeCell = document.createElement('td');
    timeCell.textContent = formatTime(score.time);

    const levelCell = document.createElement('td');
    levelCell.textContent = capitalize(score.difficulty);

    const hintsCell = document.createElement('td');
    hintsCell.textContent = String(score.hints);

    row.append(rankCell, nameCell, timeCell, levelCell, hintsCell);
    leaderboardBody.appendChild(row);
  });
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;
  const currentSeconds = gameActive ? Math.floor((Date.now() - timerStartedAt) / 1000) : elapsedSeconds;
  timerEl.innerText = `Time: ${formatTime(currentSeconds)}`;
}

function stopTimer() {
  gameActive = false;
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  const currentSeconds = Math.floor((Date.now() - timerStartedAt) / 1000);
  elapsedSeconds = currentSeconds > 0 ? currentSeconds : 0;
  updateTimerDisplay();
}

function startTimer() {
  stopTimer();
  gameActive = true;
  elapsedSeconds = 0;
  timerStartedAt = Date.now();
  updateTimerDisplay();
  timerIntervalId = setInterval(() => {
    if (!gameActive) return;
    updateTimerDisplay();
  }, 1000);
}

function getInputs() {
  return document.getElementById('sudoku-board').getElementsByTagName('input');
}

function getCellValue(row, col) {
  const input = getInputs()[row * SIZE + col];
  return input.value;
}

function updateCellAccessibleName(input) {
  const row = Number(input.dataset.row) + 1;
  const col = Number(input.dataset.col) + 1;
  const value = input.value || 'empty';
  const isLocked = input.disabled;
  const state = input.classList.contains('invalid') || input.classList.contains('incorrect')
    ? 'invalid or conflicting'
    : isLocked
      ? (input.classList.contains('prefilled') ? 'prefilled and locked' : 'hinted and locked')
      : 'editable';
  input.setAttribute('aria-label', `Row ${row}, column ${col}, ${value}, ${state}`);
}

function hasConflict(row, col) {
  const value = getCellValue(row, col);
  if (!value) return false;

  for (let index = 0; index < SIZE; index++) {
    if (index !== col && getCellValue(row, index) === value) return true;
    if (index !== row && getCellValue(index, col) === value) return true;
  }

  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let boxRow = startRow; boxRow < startRow + 3; boxRow++) {
    for (let boxCol = startCol; boxCol < startCol + 3; boxCol++) {
      if ((boxRow !== row || boxCol !== col) && getCellValue(boxRow, boxCol) === value) {
        return true;
      }
    }
  }
  return false;
}

function validateEntries() {
  const inputs = getInputs();
  for (let idx = 0; idx < inputs.length; idx++) {
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    if (!lockedCells[row][col]) {
      const hasCellConflict = hasConflict(row, col);
      inputs[idx].classList.toggle('invalid', hasCellConflict);
      inputs[idx].setAttribute('aria-invalid', String(hasCellConflict));
      updateCellAccessibleName(inputs[idx]);
    }
  }
}

function setMessage(text, color = 'var(--error-color)') {
  const msg = document.getElementById('message');
  msg.innerText = text;
  msg.style.color = color;
}

function closeLeaderboardModal() {
  const modal = document.getElementById('leaderboard-modal');
  if (!modal) {
    return;
  }
  modal.classList.add('hidden');
  const input = document.getElementById('player-name');
  if (input) {
    input.value = '';
  }
}

function showLeaderboardModal() {
  const modal = document.getElementById('leaderboard-modal');
  const input = document.getElementById('player-name');
  if (!modal || !input) {
    return;
  }
  input.value = '';
  modal.classList.remove('hidden');
  input.focus();
}

function completePuzzle() {
  if (puzzleSolved) {
    return;
  }
  puzzleSolved = true;
  scoreRecordedForCompletedGame = false;
  stopTimer();
  const finalTime = elapsedSeconds || Math.floor((Date.now() - timerStartedAt) / 1000);
  setMessage(`Congratulations! You solved it in ${formatTime(finalTime)}!`, 'var(--success-color)');
  const inputs = getInputs();
  for (let idx = 0; idx < inputs.length; idx++) {
    inputs[idx].disabled = true;
  }
  showLeaderboardModal();
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.classList.add((Math.floor(i / 3) + Math.floor(j / 3)) % 2 === 0 ? 'box-light' : 'box-dark');
      input.dataset.row = i;
      input.dataset.col = j;
      updateCellAccessibleName(input);
      input.addEventListener('input', async (e) => {
        if (puzzleSolved) {
          e.target.value = puzzle[Number(e.target.dataset.row)][Number(e.target.dataset.col)];
          return;
        }
        const row = Number(e.target.dataset.row);
        const col = Number(e.target.dataset.col);
        if (lockedCells[row][col]) {
          e.target.value = puzzle[row][col];
          updateCellAccessibleName(e.target);
          return;
        }
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        e.target.classList.remove('incorrect');
        updateCellAccessibleName(e.target);
        validateEntries();
        await evaluateBoardCompletion();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  lockedCells = puzzle.map((row) => row.map((value) => value !== 0));
  hintedCells = puzzle.map((row) => row.map(() => false));
  hintCount = 0;
  puzzleSolved = false;
  scoreRecordedForCompletedGame = false;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
      }
      updateCellAccessibleName(inp);
    }
  }
  document.getElementById('hint-count').innerText = 'Hints used: 0';
  setMessage('', 'var(--error-color)');
  closeLeaderboardModal();
  updateTimerDisplay();
}

function getBoard() {
  const inputs = getInputs();
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const value = inputs[i * SIZE + j].value;
      board[i][j] = value ? parseInt(value, 10) : 0;
    }
  }
  return board;
}

async function evaluateBoardCompletion({ showMessage = false } = {}) {
  const inputs = getInputs();
  const board = getBoard();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board}),
  });
  const data = await res.json();
  if (data.error) {
    setMessage(data.error);
    return false;
  }

  const incorrect = new Set(data.incorrect.map(([row, col]) => row * SIZE + col));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.classList.remove('incorrect');
    const isIncorrect = incorrect.has(idx) && inp.value !== '';
    inp.classList.toggle('incorrect', isIncorrect);
    inp.setAttribute('aria-invalid', String(isIncorrect));
    updateCellAccessibleName(inp);
  }

  if (data.completed) {
    completePuzzle();
    return true;
  }

  if (showMessage) {
    const incomplete = Array.from(inputs).some((input) => input.value === '');
    if (incorrect.size === 0 && incomplete) {
      setMessage('The puzzle is incomplete.', '#d32f2f');
    } else if (incorrect.size > 0) {
      setMessage('Some cells are incorrect.', '#d32f2f');
    }
  }
  return false;
}

async function requestHint() {
  if (puzzleSolved) {
    return;
  }
  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board: getBoard()}),
  });
  const data = await res.json();
  if (data.error) {
    setMessage(data.error);
    return;
  }

  hintCount = data.hint_count;
  document.getElementById('hint-count').innerText = `Hints used: ${hintCount}`;
  if (data.row === undefined) {
    setMessage(data.message);
    return;
  }

  const idx = data.row * SIZE + data.col;
  const input = getInputs()[idx];
  input.value = data.value;
  hintedCells[data.row][data.col] = true;
  lockedCells[data.row][data.col] = true;
  input.disabled = true;
  input.classList.add('hinted');
  input.classList.remove('invalid', 'incorrect');
  updateCellAccessibleName(input);
  setMessage('', 'var(--error-color)');
  await evaluateBoardCompletion();
}

function handleLeaderboardSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('player-name');
  if (!nameInput) {
    return;
  }

  if (scoreRecordedForCompletedGame || !puzzleSolved) {
    return;
  }

  const playerName = sanitizeName(nameInput.value);
  if (!playerName) {
    setMessage('Please enter a player name for the leaderboard.', 'var(--error-color)');
    nameInput.focus();
    return;
  }

  const finalTime = elapsedSeconds || Math.floor((Date.now() - timerStartedAt) / 1000);
  const didSave = addScore({
    name: playerName,
    time: finalTime,
    difficulty: document.getElementById('difficulty').value,
    hints: hintCount,
  });

  if (didSave) {
    scoreRecordedForCompletedGame = true;
  }

  closeLeaderboardModal();
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  if (data.error) {
    setMessage(data.error);
    return;
  }
  scoreRecordedForCompletedGame = false;
  renderPuzzle(data.puzzle);
  startTimer();
}

async function checkSolution() {
  await evaluateBoardCompletion({showMessage: true});
}

// Wire buttons
window.addEventListener('load', () => {
  applyTheme(getSavedTheme());
  renderLeaderboard();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint').addEventListener('click', requestHint);
  document.getElementById('difficulty').addEventListener('change', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('leaderboard-form').addEventListener('submit', handleLeaderboardSubmit);
  document.getElementById('leaderboard-cancel').addEventListener('click', closeLeaderboardModal);
  // initialize
  newGame();
});