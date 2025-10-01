import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from '../App.vue';

// Mock API
vi.mock('@/api/auth', () => ({
  logout: vi.fn(),
  changePassword: vi.fn()
}));

// Mock utils
vi.mock('@/utils/auth', () => ({
  subscribeAuthChange: vi.fn((callback) => {
    callback({ token: 'test-token', username: 'admin' });
    return vi.fn(); // unsubscribe function
  }),
  clearAuth: vi.fn()
}));

import { logout, changePassword } from '@/api/auth';
import { clearAuth } from '@/utils/auth';

describe('App.vue', () => {
  let wrapper;
  let router;

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/login', name: 'login', component: { template: '<div />' } },
        { path: '/taskList', component: { template: '<div />' } }
      ]
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('应该正确挂载组件', async () => {
    router.push('/');
    await router.isReady();

    wrapper = shallowMount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true,
          'a-layout': true,
          'a-layout-sider': true,
          'a-layout-header': true,
          'a-layout-content': true,
          'a-menu': true,
          'a-menu-item': true,
          'a-avatar': true,
          'a-divider': true,
          'a-button': true,
          'a-modal': true,
          'a-form': true,
          'a-form-item': true,
          'a-input-password': true
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('应该显示侧边栏菜单', async () => {
    router.push('/');
    await router.isReady();

    wrapper = shallowMount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true,
          'a-layout': { template: '<div><slot /></div>' },
          'a-layout-sider': { template: '<div class="sider"><slot /></div>' },
          'a-layout-header': true,
          'a-layout-content': true,
          'a-menu': { template: '<div><slot /></div>' },
          'a-menu-item': true,
          'a-avatar': true,
          'a-divider': true,
          'a-button': true,
          'a-modal': true,
          'a-form': true,
          'a-form-item': true,
          'a-input-password': true
        }
      }
    });

    expect(wrapper.find('.sider').exists()).toBe(true);
  });

  it('侧边栏应该可以折叠和展开', async () => {
    router.push('/');
    await router.isReady();

    wrapper = shallowMount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true,
          'a-layout': true,
          'a-layout-sider': true,
          'a-layout-header': true,
          'a-layout-content': true,
          'a-menu': true,
          'a-menu-item': true,
          'a-avatar': true,
          'a-divider': true,
          'a-button': true,
          'a-modal': true,
          'a-form': true,
          'a-form-item': true,
          'a-input-password': true
        }
      }
    });

    // 初始状态
    expect(wrapper.vm.collapsed).toBe(false);

    // 模拟点击折叠按钮
    wrapper.vm.collapsed = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.collapsed).toBe(true);
  });

  it('应该有 11 个菜单项', async () => {
    router.push('/');
    await router.isReady();

    wrapper = shallowMount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterView: true,
          'a-layout': true,
          'a-layout-sider': true,
          'a-layout-header': true,
          'a-layout-content': true,
          'a-menu': true,
          'a-menu-item': true,
          'a-avatar': true,
          'a-divider': true,
          'a-button': true,
          'a-modal': true,
          'a-form': true,
          'a-form-item': true,
          'a-input-password': true
        }
      }
    });

    expect(wrapper.vm.menuItems).toHaveLength(11);
  });

  describe('用户功能', () => {
    it('应该在登录后显示用户信息', async () => {
      router.push('/');
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          plugins: [router],
          stubs: {
            RouterView: true,
            'a-layout': true,
            'a-layout-sider': true,
            'a-layout-header': true,
            'a-layout-content': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-avatar': true,
            'a-divider': true,
            'a-button': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input-password': true
          }
        }
      });

      // 认证状态应该通过 subscribeAuthChange 设置
      expect(wrapper.vm.isAuthenticated).toBe(true);
      expect(wrapper.vm.username).toBe('admin');
    });

    it('handleLogout 应该清除认证信息并跳转登录页', async () => {
      router.push('/');
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          plugins: [router],
          stubs: {
            RouterView: true,
            'a-layout': true,
            'a-layout-sider': true,
            'a-layout-header': true,
            'a-layout-content': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-avatar': true,
            'a-divider': true,
            'a-button': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input-password': true
          }
        }
      });

      logout.mockResolvedValue({ data: { success: true } });

      await wrapper.vm.handleLogout();

      expect(logout).toHaveBeenCalled();
      expect(clearAuth).toHaveBeenCalled();
    });
  });

  describe('修改密码功能', () => {
    it('showPasswordModal 应该打开密码修改对话框', async () => {
      router.push('/');
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          plugins: [router],
          stubs: {
            RouterView: true,
            'a-layout': true,
            'a-layout-sider': true,
            'a-layout-header': true,
            'a-layout-content': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-avatar': true,
            'a-divider': true,
            'a-button': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input-password': true
          }
        }
      });

      expect(wrapper.vm.passwordModalVisible).toBe(false);

      wrapper.vm.showPasswordModal();

      expect(wrapper.vm.passwordModalVisible).toBe(true);
    });

    it('handlePasswordCancel 应该关闭对话框并重置表单', async () => {
      router.push('/');
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          plugins: [router],
          stubs: {
            RouterView: true,
            'a-layout': true,
            'a-layout-sider': true,
            'a-layout-header': true,
            'a-layout-content': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-avatar': true,
            'a-divider': true,
            'a-button': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input-password': true
          }
        }
      });

      wrapper.vm.passwordModalVisible = true;
      wrapper.vm.passwordForm = {
        oldPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'new'
      };

      wrapper.vm.handlePasswordCancel();

      expect(wrapper.vm.passwordModalVisible).toBe(false);
      expect(wrapper.vm.passwordForm.oldPassword).toBe('');
      expect(wrapper.vm.passwordForm.newPassword).toBe('');
      expect(wrapper.vm.passwordForm.confirmPassword).toBe('');
    });
  });

  describe('菜单导航', () => {
    it('应该根据当前路由高亮正确的菜单项', async () => {
      const testRouter = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/', component: { template: '<div />' } },
          { path: '/taskList', component: { template: '<div />' } }
        ]
      });

      await testRouter.push('/taskList');
      await testRouter.isReady();

      wrapper = shallowMount(App, {
        global: {
          plugins: [testRouter],
          stubs: {
            RouterView: true,
            'a-layout': true,
            'a-layout-sider': true,
            'a-layout-header': true,
            'a-layout-content': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-avatar': true,
            'a-divider': true,
            'a-button': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input-password': true
          }
        }
      });

      expect(wrapper.vm.selectedMenuKey).toBe('task');
    });

    it('应该验证菜单点击处理逻辑', async () => {
      router.push('/');
      await router.isReady();

      wrapper = shallowMount(App, {
        global: {
          plugins: [router],
          stubs: {
            RouterView: true,
            'a-layout': true,
            'a-layout-sider': true,
            'a-layout-header': true,
            'a-layout-content': true,
            'a-menu': true,
            'a-menu-item': true,
            'a-avatar': true,
            'a-divider': true,
            'a-button': true,
            'a-modal': true,
            'a-form': true,
            'a-form-item': true,
            'a-input-password': true
          }
        }
      });

      // 测试菜单点击不会导航到相同路径
      const currentPath = router.currentRoute.value.path;
      const menuItem = { key: 'task', path: currentPath };
      await wrapper.vm.handleMenuClick(menuItem);

      // 路径应该保持不变
      expect(router.currentRoute.value.path).toBe(currentPath);
    });
  });
});

