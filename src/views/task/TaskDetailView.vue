<template>
  <div class="task-detail-page">
    <a-card class="detail-card" bordered>
      <div class="detail-header">
        <div>
          <h2 class="detail-title">{{ taskInfo.name }}</h2>
          <div class="detail-meta">
            <span>目标：{{ taskInfo.target }}</span>
            <a-divider type="vertical" />
            <span>任务 ID：{{ taskInfo.id }}</span>
            <a-divider type="vertical" />
            <span>创建时间：{{ taskInfo.createdAt }}</span>
          </div>
        </div>
        <a-space>
          <a-button type="primary" ghost>风险任务下发</a-button>
          <a-button>导出站点</a-button>
          <a-button danger ghost>批量删除</a-button>
        </a-space>
      </div>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label" />
      </a-tabs>

      <a-form layout="inline" class="filter-form">
        <a-form-item label="站点">
          <a-input placeholder="请输入站点进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="主机名">
          <a-input placeholder="请输入主机名进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="状态码">
          <a-input placeholder="请输入状态码进行搜索" allow-clear />
        </a-form-item>
        <a-form-item label="标签">
          <a-input placeholder="请输入标签进行搜索" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary">查询</a-button>
            <a-button>清除</a-button>
            <a-button type="primary" ghost>导出站点</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table :columns="columns" :data-source="tableData" :pagination="false" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'site'">
            <div class="site-cell">
              <a-typography-link>{{ record.site }}</a-typography-link>
              <div class="site-tags">
                <a-tag color="default">{{ record.tag || '无效' }}</a-tag>
                <a-button type="link" size="small">添加标签</a-button>
              </div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'headers'">
            <pre class="headers-preview">{{ record.headers }}</pre>
          </template>
          <template v-else-if="column.dataIndex === 'finger'">
            <div class="finger-list">
              <div v-for="item in record.finger" :key="item">{{ item }}</div>
            </div>
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>

        <template #emptyText>
          <a-empty description="暂无数据" />
        </template>
      </a-table>
    </a-card>

    <PageFooter />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import PageFooter from '@/components/PageFooter.vue';

const taskInfo = reactive({
  name: 'example.com 巡检任务',
  target: 'example.com',
  id: 'TASK-20240923001',
  createdAt: '2025-09-23 12:00:00'
});

const tabs = [
  { key: 'site', label: '站点' },
  { key: 'subdomain', label: '子域名' },
  { key: 'ip', label: 'IP' },
  { key: 'ssl', label: 'SSL 证书' },
  { key: 'service', label: '服务' },
  { key: 'leak', label: '文件泄露' },
  { key: 'url', label: 'URL 信息' },
  { key: 'risk', label: '风险' },
  { key: 'python', label: '服务 (python)' },
  { key: 'cf', label: 'C段' },
  { key: 'nuclei', label: 'nuclei' },
  { key: 'stats', label: '指纹统计' },
  { key: 'wih', label: 'WIH' }
];

const activeTab = ref('site');

const columns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '站点', dataIndex: 'site', width: 260 },
  { title: '标题', dataIndex: 'title' },
  { title: 'headers', dataIndex: 'headers', width: 320 },
  { title: 'finger', dataIndex: 'finger', width: 240 }
];

const tableData = ref([
  {
    id: 1,
    index: 1,
    site: 'https://shop.example.com',
    title: '-',
    headers: `HTTP/1.1 404 Not Found\nDate: Tue, 23 Sep 2025 18:52:54 GMT\nContent-Length: 24\nConnection: keep-alive\nServer: nginx\nX-Gateway-Host: 1a41825724b31b17f0c522b0ae10cff`,
    finger: ['Nginx', 'IBM-Chassis-management', 'VMware vCenter']
  }
]);
</script>

<style scoped>
.task-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-breadcrumb {
  font-size: 14px;
}

.detail-card {
  border-radius: 8px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.detail-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 16px;
}

.filter-form :deep(.ant-form-item) {
  margin-bottom: 0;
}

.site-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.site-tags {
  display: flex;
  align-items: center;
  gap: 12px;
}

.headers-preview {
  white-space: pre-wrap;
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
  margin: 0;
}

.finger-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 4px 12px;
  font-size: 13px;
}

.page-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>
