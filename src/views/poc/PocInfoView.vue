<template>
  <div class="poc-info-page">
    <a-card class="filter-card" bordered>
      <a-form layout="inline" class="filter-form">
        <a-form-item label="漏洞名称">
          <a-input v-model:value="filters.name" placeholder="请输入漏洞名称进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="应用">
          <a-input v-model:value="filters.app" placeholder="请输入应用进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="协议">
          <a-input v-model:value="filters.protocol" placeholder="请输入协议进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="类别">
          <a-input v-model:value="filters.category" placeholder="请输入类别进行搜索" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleRefresh">更新</a-button>
            <a-button @click="handleReset">清 空</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card" bordered>
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
          <a-empty description="暂无 PoC 数据" />
        </template>
      </a-table>
    </a-card>

    <PageFooter />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import PageFooter from '@/components/PageFooter.vue';

const filters = reactive({
  name: '',
  app: '',
  protocol: '',
  category: ''
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条`
});

const columns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '漏洞名称', dataIndex: 'name' },
  { title: '应用', dataIndex: 'app' },
  { title: '类别', dataIndex: 'category' },
  { title: '协议', dataIndex: 'protocol' }
];

const dataSource = ref([
  {
    id: 1,
    index: 1,
    name: 'Memcached 未授权访问',
    app: 'Memcached',
    category: '漏洞 PoC',
    protocol: 'memcached'
  },
  {
    id: 2,
    index: 2,
    name: 'Apache solr 未授权访问',
    app: 'solr',
    category: '漏洞 PoC',
    protocol: 'https,http'
  },
  {
    id: 3,
    index: 3,
    name: 'Docker Remote API 未授权访问',
    app: 'Docker',
    category: '漏洞 PoC',
    protocol: 'https,http'
  }
]);

pagination.total = dataSource.value.length;

const handleRefresh = () => {
  // TODO: 接入同步逻辑
};

const handleReset = () => {
  filters.name = '';
  filters.app = '';
  filters.protocol = '';
  filters.category = '';
};

const handleTableChange = (paginationInfo) => {
  pagination.current = paginationInfo.current;
  pagination.pageSize = paginationInfo.pageSize;
};
</script>

<style scoped>
.poc-info-page {
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

.page-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>

