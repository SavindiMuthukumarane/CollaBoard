const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('collabboard_token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (_error) {
    throw new ApiError('The server is unreachable. Cached information is still available.', 0, null);
  }

  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data?.message || `Request failed with status ${response.status}`, response.status, data);
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getBoards: () => request('/boards'),
  getBoard: (id) => request(`/boards/${id}`),
  createBoard: (payload) => request('/boards', { method: 'POST', body: JSON.stringify(payload) }),
  updateBoard: (id, payload) => request(`/boards/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBoard: (id) => request(`/boards/${id}`, { method: 'DELETE' }),
  getTasks: (boardId) => request(`/boards/${boardId}/tasks`),
  createTask: (boardId, payload) => request(`/boards/${boardId}/tasks`, { method: 'POST', body: JSON.stringify(payload) }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  moveTask: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
};