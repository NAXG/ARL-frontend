<template>
  <div class="fingerprint-manage-page">
    <a-card class="filter-card" bordered>
      <a-form layout="inline" class="filter-form">
        <a-form-item label="名称">
          <a-input v-model:value="filters.name" placeholder="请输入名称进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="规则">
          <a-input v-model:value="filters.rule" placeholder="请输入规则进行搜索" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleQuery">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" ghost @click="handleImport">上传指纹</a-button>
            <a-button type="primary" @click="handleExport">指纹导出</a-button>
            <a-button danger ghost @click="handleBatchDelete">批量删除</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card" bordered>
      <div class="table-toolbar">
        <a-checkbox v-model:checked="selectAll" @change="handleSelectAll">全选</a-checkbox>
        <div class="table-toolbar-actions">
          <a-button type="primary" @click="handleAdd">添加指纹</a-button>
        </div>
      </div>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'index'">
            {{ record.index }}
          </template>
          <template v-else-if="column.dataIndex === 'name'">
            <div class="fingerprint-name">{{ record.name }}</div>
            <div class="fingerprint-meta">
              <span>来源：{{ record.source }}</span>
              <span>类型：{{ record.type }}</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'rule'">
            <pre class="rule-text">{{ record.rule }}</pre>
          </template>
          <template v-else-if="column.dataIndex === 'actions'">
            <a-space>
              <a-button type="link" size="small">编辑</a-button>
              <a-button type="link" danger size="small">删除</a-button>
            </a-space>
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>

        <template #emptyText>
          <a-empty description="暂无指纹数据" />
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="addModal.visible"
      title="添加指纹"
      :width="560"
      destroy-on-close
      ok-text="确定"
      cancel-text="取消"
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
    >
      <a-form
        ref="addFormRef"
        :model="addModal.form"
        :rules="addRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 17 }"
      >
        <a-form-item name="name" label="名称" required>
          <a-input v-model:value="addModal.form.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item name="rule" label="目标" required>
          <a-textarea
            v-model:value="addModal.form.rule"
            :rows="4"
            placeholder="只支持 body、title、header、icon_hash 四个字段，可使用逻辑和或，如 body='Powered by WordPress'"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="uploadModal.visible"
      title="上传指纹"
      :width="520"
      destroy-on-close
      ok-text="上传"
      cancel-text="取消"
      @ok="handleUploadSubmit"
      @cancel="handleUploadCancel"
    >
      <a-upload
        :file-list="uploadModal.fileList"
        :before-upload="() => false"
        @change="handleUploadChange"
      >
        <a-button type="dashed" block>点击选择文件</a-button>
      </a-upload>
      <p class="upload-hint">支持上传指纹文件，暂不自动提交。</p>
    </a-modal>

  <PageFooter />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import PageFooter from '@/components/PageFooter.vue';

const filters = reactive({
  name: '',
  rule: ''
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条`
});

const dataSource = ref([
  {
    id: 1,
    index: 1,
    name: '360-Webguard',
    rule: 'header="wzws-ray"@取消此条规则"',
    source: '内置规则库',
    type: 'Header'
  },
  {
    id: 2,
    index: 2,
    name: 'layer.js',
    rule: 'body="layer.js"@取消此条规则"',
    source: '社区贡献',
    type: 'Body'
  }
]);

pagination.total = dataSource.value.length;

const selectedRowKeys = ref([]);
const selectAll = ref(false);

const columns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '名称', dataIndex: 'name', width: 220 },
  { title: '规则', dataIndex: 'rule' },
  { title: '操作', dataIndex: 'actions', width: 160 }
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
    selectAll.value = keys.length === dataSource.value.length;
  }
}));

const handleQuery = () => {
  // TODO: 接入查询接口
};

const handleReset = () => {
  filters.name = '';
  filters.rule = '';
};

const handleImport = () => {
  uploadModal.visible = true;
};

const handleExport = () => {
  // TODO: 执行导出指纹操作
};

const handleBatchDelete = () => {
  // TODO: 批量删除指纹
};

const handleAdd = () => {
  addModal.visible = true;
};

const handleSelectAll = (event) => {
  if (event.target.checked) {
    selectedRowKeys.value = dataSource.value.map((item) => item.id);
    selectAll.value = true;
  } else {
    selectedRowKeys.value = [];
    selectAll.value = false;
  }
};

const handleTableChange = (paginationInfo) => {
  pagination.current = paginationInfo.current;
  pagination.pageSize = paginationInfo.pageSize;
};

const addFormRef = ref();
const addModal = reactive({
  visible: false,
  form: {
    name: '',
    rule: ''
  }
});

const addRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  rule: [{ required: true, message: '请输入指纹规则', trigger: 'blur' }]
};

const resetAddForm = () => {
  addModal.form.name = '';
  addModal.form.rule = '';
};

const handleAddSubmit = () => {
  addFormRef.value
    ?.validate()
    .then(() => {
      // TODO: 提交新增指纹
      addModal.visible = false;
      resetAddForm();
    })
    .catch(() => {});
};

const handleAddCancel = () => {
  addModal.visible = false;
  resetAddForm();
};

const uploadModal = reactive({
  visible: false,
  fileList: []
});

const handleUploadChange = ({ fileList }) => {
  uploadModal.fileList = fileList.slice(-1);
};

const handleUploadSubmit = () => {
  // TODO: 执行上传
  uploadModal.visible = false;
  uploadModal.fileList = [];
};

const handleUploadCancel = () => {
  uploadModal.visible = false;
  uploadModal.fileList = [];
};
</script>

<style scoped>
.fingerprint-manage-page {
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

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.fingerprint-name {
  font-weight: 600;
}

.fingerprint-meta {
  margin-top: 6px;
  display: flex;
  gap: 16px;
  color: #888;
  font-size: 12px;
}

.rule-text {
  margin: 0;
  white-space: pre-wrap;
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
}

.page-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}

.upload-hint {
  margin-top: 12px;
  color: #999;
  font-size: 12px;
}
</style>

