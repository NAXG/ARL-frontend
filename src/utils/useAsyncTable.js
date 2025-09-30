import { reactive, ref } from 'vue';

export function useAsyncTable(fetcher, options = {}) {
  const data = ref([]);
  const loading = ref(false);
  let lastParams = {};
  const pagination = reactive({
    current: 1,
    pageSize: options.pageSize || 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showQuickJumper: true,
    ...options.pagination
  });

  const run = async (extraParams = {}) => {
    loading.value = true;
    try {
      lastParams = { ...extraParams };
      const result = await fetcher({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...lastParams
      });

      const items = result?.items ?? [];
      const total = result?.total ?? items.length;

      data.value = items;
      pagination.total = total;

      return { items, total };
    } finally {
      loading.value = false;
    }
  };

  const handleTableChange = (paginationInfo) => {
    pagination.current = paginationInfo.current;
    pagination.pageSize = paginationInfo.pageSize;
    return run(lastParams);
  };

  const resetPagination = () => {
    pagination.current = 1;
  };

  const setData = (items, total) => {
    data.value = items;
    pagination.total = typeof total === 'number' ? total : items.length;
  };

  return {
    data,
    loading,
    pagination,
    run,
    handleTableChange,
    resetPagination,
    setData,
    getParams: () => ({ ...lastParams })
  };
}
