<template>
  <div class="task-page-wrapper">
    <div class="task-page">
    <a-card class="filter-card" bordered>
      <div class="action-bar">
        <a-space>
          <a-button type="primary" @click="showAddTask = true">添加任务</a-button>
          <a-button @click="showFofaTask = true">FOFA 任务下发</a-button>
          <a-button @click="handleViewDetail">全局查看</a-button>
        </a-space>
      </div>

      <a-form layout="inline" class="filter-form">
        <a-form-item label="任务名">
          <a-input placeholder="请输入任务名进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="目标">
          <a-input placeholder="请输入目标进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="Task_Id">
          <a-input placeholder="请输入 Task_Id 进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="任务类型">
          <a-select placeholder="请选择任务类型进行搜索" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="状态">
          <a-input placeholder="请输入状态进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="站点数量">
          <a-input placeholder="请输入站点数量进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="域名数量">
          <a-input placeholder="请输入域名数量进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="WIH 数量">
          <a-select placeholder="请选择 WIH 数量进行搜索" allow-clear style="width: 200px" />
        </a-form-item>
      </a-form>
      <div class="filter-actions">
        <a-space>
          <a-button :disabled="!hasSelection" danger>批量删除</a-button>
          <a-button :disabled="!hasSelection">批量停止</a-button>
          <a-dropdown>
            <a-button :disabled="!hasSelection">
              批量导出
              <DownOutlined />
            </a-button>
          </a-dropdown>
        </a-space>
      </div>
    </a-card>

    <a-card class="table-card" bordered>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :scroll="{ x: 1400 }"
        :row-selection="rowSelection"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <a-tag color="success">done</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'taskName'">
            <a-typography-link>{{ record.taskName }}</a-typography-link>
          </template>
          <template v-else-if="column.dataIndex === 'statistics'">
            <span class="statistics-text">{{ record.statistics }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'options'">
            <span class="options-text">{{ record.options }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'actions'">
            <a-space wrap size="small" class="action-buttons">
              <a-button size="small" type="link">同步</a-button>
              <a-button size="small" type="link">导出</a-button>
              <a-button size="small" type="link">停止</a-button>
              <a-button size="small" type="link" danger>删除</a-button>
              <a-button size="small" type="link">重启</a-button>
            </a-space>
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>
      </a-table>
      <div class="table-footer">共 {{ pagination.total }} 条数据</div>
    </a-card>

    <PageFooter />
  </div>

  <a-modal
    v-model:open="showAddTask"
    title="添加任务"
    :width="720"
    ok-text="确定"
    cancel-text="取消"
    destroy-on-close
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="formRules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
      class="add-task-form"
    >
      <a-form-item name="taskName" label="任务名称" required>
        <a-input v-model:value="formState.taskName" placeholder="请输入任务名称" />
      </a-form-item>
      <a-form-item name="target" label="目标" required>
        <a-textarea
          v-model:value="formState.target"
          placeholder="请输入目标，支持 IP、IP段、域名"
          :rows="2"
        />
      </a-form-item>
      <a-form-item name="assetDict" label="域名爆破类型" required>
        <a-select v-model:value="formState.assetDict" placeholder="请选择域名爆破类型">
          <a-select-option value="dictionary">大字典</a-select-option>
          <a-select-option value="small">小字典</a-select-option>
          <a-select-option value="none">不爆破</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item name="portScan" label="端口扫描类型" required>
        <a-select v-model:value="formState.portScan" placeholder="请选择端口扫描类型">
          <a-select-option value="top100">TOP100</a-select-option>
          <a-select-option value="top1000">TOP1000</a-select-option>
          <a-select-option value="all">全端口</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="扫描能力">
        <a-checkbox-group v-model:value="formState.capabilities">
          <div class="checkbox-grid">
            <a-checkbox v-for="option in capabilityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-checkbox>
          </div>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item label="安全能力">
        <a-checkbox-group v-model:value="formState.securityOptions">
          <div class="checkbox-grid">
            <a-checkbox v-for="option in securityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </a-checkbox>
          </div>
        </a-checkbox-group>
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:open="showFofaTask"
    title="FOFA 任务下发"
    :width="640"
    destroy-on-close
    ok-text="确定"
    cancel-text="取消"
    @ok="handleFofaSubmit"
    @cancel="handleFofaCancel"
  >
    <a-form
      ref="fofaFormRef"
      :model="fofaFormState"
      :rules="fofaFormRules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 17 }"
      class="fofa-task-form"
    >
      <a-form-item name="taskName" label="任务名称" required>
        <a-input v-model:value="fofaFormState.taskName" placeholder="请输入任务名称" />
      </a-form-item>
      <a-form-item name="query" label="查询语句" required>
        <a-input-search
          v-model:value="fofaFormState.query"
          placeholder="请输入查询语句"
          enter-button="测试"
          @search="handleFofaTest"
        />
        <div class="fofa-result">结果数：{{ fofaResult }}</div>
      </a-form-item>
      <a-form-item name="strategy" label="关联策略">
        <a-select v-model:value="fofaFormState.strategy" placeholder="请选择关联策略" allow-clear>
          <a-select-option v-for="item in strategyOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { DownOutlined } from '@ant-design/icons-vue';
import PageFooter from '@/components/PageFooter.vue';

const router = useRouter();
const showAddTask = ref(false);
const showFofaTask = ref(false);
const formRef = ref();
const fofaFormRef = ref();
const formState = reactive({
  taskName: '',
  target: '',
  assetDict: 'dictionary',
  portScan: 'top100',
  capabilities: ['domainBrute', 'domainPlugin', 'portScan', 'cdn'],
  securityOptions: ['dnsAuto', 'arlHistory']
});

const fofaFormState = reactive({
  taskName: '',
  query: '',
  strategy: undefined
});

const fofaResult = ref(0);

const formRules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  target: [{ required: true, message: '请输入任务目标', trigger: 'blur' }],
  assetDict: [{ required: true, message: '请选择域名爆破类型', trigger: 'change' }],
  portScan: [{ required: true, message: '请选择端口扫描类型', trigger: 'change' }]
};

const fofaFormRules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  query: [{ required: true, message: '请输入查询语句', trigger: 'blur' }]
};

const capabilityOptions = [
  { label: '域名爆破', value: 'domainBrute' },
  { label: '域名查询插件', value: 'domainPlugin' },
  { label: '端口扫描', value: 'portScan' },
  { label: '操作系统识别', value: 'osDetect' },
  { label: '跳过 CDN', value: 'cdn' },
  { label: 'DNS 字典智能生成', value: 'dnsAuto' },
  { label: 'ARL 历史查询', value: 'arlHistory' }
];

const securityOptions = [
  { label: '服务识别', value: 'service' },
  { label: 'SSL 证书获取', value: 'ssl' },
  { label: '站点识别', value: 'site' },
  { label: '站点爬虫', value: 'crawler' },
  { label: '文件泄露', value: 'leak' },
  { label: 'nuclei 调用', value: 'nuclei' },
  { label: 'WIH 调用', value: 'wih' },
  { label: '搜索引擎调用', value: 'search' },
  { label: '站点监控', value: 'siteMonitor' },
  { label: 'Host 探测', value: 'host' }
];

const resetForm = () => {
  formState.taskName = '';
  formState.target = '';
  formState.assetDict = 'dictionary';
  formState.portScan = 'top100';
  formState.capabilities = ['domainBrute', 'domainPlugin', 'portScan', 'cdn'];
  formState.securityOptions = ['dnsAuto', 'arlHistory'];
};

const handleSubmit = () => {
  formRef.value
    ?.validate()
    .then(() => {
      // TODO: 发送创建任务请求
      showAddTask.value = false;
      resetForm();
    })
    .catch(() => {});
};

const handleCancel = () => {
  showAddTask.value = false;
  resetForm();
};

const handleViewDetail = () => {
  router.push('/taskList/taskDetail');
};

const strategyOptions = [
  { label: '默认策略', value: 'default' },
  { label: '高危策略', value: 'risk' },
  { label: '自定义策略', value: 'custom' }
];

const resetFofaForm = () => {
  fofaFormState.taskName = '';
  fofaFormState.query = '';
  fofaFormState.strategy = undefined;
  fofaResult.value = 0;
};

const handleFofaTest = () => {
  if (!fofaFormState.query) {
    fofaResult.value = 0;
    return;
  }
  // TODO: 调用 FOFA 接口获取结果数
  fofaResult.value = Math.floor(Math.random() * 1000);
};

const handleFofaSubmit = () => {
  fofaFormRef.value
    ?.validate()
    .then(() => {
      // TODO: 发送 FOFA 任务下发请求
      showFofaTask.value = false;
      resetFofaForm();
    })
    .catch(() => {});
};

const handleFofaCancel = () => {
  showFofaTask.value = false;
  resetFofaForm();
};

const columns = [
  {
    title: '任务名',
    dataIndex: 'taskName',
    width: 200,
    sorter: (a, b) => a.taskName.localeCompare(b.taskName)
  },
  {
    title: '目标',
    dataIndex: 'target',
    width: 220,
    sorter: (a, b) => a.target.localeCompare(b.target)
  },
  { title: '统计', dataIndex: 'statistics', width: 200 },
  { title: '配置项', dataIndex: 'options', width: 240, ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '开始时间', dataIndex: 'startTime', width: 180 },
  { title: '结束时间', dataIndex: 'endTime', width: 180 },
  { title: 'Task_Id', dataIndex: 'taskId', width: 200 },
  { title: '操作', dataIndex: 'actions', width: 260, fixed: 'right' }
];

const dataSource = reactive([
  {
    id: 1,
    taskName: 'example.com',
    target: 'example.com',
    statistics: '站点: 74\n域名: 86',
    options: '域名爆破, 域名查询插件, 端口扫描',
    status: 'done',
    startTime: '2025-09-20 09:35',
    endTime: '2025-09-20 10:15',
    taskId: 'TASK-20240920001'
  }
]);

const selectedRowKeys = ref([]);

const hasSelection = computed(() => selectedRowKeys.value.length > 0);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  }
}));

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: dataSource.length,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showQuickJumper: true
});

// 组件生命周期示例（可选）
// 组件挂载时执行
onMounted(() => {
  console.log('✅ DashboardView 组件已挂载');
});

// 组件卸载时执行
onUnmounted(() => {
  console.log('🔄 DashboardView 组件即将卸载');
});
</script>

<style scoped>
.task-page-wrapper {
  width: 100%;
}

.task-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-breadcrumb {
  font-size: 14px;
}

.filter-card {
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.filter-form :deep(.ant-form-item) {
  margin-bottom: 0;
}

.filter-actions {
  margin-top: 16px;
}

.table-footer {
  margin-top: 12px;
  color: #666;
}

.statistics-text,
.options-text {
  white-space: pre-line;
}

.page-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  padding: 4px 0;
}

.fofa-result {
  margin-top: 8px;
  color: #666;
}
</style>
