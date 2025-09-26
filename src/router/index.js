import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '@/utils/auth';

const Dashboard = () => import('../views/DashboardView.vue');
const DomainPrefixStat = () => import('../views/DomainPrefixStatView.vue');
const AssetSearch = () => import('../views/asset/SearchView.vue');
const AssetMonitor = () => import('../views/asset/MonitorView.vue');
const AssetGroup = () => import('../views/asset/GroupView.vue');
const PolicyConfig = () => import('../views/policy/PolicyConfigView.vue');
const PolicyCreate = () => import('../views/policy/PolicyCreateView.vue');
const TaskDetail = () => import('../views/task/TaskDetailView.vue');
const FingerprintManage = () => import('../views/fingerprint/FingerprintManageView.vue');
const PocInfo = () => import('../views/poc/PocInfoView.vue');
const SchedulerTasks = () => import('../views/scheduler/SchedulerTasksView.vue');
const GithubTaskManage = () => import('../views/github/GithubTaskManageView.vue');
const GithubMonitor = () => import('../views/github/GithubMonitorView.vue');
const Login = () => import('../views/LoginView.vue');

const AUTH_GUARD_ENABLED = false;

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/taskList'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { layout: 'blank', guest: true }
    },
    {
      path: '/taskList',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/taskList/taskDetail',
      name: 'task-detail',
      component: TaskDetail,
      meta: { requiresAuth: true }
    },
    {
      path: '/domain/prefix-stat',
      name: 'domain-prefix-stat',
      component: DomainPrefixStat,
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'asset-search',
      component: AssetSearch,
      meta: { requiresAuth: true }
    },
    {
      path: '/assetsMonitor',
      name: 'asset-monitor',
      component: AssetMonitor,
      meta: { requiresAuth: true }
    },
    {
      path: '/groupAssetsManagement',
      name: 'asset-group',
      component: AssetGroup,
      meta: { requiresAuth: true }
    },
    {
      path: '/policy',
      name: 'policy-config',
      component: PolicyConfig,
      meta: { requiresAuth: true }
    },
    {
      path: '/policyDetail',
      name: 'policy-create',
      component: PolicyCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/tagManagement',
      name: 'fingerprint-manage',
      component: FingerprintManage,
      meta: { requiresAuth: true }
    },
    {
      path: '/pocList',
      name: 'poc-info',
      component: PocInfo,
      meta: { requiresAuth: true }
    },
    {
      path: '/planningTasks',
      name: 'scheduler-tasks',
      component: SchedulerTasks,
      meta: { requiresAuth: true }
    },
    {
      path: '/GitHubTasks/GitHubTasksList',
      name: 'github-manage',
      component: GithubTaskManage,
      meta: { requiresAuth: true }
    },
    {
      path: '/GitHubMonitor/GitHubMonitorList',
      name: 'github-monitor',
      component: GithubMonitor,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (!AUTH_GUARD_ENABLED) {
    next();
    return;
  }

  const token = getToken();

  if (to.meta?.guest) {
    if (token) {
      next({ path: '/' });
    } else {
      next();
    }
    return;
  }

  if (to.meta?.requiresAuth !== false && !token) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
