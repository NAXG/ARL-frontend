import http from './http';

// 策略列表
export function fetchPolicyList(params) {
  return http.get('/policy/', { params });
}

// 创建策略
export function createPolicy(payload) {
  return http.post('/policy/add/', payload);
}

// 删除策略
export function deletePolicy(payload) {
  return http.post('/policy/delete/', payload);
}

// 批量删除策略
export function batchDeletePolicies(payload) {
  return http.post('/policy/delete/', payload);
}

// 获取策略列表（带大小参数）
export function fetchPolicyBySize(size) {
  return http.get(`/policy/?size=${size}`);
}


