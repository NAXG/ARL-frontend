const TOKEN_KEY = 'arl-token';
const USERNAME_KEY = 'arl-username';
const AUTH_EVENT = 'arl-auth-change';

function dispatchAuthChange() {
  const detail = {
    token: getToken(),
    username: getUsername()
  };
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail }));
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  dispatchAuthChange();
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  dispatchAuthChange();
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY) || '';
}

export function setUsername(name) {
  if (name) {
    localStorage.setItem(USERNAME_KEY, name);
  } else {
    localStorage.removeItem(USERNAME_KEY);
  }
  dispatchAuthChange();
}

export function removeUsername() {
  localStorage.removeItem(USERNAME_KEY);
  dispatchAuthChange();
}

export function subscribeAuthChange(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event) => {
    const detail = event?.detail;
    callback({
      token: detail?.token ?? getToken(),
      username: detail?.username ?? getUsername()
    });
  };

  const storageHandler = (event) => {
    if ([TOKEN_KEY, USERNAME_KEY].includes(event.key)) {
      callback({ token: getToken(), username: getUsername() });
    }
  };

  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener('storage', storageHandler);

  // 初始化时立即触发一次
  callback({ token: getToken(), username: getUsername() });

  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  dispatchAuthChange();
}
