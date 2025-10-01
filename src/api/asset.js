import http from './http';

// ==================== SRC 管理 ====================
// SRC 列表
export function fetchSrcList(params) {
  return http.get('/src/', { params });
}

// 添加 SRC
export function createSrc(payload) {
  return http.post('/src/', payload);
}

// 更新 SRC
export function updateSrc(payload) {
  return http.put('/src/', payload);
}

// 删除 SRC
export function deleteSrc(payload) {
  return http.delete('/src/', { data: payload });
}

// 批量删除 SRC
export function batchDeleteSrc(payload) {
  return http.delete('/src/', { data: payload });
}

// ==================== 资产范围管理 ====================
// 资产范围列表
export function fetchAssetScopeList(params) {
  return http.get('/asset_scope/', { params });
}

// 添加资产范围
export function createAssetScope(payload) {
  return http.post('/asset_scope/', payload);
}

// 添加资产范围（详细）
export function addAssetScope(payload) {
  return http.post('/asset_scope/add/', payload);
}

// 删除资产范围
export function deleteAssetScope(payload) {
  return http.post('/asset_scope/delete/', payload);
}

// 删除资产范围（带参数）
export function deleteAssetScopeByParams(scopeId, scope) {
  return http.get(`/asset_scope/delete/?scope_id=${scopeId}&scope=${scope}`);
}

// ==================== 域名管理 ====================
// 域名列表
export function fetchDomainList(params) {
  return http.get('/domain/', { params });
}

// 导出域名数据
export function exportDomainData(params) {
  return http.get('/domain/export/', { 
    params,
    responseType: 'blob'
  });
}

// ==================== IP 主机管理 ====================
// IP 主机列表
export function fetchIpList(params) {
  return http.get('/ip/', { params });
}

// C 段 IP 列表
export function fetchCipList(params) {
  return http.get('/cip/', { params });
}

// ==================== 站点管理 ====================
// 站点列表
export function fetchSiteList(params) {
  return http.get('/site/', { params });
}

// 导出站点数据
export function exportSiteData(params) {
  return http.get('/site/export/', { 
    params,
    responseType: 'blob'
  });
}

// 保存结果集
export function saveResultSet(params) {
  return http.get('/site/save_result_set/', { params });
}

// ==================== 服务管理 ====================
// 服务列表
export function fetchServiceList(params) {
  return http.get('/service/', { params });
}

// NPOC 服务列表
export function fetchNpocServiceList(params) {
  return http.get('/npoc_service/', { params });
}

// ==================== SSL 证书管理 ====================
// SSL 证书列表
export function fetchCertList(params) {
  return http.get('/cert/', { params });
}

// ==================== URL 管理 ====================
// URL 列表
export function fetchUrlList(params) {
  return http.get('/url/', { params });
}

// ==================== 漏洞和扫描结果 ====================
// 文件泄露列表
export function fetchFileLeakList(params) {
  return http.get('/fileleak/', { params });
}

// 漏洞列表
export function fetchVulnList(params) {
  return http.get('/vuln/', { params });
}

// Nuclei 扫描结果
export function fetchNucleiResultList(params) {
  return http.get('/nuclei_result/', { params });
}

// Xray 扫描结果
export function fetchXrayResultList(params) {
  return http.get('/xray_result/', { params });
}

// 未授权访问列表
export function fetchUnauthList(params) {
  return http.get('/unauth/', { params });
}

// WIH 列表
export function fetchWihList(params) {
  return http.get('/wih/', { params });
}

// ==================== 首页统计 ====================
// 首页数据
export function fetchIndexData(params) {
  return http.get('/index/', { params });
}


