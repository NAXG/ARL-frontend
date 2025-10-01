import http from './http';

// 清除缓存
export function clearCache(payload) {
  return http.post('/clear/', payload);
}


