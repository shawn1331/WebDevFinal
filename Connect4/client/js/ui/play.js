import { qs, getState, postMove } from '../svc/api.js';
import { fetchRandomAvatar } from '../svc/external.js';

const params = qs();
const gameId = params.get('gameId');
const token = params.get('token');

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const movesEl = document.getElementById('moves');
const refreshBtn = document.getElementById('refresh');
const trayEl = document.getElementById('tray');

let rows = 0;        
let cols = 0;      
let me = 1;          
let lastTurn = 1;    
let busy = false;    
let dragCol = null;  


function setBoardSize(c, r) {
  cols = c;
  rows = r;
  boardEl.style.setProperty('--cols', String(c));
  boardEl.style.setProperty('--rows', String(r));
}

function renderBoard(board, winLine = []) {
  if (!Array.isArray(board) || board.length === 0) return;

  if (!rows || !cols) {
    const inferredRows = board.length;
    const inferredCols = board[0]?.length ?? 0;
    if (inferredRows && inferredCols) {
      setBoardSize(inferredCols, inferredRows);
    }
  }

  boardEl.replaceChildren();
  const winSet = new Set(
    (winLine || []).map(x => `${x.Row},${x.Col}`)
  );

  for (let r = 0; r < rows; r++) {
    const row = board[r] || [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.col = String(c);  

      const val = row[c] ?? 0;
      if (val) cell.classList.add(`is-p${val}`);
      if (winSet.has(`${r},${c}`)) cell.classList.add('is-win');

      boardEl.appendChild(cell);
    }
  }
}

function setStatus(view) {
  if (view.Status === 'Finished') {
    if (view.Winner === 0) {
      statusEl.textContent = 'Draw!';
    } else if (view.Winner === me) {
      statusEl.textContent = 'You win! 🎉';
    } else {
      statusEl.textContent = `Player ${view.Winner} wins.`;
    }
  } else {
    statusEl.textContent = (view.Turn === me)
      ? 'Your turn'
      : `Opponent’s turn (Player ${view.Turn})`;
  }
}

function appendMoveLog(turnNext, colPlayed) {
  const whoPlayed = turnNext === 1 ? 2 : 1;
  const li = document.createElement('li');
  li.textContent = `P${whoPlayed} → Col ${colPlayed + 1}`;
  movesEl.appendChild(li);
}

function countPlacedFor(board, player) {
  let n = 0;
  for (let r = 0; r < board.length; r++) {
    const row = board[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c] === player) n++;
    }
  }
  return n;
}

function computeRemaining(board, me, r, c) {
  const totalMyChips = Math.floor((r * c) / 2);
  const placed = countPlacedFor(board, me);
  return Math.max(0, totalMyChips - placed);
}

function renderTray(board) {
  trayEl.replaceChildren();
  if (!Array.isArray(board) || !board.length || !rows || !cols) {
    trayEl.setAttribute('aria-label', 'Your pieces');
    return;
  }

  const remaining = computeRemaining(board, me, rows, cols);

  for (let i = 0; i < remaining; i++) {
    const chip = document.createElement('div');
    chip.className = `chip p${me}`;
    chip.draggable = true;
    chip.addEventListener('dragstart', onDragStart);
    trayEl.appendChild(chip);
  }

  trayEl.setAttribute('aria-label', `Your pieces (${remaining} available)`);
}


function highlightColumn(col) {
  boardEl.querySelectorAll('.col-hover').forEach(x => x.classList.remove('col-hover'));

  if (col == null) return;

  const cells = boardEl.querySelectorAll(`.cell[data-col="${col}"]`);
  cells.forEach(x => x.classList.add('col-hover'));
}

function clearHighlight() {
  dragCol = null;
  highlightColumn(null);
}


function onDragStart(e) {
  e.dataTransfer.setData('text/connect4-chip', '1');
  e.dataTransfer.effectAllowed = 'copy';
}

boardEl.addEventListener('dragover', (e) => {
  if (!e.dataTransfer.types.includes('text/connect4-chip')) return;

  e.preventDefault(); 

  const cell = e.target.closest('.cell');
  if (!cell) return;

  const col = Number(cell.dataset.col);
  if (!Number.isInteger(col)) return;

  if (col !== dragCol) {
    dragCol = col;
    highlightColumn(col);
  }
});

boardEl.addEventListener('dragleave', (e) => {
  const related = e.relatedTarget;
  if (!related || !boardEl.contains(related)) {
    clearHighlight();
  }
});

boardEl.addEventListener('drop', async (e) => {
  if (!e.dataTransfer.types.includes('text/connect4-chip')) return;

  e.preventDefault();

  const cell = e.target.closest('.cell');
  const col = cell ? Number(cell.dataset.col) : dragCol;
  clearHighlight();

  if (!Number.isInteger(col)) return;

  await tryMove(col, true);
});


boardEl.addEventListener('click', async (e) => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  const col = Number(cell.dataset.col);
  if (!Number.isInteger(col)) return;

  await tryMove(col, false);
});


async function tryMove(col, cameFromDrag) {
  if (!gameId || !token) {
    alert('Missing gameId or token.');
    return;
  }

  if (busy) return;

  if (lastTurn !== me) {
    alert("It's not your turn yet.");
    return;
  }

  busy = true;
  try {
    const res = await postMove(gameId, token, col);

    if (res.error) {
      alert(res.error);
      return;
    }

    updateFromView(res);

    if (cameFromDrag && trayEl.firstChild) {
      trayEl.removeChild(trayEl.firstChild);
    }

    appendMoveLog(res.Turn, col);
  } finally {
    busy = false;
  }
}


function updateFromView(view) {
  if (!view || view.error) return;

  if (typeof view.Me === 'number') {
    me = view.Me;
  }

  if (typeof view.Cols === 'number' && typeof view.Rows === 'number') {
    setBoardSize(view.Cols, view.Rows);
  } else if (Array.isArray(view.Board) && view.Board.length) {
    const inferredRows = view.Board.length;
    const inferredCols = view.Board[0]?.length ?? 0;
    if (inferredRows && inferredCols) {
      setBoardSize(inferredCols, inferredRows);
    }
  }

  renderBoard(view.Board, view.WinLine || []);
  renderTray(view.Board);
  setStatus(view);
  lastTurn = view.Turn;
}

async function loadState() {
  if (!gameId || !token) {
    alert('Missing gameId or token in URL.');
    return;
  }

  const view = await getState(gameId, token);

  if (view.error) {
    alert(view.error);
    return;
  }

  updateFromView(view);
}


refreshBtn.addEventListener('click', loadState);

fetchRandomAvatar().then(({ url, name }) => {
  const img = document.getElementById('avatar');
  const cap = document.getElementById('avatar-cap');
  if (img && url) img.src = url;
  if (cap) cap.textContent = name || 'Opponent';
}).catch(() => {
  const cap = document.getElementById('avatar-cap');
  if (cap) cap.textContent = 'Opponent';
});


loadState();
