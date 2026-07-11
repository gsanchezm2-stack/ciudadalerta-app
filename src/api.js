import { API_URL } from './config';

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  const res = await fetch(`${API_URL}/api${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.mensaje || `Error ${res.status}`);
  }

  return res.json();
}

export function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function registrarUsuario(nombre, email, password) {
  return request('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password })
  });
}

export function getAlertas(token, params = {}) {
  const qs = new URLSearchParams();
  if (params.sector) qs.set('sector', params.sector);
  if (params.tipo) qs.set('tipo', params.tipo);
  if (params.estado) qs.set('estado', params.estado);
  if (params.q) qs.set('q', params.q);
  if (params.page) qs.set('page', params.page);
  if (params.limit) qs.set('limit', params.limit);
  const query = qs.toString();
  return request(`/alertas${query ? '?' + query : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getAlerta(token, id) {
  return request(`/alertas/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function crearAlerta(token, data) {
  return request('/alertas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
}

export function cambiarEstadoAlerta(token, id, estado) {
  return request(`/alertas/${id}/estado`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ estado })
  });
}

export function eliminarAlerta(token, id) {
  return request(`/alertas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function restaurarAlerta(token, id) {
  return request(`/alertas/${id}/restaurar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getHealth() {
  return request('/health');
}

export function getStats(token) {
  return request('/alertas/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getUsuarios(token) {
  return request('/usuarios', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function cambiarRolUsuario(token, id, rol) {
  return request(`/usuarios/${id}/rol`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rol })
  });
}
