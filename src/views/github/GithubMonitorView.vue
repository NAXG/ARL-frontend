<template>
  <div class="github-monitor-page">
    <a-card class="filter-card" bordered>
      <a-form layout="inline" class="filter-form">
        <a-form-item label="任务名称">
          <a-input v-model:value="filters.name" placeholder="请输入任务名称进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="仓库">
          <a-input v-model:value="filters.repo" placeholder="请输入仓库地址进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" placeholder="请选择状态" allow-clear style="width: 160px">
            <a-select-option value="watching">监控中</a-select-option>
            <a-select-option value="idle">空闲</a-select-option>
            <a-select-option value="error">异常</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" ghost @click="handleSubscribe">添加任务</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card empty-card" bordered>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="tableLoading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="statusColor(record.status)">{{ statusText(record.status) }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="handleViewDetail(record)">详情</a-button>
              <a-button
                type="link"
                danger
                size="small"
                :loading="cancelingId === record.id"
                @click="handleCancelMonitor(record)"
              >
                取消监控
              </a-button>
            </a-space>
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>

        <template #emptyText>
          <a-empty description="暂无 GitHub 监控任务" />
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="subscribeModal.visible"
      title="添加任务"
      :width="520"
      destroy-on-close
      ok-text="确定"
      cancel-text="取消"
      :confirm-loading="subscribeSubmitting"
      @ok="handleSubscribeSubmit"
      @cancel="handleSubscribeCancel"
    >
      <a-form
        ref="subscribeFormRef"
        :model="subscribeModal.form"
        :rules="subscribeRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        class="subscribe-form"
      >
        <a-form-item name="name" label="任务名" required>
          <a-input v-model:value="subscribeModal.form.name" placeholder="请输入任务名" />
        </a-form-item>
        <a-form-item name="repo" label="仓库" required>
          <a-input v-model:value="subscribeModal.form.repo" placeholder="请输入仓库地址" />
        </a-form-item>
        <a-form-item name="keyword" label="关键字" required>
          <a-input v-model:value="subscribeModal.form.keyword" placeholder="请输入关键字" />
        </a-form-item>
        <a-form-item name="cron" label="cron 表达式" required>
          <a-input v-model:value="subscribeModal.form.cron" placeholder="请输入 cron 表达式" />
        </a-form-item>
      </a-form>
    </a-modal>

    <PageFooter />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import PageFooter from '@/components/PageFooter.vue';
import { useAsyncTable } from '@/utils/useAsyncTable';
import {
  cancelGithubMonitorTask,
  createGithubMonitorTask,
  fetchGithubMonitors
} from '@/api/github';

const filters = reactive({
  name: '',
  repo: '',
  status: undefined
});

const columns = [
  { title: '任务名称', dataIndex: 'name' },
  { title: '仓库', dataIndex: 'repo' },
  { title: '关键字', dataIndex: 'keyword' },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '最近同步时间', dataIndex: 'lastSync' },
  { title: '告警数量', dataIndex: 'alertCount', width: 120 },
  { title: '操作', dataIndex: 'actions', width: 160 }
];

const monitorTable = useAsyncTable(async (params) => {
  const { items, total } = await fetchGithubMonitors(params);
  const rows = items.map((item, index) => ({
    id: item.id ?? index + 1,
    name: item.name ?? '--',
    repo: item.repo ?? item.repository ?? '--',
    keyword: item.keyword ?? '--',
    status: item.status ?? 'watching',
    lastSync: item.lastSync ?? item.updatedAt ?? '--',
    alertCount: item.alertCount ?? item.alerts ?? 0
  }));

  return {
    items: rows,
    total
  };
}, {
  pagination: {
    pageSize: 10,
    showTotal: (total) => `共 ${total} 条`
  }
});

const {
  data: dataSource,
  loading: tableLoading,
  pagination,
  run: loadMonitorTable,
  handleTableChange: baseHandleTableChange,
  resetPagination
} = monitorTable;

const buildFilters = () => {
  const params = {};
  if (filters.name?.trim()) params.name = filters.name.trim();
  if (filters.repo?.trim()) params.repo = filters.repo.trim();
  if (filters.status) params.status = filters.status;
  return params;
};

const statusColor = (status) => {
  switch (status) {
    case 'watching':
      return 'processing';
    case 'idle':
      return 'default';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

const statusText = (status) => {
  switch (status) {
    case 'watching':
      return '监控中';
    case 'idle':
      return '空闲';
    case 'error':
      return '异常';
    default:
      return status || '-';
  }
};

const handleQuery = () => {
  resetPagination();
  return loadMonitorTable(buildFilters()).catch(() => {
    message.error('加载 GitHub 监控任务失败，请稍后重试');
  });
};

const handleReset = () => {
  filters.name = '';
  filters.repo = '';
  filters.status = undefined;
  handleQuery();
};

const handleSubscribe = () => {
  subscribeModal.visible = true;
};

const handleTableChange = (paginationInfo) =>
  baseHandleTableChange(paginationInfo)
    .then(() => {})
    .catch(() => {
      message.error('加载 GitHub 监控任务失败，请稍后重试');
    });

const subscribeFormRef = ref();
const subscribeSubmitting = ref(false);
const subscribeModal = reactive({
  visible: false,
  form: {
    name: '',
    repo: '',
    keyword: '',
    cron: ''
  }
});

const subscribeRules = {
  name: [{ required: true, message: '请输入任务名', trigger: 'blur' }],
  repo: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
  keyword: [{ required: true, message: '请输入关键字', trigger: 'blur' }],
  cron: [{ required: true, message: '请输入 cron 表达式', trigger: 'blur' }]
};

const resetSubscribeForm = () => {
  subscribeModal.form.name = '';
  subscribeModal.form.repo = '';
  subscribeModal.form.keyword = '';
  subscribeModal.form.cron = '';
};

const handleSubscribeSubmit = () => {
  subscribeFormRef.value
    ?.validate()
    .then(async () => {
      subscribeSubmitting.value = true;
      try {
        const payload = {
          name: subscribeModal.form.name.trim(),
          repo: subscribeModal.form.repo.trim(),
          keyword: subscribeModal.form.keyword.trim(),
          cron: subscribeModal.form.cron.trim()
        };
        await createGithubMonitorTask(payload);
        message.success('GitHub 监控任务已创建');
        subscribeModal.visible = false;
        resetSubscribeForm();
        await handleQuery();
      } catch (error) {
        const errorMessage = error?.response?.data?.message || '创建任务失败，请稍后重试';
        message.error(errorMessage);
      } finally {
        subscribeSubmitting.value = false;
      }
    })
    .catch(() => {});
};

const handleSubscribeCancel = () => {
  subscribeModal.visible = false;
  resetSubscribeForm();
};

const cancelingId = ref(null);

const handleCancelMonitor = async (record) => {
  if (!record?.id) return;
  cancelingId.value = record.id;
  try {
    await cancelGithubMonitorTask(record.id);
    message.success('监控任务已取消');
    await handleQuery();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || '取消监控失败，请稍后重试';
    message.error(errorMessage);
  } finally {
    cancelingId.value = null;
  }
};

const handleViewDetail = (record) => {
  if (typeof window === 'undefined' || !record?.repo) return;
  const normalized = record.repo.replace(/^https?:\/\//i, '');
  window.open(`https://${normalized}`, '_blank', 'noopener');
};

onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
.github-monitor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-breadcrumb {
  font-size: 14px;
}

.filter-card,
.table-card {
  border-radius: 8px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.filter-form :deep(.ant-form-item) {
  margin-bottom: 0;
}

.empty-card {
  position: relative;
  min-height: 320px;
}

.page-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}

.subscribe-form :deep(.ant-input) {
  width: 100%;
}
</style>
