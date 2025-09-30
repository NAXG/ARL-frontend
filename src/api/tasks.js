import http from './http';

const fallbackTasks = [
  {
    id: 1,
    taskName: 'example.com',
    target: 'example.com',
    statistics: '站点: 74\n域名: 86',
    options: '域名爆破, 域名查询插件, 端口扫描',
    status: 'done',
    startTime: '2025-09-20 09:35',
    endTime: '2025-09-20 10:15',
    taskId: 'TASK-20240920001'
  }
];

const fallbackFofaEstimate = () => Math.floor(Math.random() * 1000);

export async function fetchTaskList(params = {}) {
  try {
    const response = await http.get('/tasks', { params });
    const payload = response?.data || {};
    const items = payload.items || payload.results || [];
    return {
      items,
      total: payload.total ?? items.length
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[fetchTaskList] 使用本地回退数据', error?.message);
      return {
        items: fallbackTasks.map((item, index) => ({ ...item, id: item.id ?? index + 1 })),
        total: fallbackTasks.length,
        error
      };
    }
    throw error;
  }
}

export function createTask(payload) {
  return http.post('/tasks', payload);
}

export function dispatchFofaTask(payload) {
  return http.post('/tasks/fofa', payload);
}

export async function estimateFofaResult(params) {
  try {
    const response = await http.get('/tasks/fofa/estimate', { params });
    return response?.data?.count ?? 0;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[estimateFofaResult] 使用回退估算结果', error?.message);
      return fallbackFofaEstimate();
    }
    throw error;
  }
}
