<template>
  <div class="github-task-manage-page">
    <a-card class="filter-card" bordered>
      <a-form layout="inline" class="filter-form">
        <a-form-item label="任务名称">
          <a-input v-model:value="filters.name" placeholder="请输入任务名称进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="关键字">
          <a-input v-model:value="filters.keyword" placeholder="请输入关键字进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" placeholder="请选择状态" allow-clear style="width: 160px">
            <a-select-option value="running">运行中</a-select-option>
            <a-select-option value="finished">已完成</a-select-option>
            <a-select-option value="failed">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" ghost @click="handleAdd">添加任务</a-button>
            <a-button danger ghost :disabled="!hasSelection" :loading="deleting" @click="handleBatchDelete">
              批量删除
            </a-button>
            <a-button :disabled="!hasSelection">批量停止</a-button>
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
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'index'">
            {{ record.index }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>

        <template #emptyText>
          <a-empty description="暂无 GitHub 任务" />
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="addModal.visible"
      title="添加任务"
      :width="520"
      destroy-on-close
      ok-text="确定"
      cancel-text="取消"
      :confirm-loading="addSubmitting"
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
    >
      <a-form
        ref="addFormRef"
        :model="addModal.form"
        :rules="addRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 17 }"
        class="add-task-form"
      >
        <a-form-item name="name" label="任务名" required>
          <a-input v-model:value="addModal.form.name" placeholder="请输入任务名" />
        </a-form-item>
        <a-form-item name="keyword" label="关键字" required>
          <a-input v-model:value="addModal.form.keyword" placeholder="请输入关键字" />
        </a-form-item>
      </a-form>
    </a-modal>

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import PageFooter from '@/components/PageFooter.vue';
import { useAsyncTable } from '@/utils/useAsyncTable';
import { createGithubTask, deleteGithubTasks, fetchGithubTasks } from '@/api/github';

const filters = reactive({
  name: '',
  keyword: '',
  status: undefined
});

const columns = [
  { title: '任务名', dataIndex: 'name' },
  { title: '关键字', dataIndex: 'keyword' },
  { title: '结果数目', dataIndex: 'resultCount' },
  { title: '状态', dataIndex: 'status' },
  { title: '开始时间', dataIndex: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime' },
  { title: '任务 ID', dataIndex: 'taskId' },
  { title: '操作', dataIndex: 'actions', width: 160 }
];

const githubTable = useAsyncTable(async (params) => {
  const { items, total } = await fetchGithubTasks(params);
  const rows = items.map((item, index) => ({
    id: item.id ?? index + 1,
    name: item.name ?? '--',
    keyword: item.keyword ?? '--',
    resultCount: item.resultCount ?? item.count ?? 0,
    status: item.status ?? 'running',
    startTime: item.startTime ?? item.createdAt ?? '--',
    endTime: item.endTime ?? item.finishedAt ?? '--',
    taskId: item.taskId ?? item.id ?? `GITHUB-${index + 1}`
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
  run: loadGithubTable,
  handleTableChange: baseHandleTableChange,
  resetPagination
} = githubTable;

const selectedRowKeys = ref([]);
const deleting = ref(false);
const addSubmitting = ref(false);

const hasSelection = computed(() => selectedRowKeys.value.length > 0);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  }
}));

const statusColor = (status) => {
  switch (status) {
    case 'running':
      return 'processing';
    case 'finished':
      return 'success';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const buildFilters = () => {
  const params = {};
  if (filters.name?.trim()) {
    params.name = filters.name.trim();
  }
  if (filters.keyword?.trim()) {
    params.keyword = filters.keyword.trim();
  }
  if (filters.status) {
    params.status = filters.status;
  }
  return params;
};

const refreshGithubTable = () =>
  loadGithubTable(buildFilters()).catch(() => {
    message.error('GitHub 任务加载失败，请稍后重试');
  });

const handleTableChange = (paginationInfo) =>
  baseHandleTableChange(paginationInfo)
    .then(() => {
      selectedRowKeys.value = [];
    })
    .catch(() => {
      message.error('GitHub 任务加载失败，请稍后重试');
    });

const handleQuery = () => {
  resetPagination();
  refreshGithubTable();
};

const handleReset = () => {
  filters.name = '';
  filters.keyword = '';
  filters.status = undefined;
  resetPagination();
  refreshGithubTable();
};

const handleAdd = () => {
  addModal.visible = true;
};

const handleBatchDelete = async () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择需要删除的任务');
    return;
  }

  deleting.value = true;
  try {
    await deleteGithubTasks(selectedRowKeys.value);
    message.success('任务已删除');
    selectedRowKeys.value = [];
    await refreshGithubTable();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || '删除任务失败，请稍后重试';
    message.error(errorMessage);
  } finally {
    deleting.value = false;
  }
};

const addFormRef = ref();
const addModal = reactive({
  visible: false,
  form: {
    name: '',
    keyword: ''
  }
});

const addRules = {
  name: [{ required: true, message: '请输入任务名', trigger: 'blur' }],
  keyword: [{ required: true, message: '请输入关键字', trigger: 'blur' }]
};

const resetAddForm = () => {
  addModal.form.name = '';
  addModal.form.keyword = '';
};

const handleAddSubmit = () => {
  addFormRef.value
    ?.validate()
    .then(async () => {
      const payload = {
        name: addModal.form.name.trim(),
        keyword: addModal.form.keyword.trim()
      };

      addSubmitting.value = true;
      try {
        await createGithubTask(payload);
        message.success('GitHub 任务已创建');
        addModal.visible = false;
        resetAddForm();
        await refreshGithubTable();
      } catch (error) {
        const errorMessage = error?.response?.data?.message || '任务创建失败，请稍后重试';
        message.error(errorMessage);
      } finally {
        addSubmitting.value = false;
      }
    })
    .catch(() => {});
};

const handleAddCancel = () => {
  addModal.visible = false;
  resetAddForm();
};

onMounted(() => {
  refreshGithubTable();
});
</script>

<style scoped>
.github-task-manage-page {
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

.add-task-form :deep(.ant-input) {
  width: 100%;
}
</style>
