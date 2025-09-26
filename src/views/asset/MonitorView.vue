<template>
  <div class="asset-monitor-page">
    <a-card class="filter-card" bordered>
      <a-form layout="inline" class="filter-form">
        <a-form-item label="名称">
          <a-input placeholder="请输入名称进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="域名">
          <a-input placeholder="请输入域名进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="资产范围 ID">
          <a-input placeholder="请输入资产范围 ID 进行搜索" allow-clear />
        </a-form-item>
      </a-form>
      <div class="filter-actions">
        <a-space>
          <a-button type="primary" danger ghost>批量删除</a-button>
          <a-button disabled>批量停止</a-button>
          <a-button disabled>批量恢复</a-button>
        </a-space>
      </div>
    </a-card>

    <a-card class="table-card empty-card" bordered>
      <a-table :columns="columns" :data-source="[]" :pagination="false" row-key="id" />
      <div class="empty-block">
        <a-empty description="暂无数据" />
      </div>
    </a-card>

    <PageFooter />
  </div>
</template>

<script setup>
import PageFooter from '@/components/PageFooter.vue';

const columns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '名称', dataIndex: 'name' },
  { title: '域名', dataIndex: 'domain' },
  { title: '资产范围 ID', dataIndex: 'scopeId' },
  { title: '运行间隔', dataIndex: 'interval' },
  { title: '上次运行时间', dataIndex: 'lastRun' },
  { title: '操作', dataIndex: 'actions', width: 160 }
];
</script>

<style scoped>
.asset-monitor-page {
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

.empty-card {
  position: relative;
  min-height: 320px;
}

.empty-block {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>
