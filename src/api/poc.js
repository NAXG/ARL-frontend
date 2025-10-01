import http from './http';

// POC 列表
export function fetchPocList(params) {
  return http.get('/poc/', { params });
}

// 删除 POC
export function deletePoc(params) {
  return http.get('/poc/delete/', { params });
}

// 同步 POC
export function syncPoc(params) {
  return http.get('/poc/sync/', { params });
}


