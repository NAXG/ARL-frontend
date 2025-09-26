<template>
  <div class="policy-config-page">
    <a-card class="filter-card" bordered>
      <div class="filter-actions">
        <a-button type="primary" @click="handleCreate">新建策略</a-button>
      </div>
      <a-form layout="inline" class="filter-form">
        <a-form-item label="策略名称">
          <a-input-search
            v-model:value="keyword"
            placeholder="请输入策略名称进行搜索"
            allow-clear
            style="width: 320px"
            @search="handleSearch"
          />
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card" bordered>
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :loading="loading"
        :pagination="pagination"
        :expandable="expandable"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'index'">
            {{ record.index }}
          </template>
          <template v-else-if="column.dataIndex === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="handleDistribute(record)">任务下发</a-button>
              <a-button type="link" size="small">编辑</a-button>
              <a-button type="link" size="small" danger>删除</a-button>
            </a-space>
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>

        <template #emptyText>
          <a-empty description="暂无策略数据" />
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="distributeModal.visible"
      title="任务下发"
      :width="560"
      destroy-on-close
      ok-text="确定"
      cancel-text="取消"
      @ok="handleDistributeSubmit"
      @cancel="handleDistributeCancel"
    >
      <a-form
        ref="distributeFormRef"
        :model="distributeModal.form"
        :rules="distributeRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 17 }"
      >
        <a-form-item name="type" label="任务类型" required>
          <a-select v-model:value="distributeModal.form.type" placeholder="请选择任务类型">
            <a-select-option value="domain">域名任务</a-select-option>
            <a-select-option value="ip">IP 任务</a-select-option>
            <a-select-option value="mixed">综合任务</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="name" label="任务名称" required>
          <a-input v-model:value="distributeModal.form.name" placeholder="请输入任务名称" />
        </a-form-item>
        <a-form-item name="target" label="目标" required>
          <a-textarea
            v-model:value="distributeModal.form.target"
            :rows="4"
            placeholder="请输入目标，支持 IP、IP段、域名"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <PageFooter />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageFooter from '@/components/PageFooter.vue';

const router = useRouter();
const keyword = ref('');

const loading = ref(false);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 1,
  showTotal: (total) => `共 ${total} 条`
});

const columns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '名称', dataIndex: 'name' },
  { title: '描述', dataIndex: 'description' },
  { title: '更新时间', dataIndex: 'updatedAt' },
  { title: '操作', dataIndex: 'actions', width: 200 }
];

const dataSource = ref([
  {
    id: 1,
    index: 1,
    name: '默认巡查策略',
    description: '全端口扫描 + 指纹识别 + 漏洞探测',
    updatedAt: '2025-09-24 20:46:53'
  }
]);

const handleSearch = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 600);
};

const handleCreate = () => {
  router.push('/policyDetail');
};

const handleTableChange = (paginationInfo) => {
  pagination.current = paginationInfo.current;
  pagination.pageSize = paginationInfo.pageSize;
};

const filteredData = computed(() => {
  if (!keyword.value) return dataSource.value;
  return dataSource.value.filter((item) => item.name.includes(keyword.value));
});

const expandable = {
  rowExpandable: () => false
};

const distributeFormRef = ref();
const distributeModal = reactive({
  visible: false,
  current: null,
  form: {
    type: undefined,
    name: '',
    target: ''
  }
});

const distributeRules = {
  type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  target: [{ required: true, message: '请输入任务目标', trigger: 'blur' }]
};

const resetDistributeForm = () => {
  distributeModal.form.type = undefined;
  distributeModal.form.name = '';
  distributeModal.form.target = '';
};

const handleDistribute = (record) => {
  distributeModal.current = record;
  distributeModal.form.name = `${record.name}-任务`;
  distributeModal.visible = true;
};

const handleDistributeSubmit = () => {
  distributeFormRef.value
    ?.validate()
    .then(() => {
      // TODO: 提交任务下发
      distributeModal.visible = false;
      resetDistributeForm();
    })
    .catch(() => {});
};

const handleDistributeCancel = () => {
  distributeModal.visible = false;
  resetDistributeForm();
};
</script>

<style scoped>
.policy-config-page {
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

.policy-name {
  font-weight: 600;
}

.policy-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>

