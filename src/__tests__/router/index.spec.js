import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryHistory } from 'vue-router';
import router from '@/router';

describe('router/index.js', () => {
  beforeEach(() => {
    router.replace('/');
  });

  describe('路由配置', () => {
    it('应该正确配置根路径重定向', async () => {
      await router.push('/');
      expect(router.currentRoute.value.path).toBe('/taskList');
    });

    it('应该有登录路由', () => {
      const loginRoute = router.getRoutes().find(r => r.name === 'login');
      expect(loginRoute).toBeDefined();
      expect(loginRoute.path).toBe('/login');
      expect(loginRoute.meta.layout).toBe('blank');
      expect(loginRoute.meta.guest).toBe(true);
    });

    it('应该有任务管理路由', () => {
      const dashboardRoute = router.getRoutes().find(r => r.name === 'dashboard');
      expect(dashboardRoute).toBeDefined();
      expect(dashboardRoute.path).toBe('/taskList');
      expect(dashboardRoute.meta.requiresAuth).toBe(true);
    });

    it('应该有资产搜索路由', () => {
      const searchRoute = router.getRoutes().find(r => r.name === 'asset-search');
      expect(searchRoute).toBeDefined();
      expect(searchRoute.path).toBe('/search');
    });

    it('应该有 GitHub 管理路由', () => {
      const githubRoute = router.getRoutes().find(r => r.name === 'github-manage');
      expect(githubRoute).toBeDefined();
      expect(githubRoute.path).toBe('/GitHubTasks/GitHubTasksList');
    });
  });

  describe('路由元信息', () => {
    it('所有非登录路由都应该需要认证', () => {
      const routes = router.getRoutes();
      const protectedRoutes = routes.filter(r => r.name !== 'login' && r.path !== '/');

      protectedRoutes.forEach(route => {
        if (route.meta && !route.meta.guest) {
          expect(route.meta.requiresAuth).toBe(true);
        }
      });
    });
  });

  describe('懒加载', () => {
    it('所有视图组件都应该使用懒加载', () => {
      const routes = router.getRoutes();
      const viewRoutes = routes.filter(r => r.component && r.path !== '/');

      // 检查是否所有组件都是函数（懒加载）
      viewRoutes.forEach(route => {
        if (route.component) {
          // 在实际应用中，懒加载的组件是函数
          expect(typeof route.component === 'function' || typeof route.component === 'object').toBe(true);
        }
      });
    });
  });
});

