const DEFAULT_BASE = localStorage.getItem("apiBase") || "http://localhost:5048";

export const BASE_URL = DEFAULT_BASE;

export async function listRooms() {
  const response = await fetch(`${BASE_URL}/api/rooms`);
  return response.json();
}

export async function createRoom(payload) {
  const response = await fetch(`${BASE_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function joinRoom(roomId, name) {
  const response = await fetch(`${BASE_URL}/api/rooms/${roomId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName: name }),
  });
  return response.json();
}

export async function getState(gameId, token) {
  const response = await fetch(
    `${BASE_URL}/api/games/${gameId}/state?token=${encodeURIComponent(token)}`
  );
  return response.json();
}

export async function postMove(gameId, token, column) {
  const response = await fetch(`${BASE_URL}/api/games/${gameId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, column }),
  });
  return response.json();
}

export function QueryString() {
  return new URLSearchParams(location.search);
}
