import { qs, getState, postMove } from "../svc/api.js";
import { fetchRandomAvatar } from "../svc/external.js";

const params = qs();
const gameId = params.get("gameId");
const token = params.get("token");

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const movesEl = document.getElementById("moves");
const refreshBtn = document.getElementById("refresh");

let rows = 6,
  cols = 7;
let lastTurn = 1;

function setBoardSize(c, r) {
  boardEl.style.setProperty("--cols", c);
  boardEl.style.setProperty("--rows", r);
  cols = c;
  rows = r;
}

function renderBoard(board, winLine = []) {
  boardEl.replaceChildren();
  const winSet = new Set(winLine.map((x) => `${x.Row},${x.Col}`));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.col = String(c); // OPTION A
      const val = board[r][c];
      if (val) cell.classList.add(`is-p${val}`);
      if (winSet.has(`${r},${c}`)) cell.classList.add("is-win");
      boardEl.appendChild(cell);
    }
  }
}

function setStatus(view) {
  if (view.Status === "Finished") {
    statusEl.textContent =
      view.Winner === 0 ? "Draw!" : `Player ${view.Winner} wins!`;
  } else {
    statusEl.textContent = `Turn: Player ${view.Turn}`;
  }
}

async function loadState() {
  if (!gameId || !token) {
    alert("Missing gameId or token.");
    return;
  }
  const view = await getState(gameId, token);
  if (view.error) {
    alert(view.error);
    return;
  }
  setBoardSize(view.Cols, view.Rows);
  renderBoard(view.Board, view.WinLine || []);
  setStatus(view);
  lastTurn = view.Turn;
}

async function handleBoardClick(e) {
  const target = e.target.closest(".cell");
  if (!target) return;
  const col = Number(target.dataset.col);
  const response = await postMove(gameId, token, col);
  if (response.error) {
    alert(response.error);
    return;
  }
  renderBoard(response.Board, response.WinLine || []);
  setStatus(response);
  appendMoveLog(response.Turn, col);
}

function appendMoveLog(turnNext, colPlayed) {
  const whoPlayed = turnNext === 1 ? 2 : 1;
  const li = document.createElement("li");
  li.textContent = `P${whoPlayed} → Col ${colPlayed + 1}`;
  movesEl.appendChild(li);
}

boardEl.addEventListener("click", handleBoardClick);
refreshBtn.addEventListener("click", loadState);

loadState();
fetchRandomAvatar().then(({ url, name }) => {
  const img = document.getElementById("avatar");
  const cap = document.getElementById("avatar-cap");
  if (img && url) img.src = url;
  if (cap) cap.textContent = name;
});
