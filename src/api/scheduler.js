import http from './http';

// ==================== 监控任务管理 ====================
// 监控任务列表
export function fetchMonitorList(params) {
  return http.get('/scheduler/', { params });
}

// 添加监控任务
export function createMonitor(payload) {
  return http.post('/scheduler/add/', payload);
}

// 添加站点监控
export function createSiteMonitor(payload) {
  return http.post('/scheduler/add/site_monitor/', payload);
}

// 删除监控任务
export function deleteMonitor(payload) {
  return http.post('/scheduler/delete/', payload);
}

// 批量删除监控任务
export function batchDeleteMonitors(payload) {
  return http.post('/scheduler/delete/', payload);
}

// 停止监控任务（批量）
export function batchStopMonitors(payload) {
  return http.post('/scheduler/stop/batch', payload);
}

// 恢复监控任务（批量）
export function batchRecoverMonitors(payload) {
  return http.post('/scheduler/recover/batch', payload);
}

// 恢复监控任务（单个）
export function recoverMonitor(payload) {
  return http.post('/scheduler/recover/', payload);
}

// ==================== 定时任务管理 ====================
// 定时任务列表
export function fetchScheduleList(params) {
  return http.get('/task_schedule/', { params });
}

// 创建定时任务
export function createSchedule(payload) {
  return http.post('/task_schedule/', payload);
}

// 删除定时任务
export function deleteSchedule(payload) {
  return http.post('/task_schedule/delete/', payload);
}

// 停止定时任务
export function stopSchedule(payload) {
  return http.post('/task_schedule/stop/', payload);
}

// 恢复定时任务
export function recoverSchedule(payload) {
  return http.post('/task_schedule/recover/', payload);
}


