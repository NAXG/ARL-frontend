<template>
  <div class="asset-group-page">
    <a-card class="filter-card" bordered>
      <a-form layout="inline" class="filter-form">
        <a-form-item label="分组名称">
          <a-input placeholder="请输入分组名称进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="描述">
          <a-input placeholder="请输入描述进行搜索" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary">查询</a-button>
            <a-button>重置</a-button>
            <a-button type="primary" ghost @click="showCreateModal = true">新建分组</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card" bordered>
      <a-table :columns="columns" :data-source="tableData" :pagination="false" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'index'">
            {{ record.index }}
          </template>
          <template v-else-if="column.dataIndex === 'actions'">
            <a-space>
              <a-button type="link" size="small">查看</a-button>
              <a-button type="link" size="small">编辑</a-button>
              <a-button type="link" size="small" danger>删除</a-button>
            </a-space>
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>

        <template #emptyText>
          <a-empty description="暂无资产分组数据" />
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="showCreateModal"
      title="新建资产分组"
      :width="640"
      destroy-on-close
      ok-text="确定"
      cancel-text="取消"
      @ok="handleCreateSubmit"
      @cancel="handleCreateCancel"
    >
      <a-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 17 }"
      >
        <a-form-item name="ipType" label="IP 类别" required>
          <a-select v-model:value="createForm.ipType" placeholder="请选择 IP 类别">
            <a-select-option value="internet">公网 IP</a-select-option>
            <a-select-option value="internal">内网 IP</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="name" label="资产组名称" required>
          <a-input v-model:value="createForm.name" placeholder="请输入资产组名称" />
        </a-form-item>
        <a-form-item name="scope" label="资产范围" required>
          <a-textarea
            v-model:value="createForm.scope"
            :rows="4"
            placeholder="请输入域名，如 freebuf.com。多个目标用换行或逗号分隔"
          />
        </a-form-item>
      </a-form>
    </a-modal>

   <PageFooter />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import PageFooter from '@/components/PageFooter.vue';

const showCreateModal = ref(false);
const createFormRef = ref();
const createForm = reactive({
  ipType: undefined,
  name: '',
  scope: ''
});

const createRules = {
  ipType: [{ required: true, message: '请选择 IP 类别', trigger: 'change' }],
  name: [{ required: true, message: '请输入资产组名称', trigger: 'blur' }],
  scope: [{ required: true, message: '请输入资产范围', trigger: 'blur' }]
};

const columns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '资产组名称', dataIndex: 'name' },
  { title: '资产范围 ID', dataIndex: 'scopeId' },
  { title: '资产数量', dataIndex: 'assetCount' },
  { title: '更新时间', dataIndex: 'updatedAt' },
  { title: '操作', dataIndex: 'actions', width: 200 }
];

const tableData = reactive([
  {
    id: 1,
    index: 1,
    name: '互联网公开资产',
    scopeId: 'SCOPE-202409-001',
    assetCount: 128,
    updatedAt: '2025-09-23 11:45'
  }
]);

const handleCreateSubmit = () => {
  createFormRef.value
    ?.validate()
    .then(() => {
      // TODO: 提交新建资产分组接口
      showCreateModal.value = false;
      createForm.ipType = undefined;
      createForm.name = '';
      createForm.scope = '';
    })
    .catch(() => {});
};

const handleCreateCancel = () => {
  showCreateModal.value = false;
  createForm.ipType = undefined;
  createForm.name = '';
  createForm.scope = '';
};
</script>

<style scoped>
.asset-group-page {
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

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
}

.filter-form :deep(.ant-form-item) {
  margin-bottom: 0;
}

.table-card {
  border-radius: 8px;
}

.page-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>

