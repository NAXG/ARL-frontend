import { shallowMount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from '../App.vue';

describe('App', () => {
  it('mounts without crashing', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: { template: '<div />' }
        }
      ]
    });

    router.push('/');
    await router.isReady();

    const wrapper = shallowMount(App, {
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
          'a-button': true
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
