import { createRoom, listRooms } from "../svc/api.js";

const createForm = document.getElementById("create-form");
const filterForm = document.getElementById("filter-form");
const roomsList = document.getElementById("rooms-list");

function renderRooms(items) {
  roomsList.replaceChildren();
  items.forEach((r) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${r.Name}</strong> — ${r.Size} • ${
      r.Ranked ? "Ranked" : "Casual"
    } • ${r.Open ? "Open" : "Full"} • Host: ${r.HostName}
      ${r.Open ? `<a href="#" data-room="${r.Id}">Join</a>` : ""}`;
    const link = li.querySelector("a[data-room]");
    if (link) {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const name = prompt("Your display name?") || "Guest";
        const res = await joinRoom(r.Id, name);
        if (res.error) {
          alert(res.error);
          return;
        }
        location.href = `/client/play.html?gameId=${
          res.gameId
        }&token=${encodeURIComponent(res.guestToken)}`;
      });
    }
    roomsList.appendChild(li);
  });
}

async function refresh() {
  const data = await listRooms();
  const formData = new FormData(filterForm);
  const q = (formData.get("q") || "").toString().toLowerCase();
  const size = (formData.get("size") || "").toString();
  const ranked = (formData.get("ranked") || "").toString();
  const openOnly = formData.get("openOnly") === "on";
  const filtered = data
    .filter((r) => !q || r.HostName.toLowerCase().includes(q))
    .filter((r) => !size || r.Size === size)
    .filter((r) => !ranked || String(r.Ranked) === ranked)
    .filter((r) => !openOnly || r.Open === true);
  renderRooms(filtered);
}

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(createForm);
  const payload = {
    hostName: formData.get("hostName"),
    roomName: formData.get("roomName"),
    size: formData.get("size"),
    timerSec: Number(formData.get("timerSec") || 0),
    ranked: formData.get("ranked") === "true",
  };
  const response = await createRoom(payload);
  if (response.error) {
    alert(response.error);
    return;
  }
  location.href = `/client/play.html?gameId=${
    response.gameId
  }&token=${encodeURIComponent(response.hostToken)}`;
});

filterForm.addEventListener("input", refresh);
refresh();
