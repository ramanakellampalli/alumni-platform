const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const saveSession = (key, data) => {
  localStorage.setItem(key, JSON.stringify({
    data,
    expiresAt: Date.now() + SESSION_TTL
  }));
};

export const loadSession = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const clearSession = (key) => {
  localStorage.removeItem(key);
};
