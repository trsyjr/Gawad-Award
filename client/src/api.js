const API_BASE = '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    const err = new Error('Cannot reach the voting server. Check your connection and try again.');
    err.code = 'network';
    throw err;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong. Please try again.');
    err.code = data.error;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const getConfig = () => request('/config');

// Clean parameter passing for employees endpoint
export const getEmployees = (category) =>
  request(category ? `/employees?category=${encodeURIComponent(category)}` : '/employees');

export const startSession = (email) => request('/session', { method: 'POST', body: JSON.stringify({ email }) });
export const castVote = (payload) => request('/vote', { method: 'POST', body: JSON.stringify(payload) });