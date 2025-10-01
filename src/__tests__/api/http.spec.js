import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('api/http.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('HTTP 配置', () => {
    it('应该导出 axios 实例', async () => {
      const http = await import('@/api/http');
      expect(http.default).toBeDefined();
      expect(typeof http.default.get).toBe('function');
      expect(typeof http.default.post).toBe('function');
    });

    it('应该配置正确的 baseURL', async () => {
      const http = await import('@/api/http');
      expect(http.default.defaults.baseURL).toBeDefined();
    });

    it('应该配置请求超时时间', async () => {
      const http = await import('@/api/http');
      expect(http.default.defaults.timeout).toBeGreaterThan(0);
    });
  });

  describe('请求拦截器', () => {
    it('应该有请求拦截器', async () => {
      const http = await import('@/api/http');
      expect(http.default.interceptors.request.handlers.length).toBeGreaterThan(0);
    });
  });

  describe('响应拦截器', () => {
    it('应该有响应拦截器', async () => {
      const http = await import('@/api/http');
      expect(http.default.interceptors.response.handlers.length).toBeGreaterThan(0);
    });
  });

  describe('认证 Token 处理', () => {
    it('应该在请求时自动添加 Token 请求头', async () => {
      const { setToken } = await import('@/utils/auth');
      const http = await import('@/api/http');

      setToken('test-token-123');

      // 创建一个模拟的请求配置
      const config = {
        headers: {},
        method: 'get',
        url: '/test'
      };

      // 手动调用请求拦截器
      const interceptor = http.default.interceptors.request.handlers[0];
      if (interceptor && interceptor.fulfilled) {
        const result = interceptor.fulfilled(config);
        expect(result.headers.Token).toBe('test-token-123');
      }
    });

    it('应该在没有 token 时不添加 Token 请求头', async () => {
      const { clearAuth } = await import('@/utils/auth');
      const http = await import('@/api/http');

      clearAuth();

      const config = {
        headers: {},
        method: 'get',
        url: '/test'
      };

      const interceptor = http.default.interceptors.request.handlers[0];
      if (interceptor && interceptor.fulfilled) {
        const result = interceptor.fulfilled(config);
        expect(result.headers.Token).toBeUndefined();
      }
    });
  });
});

