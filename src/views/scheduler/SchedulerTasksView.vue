<template>
  <div class="scheduler-tasks-page">
    <a-card class="filter-card" bordered>
      <a-form layout="inline" class="filter-form">
        <a-form-item label="任务名称">
          <a-input v-model:value="filters.name" placeholder="请输入任务名称进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="目标">
          <a-input v-model:value="filters.target" placeholder="请输入目标进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="策略名称">
          <a-input v-model:value="filters.strategy" placeholder="请输入策略名称进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="计划类型">
          <a-select v-model:value="filters.type" placeholder="请选择计划类型" allow-clear style="width: 160px">
            <a-select-option value="周期">周期</a-select-option>
            <a-select-option value="一次性">一次性</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="filters.status" placeholder="请选择状态" allow-clear style="width: 160px">
            <a-select-option value="running">运行中</a-select-option>
            <a-select-option value="paused">已暂停</a-select-option>
            <a-select-option value="finished">已完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" ghost @click="handleCreate">添加计划任务</a-button>
            <a-button danger ghost @click="handleBatchDelete">批量删除</a-button>
            <a-button disabled>批量停止</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card empty-card" bordered>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'index'">
            {{ record.index }}
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>

        <template #emptyText>
          <a-empty description="暂无计划任务" />
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="createModal.visible"
      title="添加计划任务"
      :width="560"
      destroy-on-close
      ok-text="确定"
      cancel-text="取消"
      @ok="handleCreateSubmit"
      @cancel="handleCreateCancel"
    >
      <a-form
        ref="createFormRef"
        :model="createModal.form"
        :rules="createRules"
        class="create-form"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item name="name" label="名称" required>
          <a-input v-model:value="createModal.form.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item name="target" label="目标" required>
          <a-textarea v-model:value="createModal.form.target" :rows="3" placeholder="请输入目标" />
        </a-form-item>
        <a-form-item name="type" label="计划类型" required>
          <a-select
            v-model:value="createModal.form.type"
            placeholder="请选择计划类型"
            style="width: 100%"
          >
            <a-select-option value="周期">周期</a-select-option>
            <a-select-option value="一次性">一次性</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="strategy" label="策略" required>
          <a-select
            v-model:value="createModal.form.strategy"
            placeholder="请选择策略"
            style="width: 100%"
          >
            <a-select-option value="default">默认策略</a-select-option>
            <a-select-option value="custom">自定义策略</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="taskType" label="任务类别" required>
          <a-select
            v-model:value="createModal.form.taskType"
            placeholder="请选择任务类别"
            style="width: 100%"
          >
            <a-select-option value="asset">资产巡检</a-select-option>
            <a-select-option value="risk">风险扫描</a-select-option>
            <a-select-option value="custom">自定义任务</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <PageFooter />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import PageFooter from '@/components/PageFooter.vue';

const filters = reactive({
  name: '',
  target: '',
  strategy: '',
  type: undefined,
  status: undefined
});

const columns = [
  { title: '任务名', dataIndex: 'name' },
  { title: '目标', dataIndex: 'target' },
  { title: '类型', dataIndex: 'type' },
  { title: '状态', dataIndex: 'status' },
  { title: '策略', dataIndex: 'strategy' },
  { title: '时间配置', dataIndex: 'schedule' },
  { title: '上次运行时间', dataIndex: 'lastRun' },
  { title: '下次运行时间', dataIndex: 'nextRun' },
  { title: '运行次数', dataIndex: 'runTimes' },
  { title: '操作', dataIndex: 'actions', width: 160 }
];

const dataSource = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条`
});

const handleQuery = () => {
  // TODO: 查询计划任务
};

const handleReset = () => {
  filters.name = '';
  filters.target = '';
  filters.strategy = '';
  filters.type = undefined;
  filters.status = undefined;
};

const handleCreate = () => {
  createModal.visible = true;
};

const handleBatchDelete = () => {
  // TODO: 批量删除任务
};

const handleTableChange = (paginationInfo) => {
  pagination.current = paginationInfo.current;
  pagination.pageSize = paginationInfo.pageSize;
};

const createFormRef = ref();
const createModal = reactive({
  visible: false,
  form: {
    name: '',
    target: '',
    type: undefined,
    strategy: undefined,
    taskType: undefined
  }
});

const createRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  target: [{ required: true, message: '请输入目标', trigger: 'blur' }],
  type: [{ required: true, message: '请选择计划类型', trigger: 'change' }],
  strategy: [{ required: true, message: '请选择策略', trigger: 'change' }],
  taskType: [{ required: true, message: '请选择任务类别', trigger: 'change' }]
};

const resetCreateForm = () => {
  createModal.form.name = '';
  createModal.form.target = '';
  createModal.form.type = undefined;
  createModal.form.strategy = undefined;
  createModal.form.taskType = undefined;
};

const handleCreateSubmit = () => {
  createFormRef.value
    ?.validate()
    .then(() => {
      // TODO: 提交新增计划任务
      createModal.visible = false;
      resetCreateForm();
    })
    .catch(() => {});
};

const handleCreateCancel = () => {
  createModal.visible = false;
  resetCreateForm();
};
</script>

<style scoped>
.scheduler-tasks-page {
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

.create-form :deep(.ant-input),
.create-form :deep(.ant-select-selector) {
  width: 100%;
}
</style>

