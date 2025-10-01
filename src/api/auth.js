import http from './http';

export function login(payload) {
  return http.post('/user/login', payload);
}

export function logout() {
  return http.get('/user/logout');
}

export function changePassword(payload) {
  return http.post('/user/change_password', payload);
}
