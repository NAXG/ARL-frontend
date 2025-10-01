import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as AuthAPI from '@/api/auth';

// Mock http module
vi.mock('@/api/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import http from '@/api/http';

describe('api/auth.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('应该发送登录请求', async () => {
      const credentials = {
        username: 'admin',
        password: '123456'
      };

      const mockResponse = {
        data: {
          token: 'test-token',
          username: 'admin'
        }
      };

      http.post.mockResolvedValue(mockResponse);

      const result = await AuthAPI.login(credentials);

      expect(http.post).toHaveBeenCalledWith('/user/login', credentials);
      expect(result.data.token).toBe('test-token');
      expect(result.data.username).toBe('admin');
    });

    it('应该处理登录失败', async () => {
      const credentials = {
        username: 'wrong',
        password: 'wrong'
      };

      http.post.mockRejectedValue(new Error('登录失败'));

      await expect(AuthAPI.login(credentials)).rejects.toThrow('登录失败');
    });
  });

  describe('logout', () => {
    it('应该发送登出请求', async () => {
      http.get.mockResolvedValue({ data: { success: true } });

      await AuthAPI.logout();

      expect(http.get).toHaveBeenCalledWith('/user/logout');
    });
  });

  describe('changePassword', () => {
    it('应该发送修改密码请求', async () => {
      const payload = {
        old_password: 'oldpass',
        new_password: 'newpass'
      };

      http.post.mockResolvedValue({ data: { success: true } });

      await AuthAPI.changePassword(payload);

      expect(http.post).toHaveBeenCalledWith('/user/change_pass', payload);
    });

    it('应该处理旧密码错误', async () => {
      const payload = {
        old_password: 'wrong',
        new_password: 'newpass'
      };

      http.post.mockRejectedValue(new Error('旧密码错误'));

      await expect(AuthAPI.changePassword(payload)).rejects.toThrow('旧密码错误');
    });
  });

  describe('getUserInfo', () => {
    it('应该获取用户信息', async () => {
      const token = 'test-token';
      const mockResponse = {
        data: {
          username: 'admin',
          email: 'admin@example.com'
        }
      };

      http.get.mockResolvedValue(mockResponse);

      const result = await AuthAPI.getUserInfo(token);

      expect(http.get).toHaveBeenCalledWith('/user/info', {
        params: { token }
      });
      expect(result.data.username).toBe('admin');
    });
  });
});

