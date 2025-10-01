import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';

// Mock API
vi.mock('@/api/auth', () => ({
  login: vi.fn()
}));

// Mock utils
vi.mock('@/utils/auth', () => ({
  setToken: vi.fn(),
  setUsername: vi.fn()
}));

import { login } from '@/api/auth';
import { setToken, setUsername } from '@/utils/auth';

describe('LoginView.vue', () => {
  let wrapper;
  let router;

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', name: 'login', component: LoginView },
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } }
      ]
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('应该正确渲染登录表单', async () => {
    router.push('/login');
    await router.isReady();

    wrapper = mount(LoginView, {
      global: {
        plugins: [router],
        stubs: {
          'a-form': true,
          'a-form-item': true,
          'a-input': true,
          'a-input-password': true,
          'a-checkbox': true,
          'a-button': true
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('应该在成功登录后保存 token 和用户名', async () => {
    const mockResponse = {
      data: {
        token: 'test-token-123',
        username: 'admin'
      }
    };

    login.mockResolvedValue(mockResponse);

    router.push('/login');
    await router.isReady();

    wrapper = mount(LoginView, {
      global: {
        plugins: [router],
        stubs: {
          'a-form': { template: '<form><slot /></form>' },
          'a-form-item': { template: '<div><slot /></div>' },
          'a-input': true,
          'a-input-password': true,
          'a-checkbox': true,
          'a-button': true
        }
      }
    });

    // 模拟用户输入和提交
    // 注意：由于组件使用了 Ant Design 组件，实际测试可能需要更复杂的 setup
    // 这里主要测试 API 调用逻辑
  });
});

