// Current user and initials avatars, shared by both pages.
// There is no login yet: CURRENT_USER is a placeholder that login will replace.

const CURRENT_USER = { name: 'Dave F' };

const AVATAR_COLORS = [
  'text-bg-primary', 'text-bg-success', 'text-bg-danger', 'text-bg-warning',
  'text-bg-info', 'text-bg-secondary',
];

// First letter of the first and last words: "Ninja Admin" -> "NA", "Dave" -> "D"
function getInitials(name) {
  const words = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : '';
  return (first + last).toUpperCase();
}

// Same name always gets the same colour. Dark and light are left out of the
// palette because they would vanish against the dark navbar or a light card.
function avatarColor(name) {
  let hash = 0;
  for (const ch of String(name ?? '')) {
    hash = (hash * 31 + ch.codePointAt(0)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Returns escaped HTML for an initials circle
function avatarHtml(name) {
  const span = document.createElement('span');
  span.className = `avatar ${avatarColor(name)}`;
  span.setAttribute('aria-hidden', 'true');
  span.textContent = getInitials(name);
  return span.outerHTML;
}

(() => {
  const slot = document.getElementById('userAvatar');
  if (!slot) return;
  slot.innerHTML = avatarHtml(CURRENT_USER.name);
  slot.title = `Signed in as ${CURRENT_USER.name}`;
  slot.setAttribute('aria-label', slot.title);
})();
