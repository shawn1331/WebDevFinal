import { createRoom, listRooms, joinRoom } from "../service/api.js";
import { showError } from "./shared.js";
import { setProfileName } from "../service/profileStore.js";

const createForm = document.getElementById("create-form");
const filterForm = document.getElementById("filter-form");
const roomsList = document.getElementById("rooms-list");

function renderRooms(items) {
  roomsList.replaceChildren();

  items.forEach((r) => {
    // Support both camelCase (from API) and PascalCase (just in case)
    const id = r.id ?? r.Id;
    const name = r.name ?? r.Name ?? "(no name)";
    const size = r.size ?? r.Size ?? "";
    const ranked = r.ranked ?? r.Ranked ?? false;
    const open = r.open ?? r.Open ?? false;
    const hostName = r.hostName ?? r.HostName ?? "Unknown";

    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${name}</strong> — ${size || "Unknown size"}
      • ${ranked ? "Ranked" : "Casual"}
      • ${open ? "Open" : "Full"}
      • Host: ${hostName}
      ${open ? `<a href="#" data-room="${id}">Join</a>` : ""}
    `;

    const link = li.querySelector("a[data-room]");
    if (link) {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const displayName = prompt("Your display name?") || "Guest";
        setProfileName(displayName);

        try {
          const res = await joinRoom(id, displayName);
          if (res.error) {
            showError(res.error);
            return;
          }
          // res.gameId & res.guestToken from API
          location.href = `play.html?gameId=${
            res.gameId
          }&token=${encodeURIComponent(res.guestToken)}`;
        } catch (err) {
          console.error("Join failed", err);
          showError("Unable to join room right now.");
        }
      });
    }

    roomsList.appendChild(li);
  });
}

async function refresh() {
  try {
    const data = await listRooms();

    const fd = new FormData(filterForm);
    const q = (fd.get("q") || "").toString().toLowerCase();
    const sizeVal = (fd.get("size") || "").toString();
    const ranked = (fd.get("ranked") || "").toString();
    const openOnly = fd.get("openOnly") === "on";

    const filtered = data
      // filter by host name text
      .filter((r) => {
        const host = (r.hostName ?? r.HostName ?? "").toString().toLowerCase();
        return !q || host.includes(q);
      })
      // filter by size
      .filter((r) => {
        const s = r.size ?? r.Size ?? "";
        return !sizeVal || s === sizeVal;
      })
      // filter by ranked/casual
      .filter((r) => {
        if (!ranked) return true;
        const isRanked = (r.ranked ?? r.Ranked) === true;
        return String(isRanked) === ranked;
      })
      // filter by open only
      .filter((r) => {
        if (!openOnly) return true;
        const isOpen = (r.open ?? r.Open) === true;
        return isOpen;
      });

    showError("");
    renderRooms(filtered);
  } catch (err) {
    console.error("Failed to load rooms", err);
    showError("Unable to load rooms right now.");
    roomsList.textContent = "Unable to load rooms.";
  }
}

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(createForm);
  const hostName = fd.get("hostName");

  const payload = {
    hostName: fd.get("hostName"),
    roomName: fd.get("roomName"),
    size: fd.get("size"),
    timerSec: Number(fd.get("timerSec") || 0),
    ranked: fd.get("ranked") === "true",
  };

  console.log("Create room payload", payload);

  if (hostName) {
    setProfileName(hostName);
  }

  try {
    const res = await createRoom(payload);
    if (res.error) {
      showError(res.error);
      return;
    }
    // host token from API
    location.href = `play.html?gameId=${res.gameId}&token=${encodeURIComponent(
      res.hostToken
    )}`;
  } catch (err) {
    console.error("Create room failed", err);
    showError("Unable to create room right now.");
  }
});

filterForm.addEventListener("input", refresh);

refresh();
