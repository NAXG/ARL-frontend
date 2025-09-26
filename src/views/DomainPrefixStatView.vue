<template>
  <div class="domain-prefix-stat">
    <a-card title="域名前缀统计" :bordered="false">
      <a-form layout="inline" @submit.prevent>
        <a-form-item label="前缀">
          <a-input v-model:value="filters.prefix" placeholder="例如 api.dev" allow-clear />
        </a-form-item>
        <a-form-item label="数量下限">
          <a-input-number v-model:value="filters.countGt" :min="0" placeholder="count__gt" style="width: 120px" />
        </a-form-item>
        <a-form-item label="数量上限">
          <a-input-number v-model:value="filters.countLt" :min="0" placeholder="count__lt" style="width: 120px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :data-source="records"
        :pagination="pagination"
        :loading="loading"
        row-key="prefix"
        style="margin-top: 16px"
        @change="handleTableChange"
      />
    </a-card>
    <PageFooter />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { fetchDomainPrefixStat } from '@/api/domain';
import PageFooter from '@/components/PageFooter.vue';

const filters = reactive({
  prefix: '',
  countGt: undefined,
  countLt: undefined
});

const columns = [
  {
    title: '前缀',
    dataIndex: 'prefix',
    key: 'prefix'
  },
  {
    title: '数量',
    dataIndex: 'count',
    key: 'count',
    sorter: true
  }
];

const records = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => `共 ${total} 条`
});
const sortState = reactive({
  field: 'count',
  order: 'descend'
});

const buildQueryParams = () => {
  const params = {
    page: pagination.current,
    size: pagination.pageSize,
    order: sortState.order === 'ascend' ? sortState.field : `-${sortState.field}`
  };

  if (filters.prefix) {
    params.prefix = filters.prefix;
  }
  if (filters.countGt !== undefined && filters.countGt !== null) {
    params['count__gt'] = filters.countGt;
  }
  if (filters.countLt !== undefined && filters.countLt !== null) {
    params['count__lt'] = filters.countLt;
  }

  return params;
};

const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await fetchDomainPrefixStat(buildQueryParams());
    records.value = data?.items ?? [];
    pagination.total = data?.total ?? 0;
    pagination.current = data?.page ?? pagination.current;
    pagination.pageSize = data?.size ?? pagination.pageSize;
  } catch (err) {
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

const resetFilters = () => {
  filters.prefix = '';
  filters.countGt = undefined;
  filters.countLt = undefined;
  pagination.current = 1;
  sortState.field = 'count';
  sortState.order = 'descend';
  loadData();
};

const handleTableChange = (pager, _filters, sorter) => {
  pagination.current = pager.current;
  pagination.pageSize = pager.pageSize;

  if (sorter && sorter.field) {
    sortState.field = sorter.field;
    sortState.order = sorter.order ?? 'ascend';
  }
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.domain-prefix-stat {
  width: 100%;
}
</style>
