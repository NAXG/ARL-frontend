<template>
  <router-view v-if="!showLayout" />
  <a-layout v-else class="app-layout">
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" width="170" collapsed-width="50">
      <p class="logo-word" :class="{ collapsed: collapsed }">
        <img v-if="!collapsed" src="/logo.svg" alt="Logo" class="logo-expanded" />
        <img v-else src="/collapsed_logo.svg" alt="Collapsed Logo" class="logo-collapsed" />
      </p>
      <a-menu
        theme="dark"
        mode="inline"
        :selected-keys="[selectedMenuKey]"
        :inline-collapsed="collapsed"
      >
        <a-menu-item
          v-for="item in menuItems"
          :key="item.key"
          :disabled="!item.path"
          @click="handleMenuClick(item)"
        >
          <component :is="item.icon" class="anticon" />
          <span class="menu-title">{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <div class="trigger" @click="collapsed = !collapsed">
            <component :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
          </div>
          <h2 class="header-title">{{ currentPageTitle }}</h2>
        </div>
        <div v-if="isAuthenticated" class="header-right">
          <a-avatar class="avatar" size="small">
            <UserOutlined />
          </a-avatar>
          <span class="username">{{ username || '未命名用户' }}</span>
          <a-divider type="vertical" />
          <a-button type="link" size="small" @click="showPasswordModal">修改密码</a-button>
          <a-divider type="vertical" />
          <a-button type="link" size="small" @click="handleLogout">退出登录</a-button>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view v-slot="{ Component, route: viewRoute }">
          <transition name="slide-left">
            <component :is="Component" :key="viewRoute.path" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
    
    <!-- 修改密码对话框 -->
    <a-modal
      v-model:open="passwordModalVisible"
      title="修改密码"
      :confirm-loading="passwordLoading"
      @ok="handlePasswordSubmit"
      @cancel="handlePasswordCancel"
    >
      <a-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        layout="vertical"
      >
        <a-form-item label="旧密码" name="oldPassword">
          <a-input-password
            v-model:value="passwordForm.oldPassword"
            placeholder="请输入旧密码"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item label="新密码" name="newPassword">
          <a-input-password
            v-model:value="passwordForm.newPassword"
            placeholder="请输入新密码（至少6位）"
            autocomplete="off"
          />
        </a-form-item>
        <a-form-item label="确认新密码" name="confirmPassword">
          <a-input-password
            v-model:value="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
            autocomplete="off"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { MenuUnfoldOutlined, MenuFoldOutlined, AppstoreOutlined, SearchOutlined, RadarChartOutlined, ClusterOutlined, SettingOutlined, GlobalOutlined, HddOutlined, ScheduleOutlined, GithubOutlined, FundOutlined, UserOutlined, TagsOutlined } from '@ant-design/icons-vue';
import { logout, changePassword } from '@/api/auth';
import { subscribeAuthChange, clearAuth } from '@/utils/auth';

const collapsed = ref(false);
const route = useRoute();
const router = useRouter();

const isAuthenticated = ref(false);
const username = ref('');
const showLayout = computed(() => route.meta?.layout !== 'blank');

// 开发环境自动模拟登录状态
if (process.env.NODE_ENV !== 'production') {
  const token = localStorage.getItem('arl-token');
  if (!token) {
    localStorage.setItem('arl-token', 'dev-test-token');
    localStorage.setItem('arl-username', 'admin');
  }
}

const menuItems = [
  { key: 'task', label: '任务管理', icon: AppstoreOutlined, path: '/taskList' },
  { key: 'asset-search', label: '资产搜索', icon: SearchOutlined, path: '/search' },
  { key: 'asset-monitor', label: '资产监控', icon: RadarChartOutlined, path: '/assetsMonitor' },
  { key: 'asset-group', label: '资产分组', icon: ClusterOutlined, path: '/groupAssetsManagement' },
  { key: 'policy-config', label: '策略配置', icon: SettingOutlined, path: '/policy' },
  { key: 'fingerprint', label: '指纹管理', icon: TagsOutlined, path: '/tagManagement' },
  { key: 'poc', label: 'PoC 信息', icon: GlobalOutlined, path: '/pocList' },
  { key: 'scheduler', label: '计划任务', icon: ScheduleOutlined, path: '/planningTasks' },
  { key: 'github-manage', label: 'GitHub 管理', icon: GithubOutlined, path: '/GitHubTasks/GitHubTasksList' },
  { key: 'github-monitor', label: 'GitHub 监控', icon: HddOutlined, path: '/GitHubMonitor/GitHubMonitorList' },
  { key: 'domain-prefix', label: '域名前缀统计', icon: FundOutlined, path: '/domain/prefix-stat' }
];

const selectedMenuKey = computed(() => {
  if (!showLayout.value) return '';

  // Find the most specific match for the current route
  const active = menuItems
    .filter(item => item.path && route.path.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (active) {
    return active.key;
  }

  // Default to task for root or if no match is found
  if (route.path === '/' || route.path === '/taskList') {
    return 'task';
  }

  return ''; // Return no selection if no match
});

const currentPageTitle = computed(() => {
  const active = menuItems.find((item) => item.key === selectedMenuKey.value);
  return active?.label || '任务管理';
});

const handleMenuClick = (item) => {
  if (!item.path) return;
  if (route.path !== item.path) {
    router.push(item.path);
  }
};

const handleLogout = async () => {
  try {
    await logout();
  } catch {
    // ignore
  } finally {
    clearAuth();
    message.success('已退出登录');
    router.replace({ name: 'login' });
  }
};

// 修改密码相关
const passwordModalVisible = ref(false);
const passwordLoading = ref(false);
const passwordFormRef = ref();
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.value.newPassword) {
          return Promise.reject('两次输入的密码不一致');
        }
        return Promise.resolve();
      },
      trigger: 'blur'
    }
  ]
};

const showPasswordModal = () => {
  passwordModalVisible.value = true;
};

const handlePasswordCancel = () => {
  passwordModalVisible.value = false;
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordFormRef.value?.resetFields();
};

const handlePasswordSubmit = async () => {
  try {
    await passwordFormRef.value?.validate();
    passwordLoading.value = true;
    
    await changePassword({
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword
    });
    
    message.success('密码修改成功，请重新登录');
    handlePasswordCancel();
    
    // 清除认证信息，跳转登录页
    setTimeout(() => {
      clearAuth();
      router.replace({ name: 'login' });
    }, 500);
  } catch (error) {
    if (error.errorFields) {
      // 表单验证错误
      return;
    }
    // API 错误已在拦截器中处理
    console.error('修改密码失败:', error);
  } finally {
    passwordLoading.value = false;
  }
};

let unsubscribe;
let authLogoutHandler;

onMounted(() => {
  unsubscribe = subscribeAuthChange(({ token, username: name }) => {
    isAuthenticated.value = !!token;
    username.value = name || '';
  });

  if (typeof window !== 'undefined') {
    authLogoutHandler = () => {
      if (route.name === 'login') {
        return;
      }

      router.replace({
        name: 'login',
        query: { redirect: route.fullPath }
      });
    };

    window.addEventListener('auth:logout', authLogoutHandler);
  }
});

onUnmounted(() => {
  if (typeof unsubscribe === 'function') {
    unsubscribe();
  }

  if (typeof window !== 'undefined' && authLogoutHandler) {
    window.removeEventListener('auth:logout', authLogoutHandler);
  }
});

</script>

<style scoped>
/* 1. Sider Container */
:deep(.ant-layout-sider) {
  position: relative;
  min-width: 0;
  background: #001529;
  transition: all 0.2s;
}

/* 2. Logo (Emulated with SVG) */
.logo-word {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center; /* Center expanded logo */
  padding: 0 24px;
  cursor: pointer;
  overflow: hidden;
}

.logo-word.collapsed {
  padding-left: 12px;
  justify-content: flex-start; /* Left-align collapsed logo */
}

/* My custom classes for the img tags */
.logo-expanded {
  height: 30px;
}

.logo-collapsed {
  height: 30px;
}

/* 3. Menu Item (from Reference) */
:deep(.ant-menu-dark .ant-menu-item),
:deep(.ant-menu-dark .ant-menu-submenu-title) {
  color: #5e7d8c;
  border-left: 3px solid transparent;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  height: 40px;
  line-height: 40px;
  padding: 0 16px 0 24px !important;
  margin: 4px 0 !important;
  width: 100%;
}

:deep(.ant-menu.ant-menu-dark .ant-menu-item-selected),
:deep(.ant-menu-dark.ant-menu-inline .ant-menu-submenu-selected .ant-menu-submenu-title) {
  color: #fff;
  border-left-color: #00c5dc;
  background: hsla(0, 0%, 100%, 0.2);
}

:deep(.ant-menu-item .anticon) {
  font-size: 14px;
}

/* 4. Collapsed State (from Reference) */


:deep(.ant-menu-inline-collapsed > .ant-menu-item) {
  padding: 0 !important; /* Remove padding, flexbox will handle alignment */
  display: flex;
  align-items: center; /* Vertical centering */
  justify-content: center; /* Horizontal centering */
  margin: 4px 0 8px !important;
  line-height: initial; /* Reset line-height to prevent conflict with flexbox */
}

:deep(.ant-menu-inline-collapsed .ant-menu-item .anticon) {
  margin: 0;
  font-size: 16px;
}

/* The definitive fix for hiding text */
:deep(.ant-menu-inline-collapsed > .ant-menu-item .anticon + .menu-title) {
  display: inline-block;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
}

/* Keep other styles for header and content */
.app-layout {
  min-height: 100vh;
  overflow-x: hidden;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  color: #1d2b3e;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d2b3e;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1d2b3e;
}

.avatar :deep(.ant-avatar-string) {
  display: none;
}

.username {
  font-weight: 500;
}

.content {
  background: #f4f6fa;
  min-height: calc(100vh - 64px);
  padding: 24px 32px;
  position: relative;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  position: absolute;
  width: 100%;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.content {
  overflow-x: hidden;
}
</style>
