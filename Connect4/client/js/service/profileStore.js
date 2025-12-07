const KEY = 'displayName';

export function setProfileName(name) {
  if (typeof name === 'string' && name.trim() !== '') {
    localStorage.setItem(KEY, name.trim());
  }
}

export function getProfileName() {
  return localStorage.getItem(KEY) || '';
}