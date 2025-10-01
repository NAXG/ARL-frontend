import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  getUsername,
  setUsername,
  removeUsername,
  clearAuth,
  subscribeAuthChange
} from '@/utils/auth';

describe('utils/auth.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Token 管理', () => {
    it('应该能设置和获取 token', () => {
      const token = 'test-token-123';
      setToken(token);
      expect(getToken()).toBe(token);
    });

    it('应该在没有 token 时返回空字符串', () => {
      expect(getToken()).toBe('');
    });

    it('应该能删除 token', () => {
      setToken('test-token');
      removeToken();
      expect(getToken()).toBe('');
    });

    it('设置空 token 应该删除 token', () => {
      setToken('test-token');
      setToken('');
      expect(getToken()).toBe('');
    });
  });

  describe('Username 管理', () => {
    it('应该能设置和获取用户名', () => {
      const username = 'admin';
      setUsername(username);
      expect(getUsername()).toBe(username);
    });

    it('应该在没有用户名时返回空字符串', () => {
      expect(getUsername()).toBe('');
    });

    it('应该能删除用户名', () => {
      setUsername('admin');
      removeUsername();
      expect(getUsername()).toBe('');
    });

    it('设置空用户名应该删除用户名', () => {
      setUsername('admin');
      setUsername('');
      expect(getUsername()).toBe('');
    });
  });

  describe('clearAuth', () => {
    it('应该清除所有认证信息', () => {
      setToken('test-token');
      setUsername('admin');

      clearAuth();

      expect(getToken()).toBe('');
      expect(getUsername()).toBe('');
    });
  });

  describe('subscribeAuthChange', () => {
    it('应该在初始化时立即调用回调', () => {
      const callback = vi.fn();
      setToken('test-token');
      setUsername('admin');

      subscribeAuthChange(callback);

      expect(callback).toHaveBeenCalledWith({
        token: 'test-token',
        username: 'admin'
      });
    });

    it('应该在 token 变化时触发回调', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeAuthChange(callback);

      callback.mockClear();
      setToken('new-token');

      expect(callback).toHaveBeenCalledWith({
        token: 'new-token',
        username: ''
      });

      unsubscribe();
    });

    it('应该在用户名变化时触发回调', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeAuthChange(callback);

      callback.mockClear();
      setUsername('testuser');

      expect(callback).toHaveBeenCalledWith({
        token: '',
        username: 'testuser'
      });

      unsubscribe();
    });

    it('unsubscribe 应该停止监听', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeAuthChange(callback);

      callback.mockClear();
      unsubscribe();

      setToken('new-token');
      expect(callback).not.toHaveBeenCalled();
    });

    it('应该在 clearAuth 时触发回调', () => {
      const callback = vi.fn();
      setToken('test-token');
      setUsername('admin');
      subscribeAuthChange(callback);

      callback.mockClear();
      clearAuth();

      expect(callback).toHaveBeenCalledWith({
        token: '',
        username: ''
      });
    });
  });
});

