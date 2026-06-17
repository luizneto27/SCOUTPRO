const API_BASE = '/api/v1';

class HttpError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

async function request(path, options = {}) {
  const { headers: customHeaders, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(customHeaders || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Erro ao chamar ${path}`;
    throw new HttpError(message, response.status, data);
  }

  return data;
}

function queryString(params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (entries.length === 0) {
    return '';
  }

  return `?${new URLSearchParams(entries).toString()}`;
}

function normalizeCnpj(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function normalizePageResponse(data) {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length,
      raw: data,
    };
  }

  const content = data?.content ?? data?.page?.content ?? data?.items ?? [];
  const totalElements = data?.totalElements ?? data?.page?.totalElements ?? content.length;
  const totalPages = data?.totalPages ?? data?.page?.totalPages ?? 1;
  const number = data?.number ?? data?.page?.number ?? 0;
  const size = data?.size ?? data?.page?.size ?? content.length;

  return {
    content,
    totalElements,
    totalPages,
    number,
    size,
    raw: data,
  };
}

export function isAuthError(error) {
  return error instanceof HttpError && (error.status === 401 || error.status === 403);
}

export function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function createUser(payload) {
  return request('/usuarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token) {
  return request('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function listJogadores(token, params = {}) {
  return request(`/jogadores${queryString(params)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(normalizePageResponse);
}

export function createJogador(token, payload) {
  return request('/jogadores', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateJogador(token, id, payload) {
  return request(`/jogadores/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteJogador(token, id) {
  return request(`/jogadores/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function listClubes(token) {
  return request('/clubes', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createClube(token, payload) {
  return request('/clubes', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateClube(token, cnpj, payload) {
  return request(`/clubes/${normalizeCnpj(cnpj)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteClube(token, cnpj) {
  return request(`/clubes/${normalizeCnpj(cnpj)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function listClubeJogadores(token, cnpj) {
  return request(`/clubes/jogadores${queryString({ cnpj: normalizeCnpj(cnpj) })}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function listCampeonatos(token, params = {}) {
  return request(`/campeonatos${queryString(params)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(normalizePageResponse);
}

export function createCampeonato(token, payload) {
  return request('/campeonatos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateCampeonato(token, id, payload) {
  return request(`/campeonatos/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteCampeonato(token, id) {
  return request(`/campeonatos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
