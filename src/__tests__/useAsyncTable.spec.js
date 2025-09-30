import { describe, it, expect, vi } from 'vitest';
import { useAsyncTable } from '@/utils/useAsyncTable';

const createFetcher = (items, total) =>
  vi.fn(async (params) => ({
    items: items.map((item, index) => ({ ...item, callIndex: index, params })),
    total
  }));

describe('useAsyncTable', () => {
  it('loads data and updates pagination', async () => {
    const fetcher = createFetcher([{ id: 1, name: 'foo' }], 5);
    const table = useAsyncTable(fetcher, { pageSize: 5 });

    const result = await table.run({ keyword: 'foo' });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith({ page: 1, pageSize: 5, keyword: 'foo' });
    expect(result.total).toBe(5);
    expect(table.data.value).toHaveLength(1);
    expect(table.data.value[0].name).toBe('foo');
    expect(table.pagination.total).toBe(5);
  });

  it('reuses last params when changing page', async () => {
    const fetcher = createFetcher([{ id: 1 }], 10);
    const table = useAsyncTable(fetcher, { pageSize: 5 });

    await table.run({ keyword: 'bar' });
    fetcher.mockClear();

    await table.handleTableChange({ current: 2, pageSize: 5 });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith({ page: 2, pageSize: 5, keyword: 'bar' });
    expect(table.pagination.current).toBe(2);
  });
});
