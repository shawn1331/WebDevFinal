import { getProfile } from '../svc/api.js';
import { showError } from './shared.js';
import { getProfileName } from '../svc/profileStore.js';

const nameEl = document.getElementById('profile-name');
const statsEl = document.getElementById('profile-stats');

async function loadProfile() {
  const name = getProfileName();

  if (!name) {
    nameEl.textContent = 'No player name found.';
    statsEl.textContent = 'Play a game from the lobby so we can remember who you are!';
    return;
  }

  nameEl.textContent = `Player: ${name}`;

  try {
    const stats = await getProfile(name);
    const { gamesPlayed, wins, losses, draws } = stats;
    const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : '0.0';

    statsEl.innerHTML = `
      <ul class="profile-stats-list">
        <li>Games Played: <strong>${gamesPlayed}</strong></li>
        <li>Wins: <strong>${wins}</strong></li>
        <li>Losses: <strong>${losses}</strong></li>
        <li>Draws: <strong>${draws}</strong></li>
        <li>Win Rate: <strong>${winRate}%</strong></li>
      </ul>
    `;
    showError('');
  } catch (err) {
    console.error('Failed to load profile', err);
    showError('Unable to load profile right now.');
    statsEl.textContent = 'Unable to load profile right now.';
  }
}

loadProfile();
