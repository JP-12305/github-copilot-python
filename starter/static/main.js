// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let lockedCells = [];
let hintedCells = [];
let hintCount = 0;

function getInputs() {
  return document.getElementById('sudoku-board').getElementsByTagName('input');
}

function getCellValue(row, col) {
  const input = getInputs()[row * SIZE + col];
  return input.value;
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
      inputs[idx].classList.toggle('invalid', hasConflict(row, col));
    }
  }
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
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const row = Number(e.target.dataset.row);
        const col = Number(e.target.dataset.col);
        if (lockedCells[row][col]) {
          e.target.value = puzzle[row][col];
          return;
        }
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        e.target.classList.remove('incorrect');
        validateEntries();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  lockedCells = puzzle.map(row => row.map(value => value !== 0));
  hintedCells = puzzle.map(row => row.map(() => false));
  hintCount = 0;
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
    }
  }
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

async function requestHint() {
  const res = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board: getBoard()})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }

  hintCount = data.hint_count;
  document.getElementById('hint-count').innerText = `Hints used: ${hintCount}`;
  if (data.row === undefined) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.message;
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
  msg.innerText = '';
}

async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  document.getElementById('message').innerText = '';
}

async function checkSolution() {
  const inputs = getInputs();
  const board = getBoard();
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.classList.remove('incorrect');
    inp.classList.toggle('incorrect', incorrect.has(idx) && inp.value !== '');
  }
  const incomplete = Array.from(inputs).some(input => input.value === '');
  if (incorrect.size === 0 && incomplete) {
    msg.style.color = '#d32f2f';
    msg.innerText = 'The puzzle is incomplete.';
  } else if (incorrect.size === 0) {
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint').addEventListener('click', requestHint);
  document.getElementById('difficulty').addEventListener('change', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  // initialize
  newGame();
});