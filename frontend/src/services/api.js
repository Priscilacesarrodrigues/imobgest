const API_URL = 'http://localhost:3333';

/**
 * GET
 */
export async function apiGet(path) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Erro na API');
  }

  return data;
}

/**
 * POST
 */
export async function apiPost(path, body) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Erro na API');
  }

  return data;
}

/**
 * PATCH
 */
export async function apiPatch(path, body) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Erro na API');
  }

  return data;
}
