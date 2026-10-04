/**
 * @typedef {Object} HikingProfile
 * @property {number} people
 * @property {number|null} age
 * @property {number|null} heightCm
 * @property {number|null} weightKg
 * @property {'beginner'|'intermediate'|'expert'} experience
 * @property {'low'|'moderate'|'high'} intensity
 * @property {string} personalNotes
 */

export function initProfile(openProfile) {
  const form = document.getElementById('profileForm');
  const fields = {
    people: document.getElementById('profilePeople'),
    age: document.getElementById('profileAge'),
    heightCm: document.getElementById('profileHeight'),
    weightKg: document.getElementById('profileWeight'),
    experience: document.getElementById('profileExperience'),
    intensity: document.getElementById('profileIntensity'),
    personalNotes: document.getElementById('profileNotes'),
  };
  const defaults = { people: 1, age: null, heightCm: null, weightKg: null, experience: 'beginner', intensity: 'moderate', personalNotes: '' };
  try {
    const saved = JSON.parse(localStorage.getItem('ttf-profile') || '{}');
    for (const [key, field] of Object.entries(fields)) {
      const value = saved?.[key] ?? defaults[key];
      // Restore only values allowed by the same controls used for editing.
      field.value = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
      if (!field.checkValidity() || (field.tagName === 'SELECT' && !field.value)
        || (field.maxLength > 0 && field.value.length > field.maxLength)) {
        field.value = defaults[key] ?? '';
      }
    }
  } catch { /* Keep the HTML defaults if storage is unavailable or malformed. */ }

  /** @returns {HikingProfile} */
  function readProfile() {
    return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key,
      field.type === 'number' ? (field.value === '' ? null : Number(field.value)) : field.value.trim(),
    ]));
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', () => {
    if (!form.checkValidity()) return;
    try { localStorage.setItem('ttf-profile', JSON.stringify(readProfile())); } catch { /* Still usable without storage. */ }
  });
  return () => {
    if (form.checkValidity()) return readProfile();
    openProfile();
    form.reportValidity();
    return null;
  };
}
