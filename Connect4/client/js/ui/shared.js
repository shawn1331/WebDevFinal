export function mountShell() {
  const header = document.getElementById("site-header");
  const nav = document.createElement("nav");
  const link1 = document.createElement("a");
  const link2 = document.createElement("a");
  const link3 = document.createElement("a");
  link1.href = "index.html";
  link1.textContent = "Lobby";
  link2.href = "play.html";
  link2.textContent = "Play";
  link3.href = "profile.html";
  link3.textContent = "Profile";
  nav.appendChild(link1);
  nav.appendChild(link2);
  nav.appendChild(link3);
  header.appendChild(nav);
  const footer = document.getElementById("site-footer");
  const footerText = document.createElement("h4");
  footerText.textContent = `\u00A9 ${new Date().getFullYear()} Connect4`;
  footer.appendChild(footerText);
}

const ERROR_BAR_ID = 'error-bar';

export function showError(message) {
  const bar = document.getElementById(ERROR_BAR_ID);
  if (!bar) return;
  bar.textContent = message || '';
  if (message) {
    bar.classList.add('visible');
  } else {
    bar.classList.remove('visible');
  }
}

export function clearError() {
  showError('');
}



mountShell();
