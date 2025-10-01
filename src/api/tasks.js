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

// 任务列表
export async function fetchTaskList(params = {}) {
  try {
    const response = await http.get('/task/', { params });
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
        items: fallbackTasks.map((item, index) => ({ ...item, id: item.id ?? index + 1 })),
        total: fallbackTasks.length,
        error
      };
    }
    throw error;
  }
}

// 任务列表（用于搜索）
export function fetchTaskListForSearch(params) {
  return http.get('/task/list', { params });
}

// 创建任务
export function createTask(payload) {
  return http.post('/task/', payload);
}

// 创建策略任务
export function createPolicyTask(payload) {
  return http.post('/task/policy/', payload);
}

// 同步任务
export function syncTask(payload) {
  return http.post('/task/sync/', payload);
}

// 同步范围列表
export function fetchSyncScopeList(params) {
  return http.get('/task/sync_scope/', { params });
}

// 删除任务
export function deleteTask(payload) {
  return http.post('/task/delete/', payload);
}

// 批量删除任务
export function batchDeleteTasks(payload) {
  return http.post('/task/delete/', payload);
}

// 重启任务
export function restartTask(payload) {
  return http.post('/task/restart/', payload);
}

// 停止任务（通过ID）
export function stopTaskById(id) {
  return http.get(`/task/stop/${id}`);
}

// 启动任务
export function startTask(payload) {
  return http.post('/task/start', payload);
}

// 停止任务
export function stopTask(payload) {
  return http.post('/task/stop', payload);
}

// FOFA 任务
export function dispatchFofaTask(payload) {
  return http.post('/tasks/fofa', payload);
}

export async function estimateFofaResult(params) {
  try {
    const response = await http.get('/tasks/fofa/estimate', { params });
    return response?.data?.count ?? 0;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // 使用回退估算结果，静默处理
      return fallbackFofaEstimate();
    }
    throw error;
  }
}
