import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as TasksAPI from '@/api/tasks';

// Mock http module
vi.mock('@/api/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import http from '@/api/http';

describe('api/tasks.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTaskList', () => {
    it('应该成功获取任务列表', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: 1, task_name: 'test1', status: 'done' },
            { id: 2, task_name: 'test2', status: 'running' }
          ],
          total: 2
        }
      };

      http.get.mockResolvedValue(mockResponse);

      const result = await TasksAPI.fetchTaskList({ page: 1, size: 10 });

      expect(http.get).toHaveBeenCalledWith('/task/', {
        params: { page: 1, size: 10 }
      });
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('应该处理没有 items 的响应', async () => {
      const mockResponse = { data: {} };
      http.get.mockResolvedValue(mockResponse);

      const result = await TasksAPI.fetchTaskList();

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('开发环境下应该在失败时返回 fallback 数据', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      http.get.mockRejectedValue(new Error('Network Error'));

      const result = await TasksAPI.fetchTaskList();

      expect(result.items).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.error).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('createTask', () => {
    it('应该发送创建任务请求', async () => {
      const taskData = {
        name: '测试任务',
        target: 'example.com',
        type: 'domain'
      };

      http.post.mockResolvedValue({ data: { id: 1 } });

      await TasksAPI.createTask(taskData);

      expect(http.post).toHaveBeenCalledWith('/task/', taskData);
    });
  });

  describe('deleteTask', () => {
    it('应该发送删除任务请求', async () => {
      const payload = { _id: 'task-123' };
      http.post.mockResolvedValue({ data: { success: true } });

      await TasksAPI.deleteTask(payload);

      expect(http.post).toHaveBeenCalledWith('/task/delete/', payload);
    });
  });

  describe('startTask', () => {
    it('应该发送启动任务请求', async () => {
      const payload = { _id: 'task-123' };
      http.post.mockResolvedValue({ data: { success: true } });

      await TasksAPI.startTask(payload);

      expect(http.post).toHaveBeenCalledWith('/task/start', payload);
    });
  });

  describe('stopTask', () => {
    it('应该发送停止任务请求', async () => {
      const payload = { _id: 'task-123' };
      http.post.mockResolvedValue({ data: { success: true } });

      await TasksAPI.stopTask(payload);

      expect(http.post).toHaveBeenCalledWith('/task/stop', payload);
    });
  });

  describe('restartTask', () => {
    it('应该发送重启任务请求', async () => {
      const payload = { _id: 'task-123' };
      http.post.mockResolvedValue({ data: { success: true } });

      await TasksAPI.restartTask(payload);

      expect(http.post).toHaveBeenCalledWith('/task/restart/', payload);
    });
  });

  describe('stopTaskById', () => {
    it('应该通过 ID 停止任务', async () => {
      const taskId = 'task-123';
      http.get.mockResolvedValue({ data: { success: true } });

      await TasksAPI.stopTaskById(taskId);

      expect(http.get).toHaveBeenCalledWith(`/task/stop/${taskId}`);
    });
  });
});

