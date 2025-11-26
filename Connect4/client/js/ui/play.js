import { QueryString, getState, postMove } from "../service/api.js";
import { fetchRandomAvatar } from "../service/external.js";
import { showError } from "./shared.js";

const params = QueryString();
const gameId = params.get("gameId");
const token = params.get("token");

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const movesEl = document.getElementById("moves");
const refreshBtn = document.getElementById("refresh");
const trayEl = document.getElementById("tray");

let rows = 0; // set from server (view.rows)
let cols = 0; // set from server (view.cols)
let me = 1; // my player number (view.me)
let lastTurn = 1; // whose turn it is (view.turn)
let busy = false; // prevent double moves
let dragCol = null; // column hovered during drag

// ---------- Helpers ----------

function setBoardSize(c, r) {
  cols = c;
  rows = r;
  boardEl.style.setProperty("--cols", String(c));
  boardEl.style.setProperty("--rows", String(r));
}

function renderBoard(board, winLine = []) {
  if (!Array.isArray(board) || board.length === 0) {
    boardEl.replaceChildren();
    return;
  }

  // If rows/cols not set yet, infer from board shape
  if (!rows || !cols) {
    const inferredRows = board.length;
    const inferredCols = board[0]?.length ?? 0;
    if (inferredRows && inferredCols) {
      setBoardSize(inferredCols, inferredRows);
    }
  }

  boardEl.replaceChildren();

  const winSet = new Set((winLine || []).map((x) => `${x.row},${x.col}`));

  for (let r = 0; r < rows; r++) {
    const row = board[r] || [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.col = String(c); // OPTION A: column encoded here

      const val = row[c] ?? 0;
      if (val) cell.classList.add(`is-p${val}`);
      if (winSet.has(`${r},${c}`)) cell.classList.add("is-win");

      boardEl.appendChild(cell);
    }
  }
}

function setStatus(view) {
  if (view.status === "Waiting" || view.status === "waiting") {
    statusEl.textContent = "Waiting for an opponent to join…";
    return;
  }
  if (view.status === "Finished" || view.status === "finished") {
    if (view.winner === 0) {
      statusEl.textContent = "Draw!";
    } else if (view.winner === me) {
      statusEl.textContent = "You win! 🎉";
    } else {
      statusEl.textContent = `Player ${view.winner} wins.`;
    }
  } else {
    statusEl.textContent =
      view.turn === me ? "Your turn" : `Opponent’s turn (Player ${view.turn})`;
  }
}

function appendMoveLog(nextTurn, colPlayed) {
  // nextTurn is who goes *next*, so the one who just played is the other one
  const whoPlayed = nextTurn === 1 ? 2 : 1;
  const li = document.createElement("li");
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

function computeRemaining(board, player, r, c) {
  const totalMyChips = Math.floor((r * c) / 2);
  const placed = countPlacedFor(board, player);
  return Math.max(0, totalMyChips - placed);
}

function renderTray(board) {
  trayEl.replaceChildren();

  if (!Array.isArray(board) || !board.length || !rows || !cols) {
    trayEl.setAttribute("aria-label", "Your pieces");
    return;
  }

  const remaining = computeRemaining(board, me, rows, cols);

  for (let i = 0; i < remaining; i++) {
    const chip = document.createElement("div");
    chip.className = `chip p${me}`;
    chip.draggable = true;
    chip.addEventListener("dragstart", onDragStart);
    trayEl.appendChild(chip);
  }

  trayEl.setAttribute("aria-label", `Your pieces (${remaining} available)`);
}

// ---------- Column highlighting for drag ----------

function highlightColumn(col) {
  boardEl
    .querySelectorAll(".col-hover")
    .forEach((x) => x.classList.remove("col-hover"));

  if (col == null) return;

  const cells = boardEl.querySelectorAll(`.cell[data-col="${col}"]`);
  cells.forEach((x) => x.classList.add("col-hover"));
}

function clearHighlight() {
  dragCol = null;
  highlightColumn(null);
}

// ---------- Drag & Drop handlers ----------

function onDragStart(e) {
  // Mark payload so we only accept drops from our chips
  e.dataTransfer.setData("text/connect4-chip", "1");
  e.dataTransfer.effectAllowed = "copy";
}

// Board dragover: track which column we're over, and highlight it
boardEl.addEventListener("dragover", (e) => {
  if (!e.dataTransfer.types.includes("text/connect4-chip")) return;

  e.preventDefault(); // allow drop

  const cell = e.target.closest(".cell");
  if (!cell) return;

  const col = Number(cell.dataset.col);
  if (!Number.isInteger(col)) return;

  if (col !== dragCol) {
    dragCol = col;
    highlightColumn(col);
  }
});

// When drag leaves the entire board, clear highlight
boardEl.addEventListener("dragleave", (e) => {
  const related = e.relatedTarget;
  if (!related || !boardEl.contains(related)) {
    clearHighlight();
  }
});

// Drop: use the column of the closest cell (or last hovered col)
boardEl.addEventListener("drop", async (e) => {
  if (!e.dataTransfer.types.includes("text/connect4-chip")) return;

  e.preventDefault();

  const cell = e.target.closest(".cell");
  const col = cell ? Number(cell.dataset.col) : dragCol;
  clearHighlight();

  if (!Number.isInteger(col)) return;

  await tryMove(col, true);
});

// ---------- Click-to-move fallback ----------

boardEl.addEventListener("click", async (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  const col = Number(cell.dataset.col);
  if (!Number.isInteger(col)) return;

  await tryMove(col, false);
});

// ---------- Core move handler (shared by drag & click) ----------

async function tryMove(col, cameFromDrag) {
  if (!gameId || !token) {
    showError("Missing gameId or token.");
    return;
  }

  if (busy) return;

  // Block if it’s not my turn — server-authoritative turn info
  if (lastTurn !== me) {
    showError("It's not your turn yet.");
    return;
  }

  busy = true;
  try {
    const res = await postMove(gameId, token, col);

    if (res.error) {
      showError(res.error);
      return;
    }

    showError('');
    updateFromView(res);

    // Optional: immediate visual feedback for drag
    if (cameFromDrag && trayEl.firstChild) {
      trayEl.removeChild(trayEl.firstChild);
    }

    appendMoveLog(res.turn, col);
  } finally {
    busy = false;
  }
}

// ---------- State loading & syncing (server-authoritative) ----------

function updateFromView(view) {
  if (!view) return;


  // Who am I? (server provides me)
  if (typeof view.me === "number") {
    me = view.me;
  }

  // Board size from server (camelCase)
  if (typeof view.cols === "number" && typeof view.rows === "number") {
    setBoardSize(view.cols, view.rows);
  } else if (Array.isArray(view.board) && view.board.length) {
    // Fallback: infer from board shape
    const inferredRows = view.board.length;
    const inferredCols = view.board[0]?.length ?? 0;
    if (inferredRows && inferredCols) setBoardSize(inferredCols, inferredRows);
  }

  renderBoard(view.board, view.winLine || []);
  renderTray(view.board);
  setStatus(view);
  lastTurn = view.turn; 
}

async function loadState() {
  if (!gameId || !token) {
    showError("Missing gameId or token in URL.");
    return;
  }

  const view = await getState(gameId, token);
  console.log(view);

  if (view.error) {
    showError(view.error);
    return;
  }

  showError('');
  updateFromView(view);
}


refreshBtn.addEventListener("click", loadState);

fetchRandomAvatar()
  .then(({ url, name }) => {
    const img = document.getElementById("avatar");
    const cap = document.getElementById("avatar-cap");
    if (img && url) img.src = url;
    if (cap) cap.textContent = name || "Opponent";
  })
  .catch(() => {
    const cap = document.getElementById("avatar-cap");
    if (cap) cap.textContent = "Opponent";
  });


loadState();
