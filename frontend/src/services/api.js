const API_URL = 'http://localhost:3333';

async function safeParse(response) {
  const text = await response.text();
  const ct = response.headers.get('content-type') || '';

  // Se vier JSON, tenta parsear
  if (ct.includes('application/json')) {
    try {
      return JSON.parse(text || '{}');
    } catch {
      throw new Error(`JSON inválido do servidor. HTTP ${response.status}`);
    }
  }

  // Se não for JSON (ex: HTML), devolve como bruto para diagnóstico
  return { __raw: text };
}

function buildApiError(response, data) {
  const raw = data?.__raw ? data.__raw.slice(0, 220).replace(/\s+/g, ' ').trim() : '';
  // Prioriza mensagem do backend; senão mostra preview do HTML/texto; senão genérico
  return new Error(data?.message || raw || `Erro na API (HTTP ${response.status})`);
}

/* GET */
export async function apiGet(path) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await safeParse(response);

  if (!response.ok) {
    throw buildApiError(response, data);
  }

  return data;
}

/* POST */
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

  const data = await safeParse(response);

  if (!response.ok) {
    throw buildApiError(response, data);
  }

  return data;
}

/* PATCH */
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

  const data = await safeParse(response);

  if (!response.ok) {
    throw buildApiError(response, data);
  }

  return data;
}
