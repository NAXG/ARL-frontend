import http from './http';

const fallbackGithubTasks = [
  {
    id: 1,
    name: '敏感信息巡检',
    keyword: 'password',
    resultCount: 42,
    status: 'running',
    startTime: '2025-01-12 08:30',
    endTime: '--',
    taskId: 'GITHUB-20250112001'
  },
  {
    id: 2,
    name: 'API Key 监控',
    keyword: 'api_key',
    resultCount: 5,
    status: 'finished',
    startTime: '2024-12-30 21:00',
    endTime: '2024-12-30 22:10',
    taskId: 'GITHUB-20241230007'
  }
];

const fallbackGithubMonitors = [
  {
    id: 1,
    name: '敏感信息监控',
    repo: 'github.com/org/sec-repo',
    keyword: 'access_key',
    status: 'watching',
    lastSync: '2025-09-22 14:30',
    alertCount: 3
  }
];

// ==================== GitHub 任务管理 ====================
// GitHub 任务列表
export async function fetchGithubTasks(params = {}) {
  try {
    const response = await http.get('/github_task/', { params });
    const payload = response?.data || {};
    const items = payload.items || payload.results || [];
    return {
      items,
      total: payload.total ?? items.length
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // 使用本地回退数据，静默处理
      return {
        items: fallbackGithubTasks.map((item, index) => ({ ...item, id: item.id ?? index + 1 })),
        total: fallbackGithubTasks.length,
        error
      };
    }
    throw error;
  }
}

// 创建 GitHub 任务
export function createGithubTask(payload) {
  return http.post('/github_task/', payload);
}

// 删除 GitHub 任务
export function deleteGithubTask(payload) {
  return http.post('/github_task/delete/', payload);
}

// 批量删除 GitHub 任务
export function batchDeleteGithubTasks(payload) {
  return http.post('/github_task/delete/', payload);
}

// 停止 GitHub 任务
export function stopGithubTask(payload) {
  return http.post('/github_task/stop/', payload);
}

// ==================== GitHub 扫描结果 ====================
// GitHub 结果列表
export function fetchGithubResults(params) {
  return http.get('/github_result/', { params });
}

// ==================== GitHub 定时任务管理 ====================
// GitHub 定时任务列表
export async function fetchGithubMonitors(params = {}) {
  try {
    const response = await http.get('/github_scheduler/', { params });
    const payload = response?.data || {};
    const items = payload.items || payload.results || [];
    return {
      items,
      total: payload.total ?? items.length
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // 使用本地回退数据，静默处理
      return {
        items: fallbackGithubMonitors.map((item, index) => ({ ...item, id: item.id ?? index + 1 })),
        total: fallbackGithubMonitors.length,
        error
      };
    }
    throw error;
  }
}

// 创建 GitHub 定时任务
export async function createGithubMonitorTask(payload) {
  try {
    return await http.post('/github_scheduler/', payload);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // 使用本地回退逻辑，静默处理
      const newItem = {
        id: Date.now(),
        name: payload?.name || '未命名监控',
        repo: payload?.repo || payload?.repository || '--',
        keyword: payload?.keyword || '--',
        status: payload?.status || 'watching',
        lastSync: '--',
        alertCount: 0
      };
      fallbackGithubMonitors.unshift(newItem);
      return {
        data: newItem
      };
    }
    throw error;
  }
}

// 删除 GitHub 定时任务
export function deleteGithubScheduler(payload) {
  return http.post('/github_scheduler/delete/', payload);
}

// 停止 GitHub 定时任务
export function stopGithubScheduler(payload) {
  return http.post('/github_scheduler/stop/', payload);
}

// 恢复 GitHub 定时任务
export function recoverGithubScheduler(payload) {
  return http.post('/github_scheduler/recover/', payload);
}

// 取消 GitHub 监控任务（兼容旧接口）
export async function cancelGithubMonitorTask(id) {
  try {
    return await http.post('/github_scheduler/delete/', { _id: id });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // 使用本地回退逻辑，静默处理
      const index = fallbackGithubMonitors.findIndex((item) => item.id === id);
      if (index >= 0) {
        fallbackGithubMonitors.splice(index, 1);
      }
      return { data: { id } };
    }
    throw error;
  }
}

// 别名导出（兼容组件中的命名）
export { batchDeleteGithubTasks as deleteGithubTasks };
