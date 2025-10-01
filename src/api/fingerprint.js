import http from './http';

// 指纹列表
export function fetchFingerprintList(params) {
  return http.get('/fingerprint/', { params });
}

// 创建指纹
export function createFingerprint(payload) {
  return http.post('/fingerprint/', payload);
}

// 上传指纹文件
export function uploadFingerprintFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return http.post('/fingerprint/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 删除指纹
export function deleteFingerprint(payload) {
  return http.post('/fingerprint/delete/', payload);
}

// 批量删除指纹
export function batchDeleteFingerprints(payload) {
  return http.post('/fingerprint/delete/', payload);
}

// 指纹统计
export function fetchFingerprintStats(params) {
  return http.get('/stat_finger/', { params });
}


