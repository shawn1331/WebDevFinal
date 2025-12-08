const DEFAULT_BASE = localStorage.getItem("apiBase") || "http://localhost:5048";

export const BASE_URL = "https://connect4-api-7zvm.onrender.com"; //|| DEFAULT_BASE;

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
  if (!response.ok) {
    let message = "Failed to create room";
    try {
      const problem = await res.json();
      if (problem && problem.error) {
        message = problem.error;
      }
    } catch {
    }
    throw new Error(message);
  }

  const data = await response.json();
  console.log("createRoom response", data);
  return data;
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

export async function getProfile(name) {
  const res = await fetch(
    `${BASE_URL}/api/profile/${encodeURIComponent(name)}`
  );
  if (!res.ok) {
    throw new Error("Failed to load profile");
  }
  return await res.json();
}
