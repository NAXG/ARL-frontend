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

export async function fetchGithubTasks(params = {}) {
  try {
    const response = await http.get('/github/tasks', { params });
    const payload = response?.data || {};
    const items = payload.items || payload.results || [];
    return {
      items,
      total: payload.total ?? items.length
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[fetchGithubTasks] 使用本地回退数据', error?.message);
      return {
        items: fallbackGithubTasks.map((item, index) => ({ ...item, id: item.id ?? index + 1 })),
        total: fallbackGithubTasks.length,
        error
      };
    }
    throw error;
  }
}

export function createGithubTask(payload) {
  return http.post('/github/tasks', payload);
}

export function deleteGithubTasks(ids) {
  return http.delete('/github/tasks', { data: { ids } });
}

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

export async function fetchGithubMonitors(params = {}) {
  try {
    const response = await http.get('/github/monitors', { params });
    const payload = response?.data || {};
    const items = payload.items || payload.results || [];
    return {
      items,
      total: payload.total ?? items.length
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[fetchGithubMonitors] 使用本地回退数据', error?.message);
      return {
        items: fallbackGithubMonitors.map((item, index) => ({ ...item, id: item.id ?? index + 1 })),
        total: fallbackGithubMonitors.length,
        error
      };
    }
    throw error;
  }
}

export async function createGithubMonitorTask(payload) {
  try {
    return await http.post('/github/monitors', payload);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[createGithubMonitorTask] 使用本地回退逻辑', error?.message);
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

export async function cancelGithubMonitorTask(id) {
  try {
    return await http.delete(`/github/monitors/${id}`);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[cancelGithubMonitorTask] 使用本地回退逻辑', error?.message);
      const index = fallbackGithubMonitors.findIndex((item) => item.id === id);
      if (index >= 0) {
        fallbackGithubMonitors.splice(index, 1);
      }
      return { data: { id } };
    }
    throw error;
  }
}
