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

let rows = 0;           // set from server (view.rows)
let cols = 0;           // set from server (view.cols)
let me = 1;             // my player number (view.me)
let currentTurn = 1;    // whose turn it is (view.turn)
let currentStatus = ""; // "Waiting", "Live", "Finished"
let busy = false;       // prevent double moves
let dragCol = null;     // column hovered during drag
let currentView = null; // latest view from server

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
      cell.dataset.col = String(c); 

      const val = row[c] ?? 0;
      if (val) cell.classList.add(`is-p${val}`);
      if (winSet.has(`${r},${c}`)) cell.classList.add("is-win");

      boardEl.appendChild(cell);
    }
  }
}

function setStatus(view) {
  const status = (view.status || "").toLowerCase();

  if (status === "waiting") {
    statusEl.textContent = "Waiting for an opponent to join…";
    return;
  }

  if (status === "finished") {
    if (view.winner === 0) {
      statusEl.textContent = "Draw!";
    } else if (view.winner === me) {
      statusEl.textContent = "You win! 🎉";
    } else {
      statusEl.textContent = "You lose.";
    }
    return;
  }

  if (view.turn === me) {
    statusEl.textContent = "Your turn";
  } else {
    statusEl.textContent = `Opponent’s turn (Player ${view.turn})`;
  }
}

function appendMoveLog(nextTurn, colPlayed) {
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

function renderTray(view) {
  trayEl.replaceChildren();

  const board = view?.board;
  if (!Array.isArray(board) || !board.length || !rows || !cols) {
    trayEl.setAttribute("aria-label", "Your pieces");
    return;
  }

  const remaining = computeRemaining(board, me, rows, cols);
  const status = (view.status || "").toLowerCase();
  const isMyTurn = status === "live" && view.turn === me && view.winner === 0;

  for (let i = 0; i < remaining; i++) {
    const chip = document.createElement("div");
    chip.className = `chip p${me}`;
    if (isMyTurn) {
      chip.draggable = true;
      chip.addEventListener("dragstart", onDragStart);
    } else {
      chip.draggable = false;
    }
    trayEl.appendChild(chip);
  }

  trayEl.setAttribute("aria-label", `Your pieces (${remaining} available)`);
}


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


function onDragStart(e) {
  e.dataTransfer.setData("text/connect4-chip", "1");
  e.dataTransfer.effectAllowed = "copy";
}

boardEl.addEventListener("dragover", (e) => {
  if (!e.dataTransfer.types.includes("text/connect4-chip")) return;

  e.preventDefault(); 

  const cell = e.target.closest(".cell");
  if (!cell) return;

  const col = Number(cell.dataset.col);
  if (!Number.isInteger(col)) return;

  if (col !== dragCol) {
    dragCol = col;
    highlightColumn(col);
  }
});

boardEl.addEventListener("dragleave", (e) => {
  const related = e.relatedTarget;
  if (!related || !boardEl.contains(related)) {
    clearHighlight();
  }
});

boardEl.addEventListener("drop", async (e) => {
  if (!e.dataTransfer.types.includes("text/connect4-chip")) return;

  e.preventDefault();

  const cell = e.target.closest(".cell");
  const col = cell ? Number(cell.dataset.col) : dragCol;
  clearHighlight();

  if (!Number.isInteger(col)) return;

  await tryMove(col, true);
});


boardEl.addEventListener("click", async (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  const col = Number(cell.dataset.col);
  if (!Number.isInteger(col)) return;

  await tryMove(col, false);
});


async function tryMove(col, cameFromDrag) {
  if (!gameId || !token) {
    showError("Missing gameId or token.");
    return;
  }

  if (busy) return;

  const status = (currentStatus || "").toLowerCase();
  if (status !== "live") {
    if (status === "waiting") {
      showError("Game has not started yet. Wait for an opponent to join.");
    } else if (status === "finished") {
      showError("The game is already finished.");
    } else {
      showError("Game is not in a playable state.");
    }
    return;
  }

  if (currentTurn !== me) {
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

    showError("");
    updateFromView(res);

    if (cameFromDrag && trayEl.firstChild) {
      trayEl.removeChild(trayEl.firstChild);
    }

    appendMoveLog(res.turn, col);
  } finally {
    busy = false;
  }
}


function updateFromView(view) {
  if (!view) return;
  currentView = view;

  // Who am I? (server provides me)
  if (typeof view.me === "number") {
    me = view.me;
  }

  if (typeof view.cols === "number" && typeof view.rows === "number") {
    setBoardSize(view.cols, view.rows);
  } else if (Array.isArray(view.board) && view.board.length) {
    const inferredRows = view.board.length;
    const inferredCols = view.board[0]?.length ?? 0;
    if (inferredRows && inferredCols) setBoardSize(inferredCols, inferredRows);
  }

  currentTurn = view.turn;
  currentStatus = view.status || "";

  renderBoard(view.board, view.winLine || []);
  renderTray(view);
  setStatus(view);

  console.log("State:", {
    me,
    turn: currentTurn,
    status: currentStatus,
    winner: view.winner,
  });
}

async function loadState() {
  if (!gameId || !token) {
    showError("Missing gameId or token in URL.");
    return;
  }

  try {
    console.log("Polling state...");
    const view = await getState(gameId, token);
    if (view.error) {
      showError(view.error);
      return;
    }

    showError("");
    updateFromView(view);
  } catch (err) {
    console.error("Failed to load state", err);
    showError(err.message || "Unable to load game state.");
  }
}

refreshBtn.addEventListener("click", () => {
  void loadState();
});

setInterval(() => {
  void loadState();
}, 1500);

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
