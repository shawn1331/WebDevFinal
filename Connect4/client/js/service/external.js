export async function fetchRandomAvatar() {
  const r = await fetch("https://randomuser.me/api/?inc=picture,name");
  const j = await r.json();
  const p = j.results?.[0];
  return {
    url: p?.picture?.medium ?? "",
    name: `${p?.name?.first ?? "Guest"} ${p?.name?.last ?? ""}`.trim(),
  };
}
