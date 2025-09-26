<template>
  <div class="asset-search-page">
    <a-card class="filter-card" bordered>
      <a-tabs v-model:activeKey="activeTab" class="search-tabs">
        <a-tab-pane key="site" tab="站点" />
        <a-tab-pane key="subdomain" tab="子域名" />
        <a-tab-pane key="ip" tab="IP" />
      </a-tabs>

      <template v-if="activeTab === 'site'">
        <a-form layout="inline" class="filter-form">
          <a-form-item label="站点">
            <a-input placeholder="请输入站点进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="主机名">
            <a-input placeholder="请输入主机名进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="标识">
            <a-input placeholder="请输入标识进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="Web Server">
            <a-input placeholder="请输入 Web Server 进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="状态码">
            <a-input placeholder="请输入状态码进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="标签">
            <a-input placeholder="请输入标签进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="favicon hash">
            <a-input placeholder="请输入 favicon hash 进行搜索" allow-clear />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button>清 除</a-button>
              <a-button type="primary">导出站点</a-button>
              <a-button type="primary" ghost @click="showRiskModal = true">风险任务下发</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </template>

      <template v-else-if="activeTab === 'subdomain'">
        <a-form layout="inline" class="filter-form">
          <a-form-item label="域名">
            <a-input placeholder="请输入域名进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="记录值">
            <a-input placeholder="请输入记录值进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="类型">
            <a-input placeholder="请输入类型进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="IP">
            <a-input placeholder="请输入 IP 进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="来源">
            <a-input placeholder="请输入来源进行搜索" allow-clear />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button>清 除</a-button>
              <a-button type="primary">导出域名</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </template>

      <template v-else>
        <a-form layout="inline" class="filter-form">
          <a-form-item label="IP">
            <a-input placeholder="请输入 IP 进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="域名">
            <a-input placeholder="请输入域名进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="端口">
            <a-input placeholder="请输入端口进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="操作系统">
            <a-input placeholder="请输入操作系统进行搜索" allow-clear />
          </a-form-item>
          <a-form-item label="CDN">
            <a-input placeholder="请输入 CDN 进行搜索" allow-clear />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button>清 除</a-button>
              <a-button type="primary">导出 IP 端口</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </template>
    </a-card>

    <a-card class="table-card" bordered>
      <a-table :columns="currentColumns" :data-source="currentData" :pagination="false" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'index'">
            {{ record.index }}
          </template>
          <template v-else-if="column.dataIndex === 'site'">
            <div class="site-info">
              <a-typography-link>{{ record.site }}</a-typography-link>
              <div class="tag-group">
                <a-tag color="default">无效</a-tag>
                <a-button type="link" size="small">添加标签</a-button>
              </div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'headers'">
            <pre class="monospace">{{ record.headers }}</pre>
          </template>
          <template v-else-if="column.dataIndex === 'finger'">
            <div class="finger-list">
              <div v-for="finger in record.finger" :key="finger">{{ finger }}</div>
            </div>
          </template>
          <template v-else>
            <span>{{ record[column.dataIndex] }}</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="showRiskModal"
      title="添加风险巡航任务"
      :width="600"
      destroy-on-close
      ok-text="确定"
      cancel-text="取消"
      @ok="handleRiskSubmit"
      @cancel="handleRiskCancel"
    >
      <a-form
        ref="riskFormRef"
        :model="riskForm"
        :rules="riskRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item name="strategy" label="策略名称" required>
          <a-select v-model:value="riskForm.strategy" placeholder="请选择策略名称">
            <a-select-option value="default">默认策略</a-select-option>
            <a-select-option value="high-risk">高危策略</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="taskName" label="任务名称" required>
          <a-input v-model:value="riskForm.taskName" placeholder="请输入任务名称" />
        </a-form-item>
        <a-form-item label="目标">
          <div class="risk-target">已选择目标数 {{ selectedTargetCount }}</div>
        </a-form-item>
      </a-form>
    </a-modal>
    <PageFooter />
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue';
import PageFooter from '@/components/PageFooter.vue';

const activeTab = ref('site');

const showRiskModal = ref(false);
const riskFormRef = ref();
const riskForm = reactive({
  strategy: undefined,
  taskName: ''
});

const riskRules = {
  strategy: [{ required: true, message: '请选择策略名称', trigger: 'change' }],
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }]
};

const siteColumns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '站点', dataIndex: 'site', width: 280 },
  { title: '标题', dataIndex: 'title', width: 200 },
  { title: 'headers', dataIndex: 'headers', width: 320 },
  { title: 'finger', dataIndex: 'finger', width: 240 }
];

const subdomainColumns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '域名', dataIndex: 'domain', width: 280 },
  { title: '解析类型', dataIndex: 'recordType', width: 160 },
  { title: '记录值', dataIndex: 'recordValue', width: 320 },
  { title: '关联 IP', dataIndex: 'ipList', width: 260 }
];

const ipColumns = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: 'IP', dataIndex: 'ip', width: 200 },
  { title: '操作系统', dataIndex: 'os', width: 180 },
  { title: '开放端口', dataIndex: 'ports', width: 220 },
  { title: '关联域名', dataIndex: 'domain', width: 260 },
  { title: 'Geo', dataIndex: 'geo', width: 180 }
];

const siteData = reactive([
  {
    id: 1,
    index: 1,
    site: 'https://shop.example.com',
    title: '-',
    headers: `HTTP/1.1 404 Not Found\nDate: Tue, 23 Sep 2025 18:52:54 GMT\nContent-Length: 24\nConnection: keep-alive\nServer: nginx\nX-Gateway-Host: 1a41825724b31b17f0c522b0ae10cff`,
    finger: ['Nginx', 'IBM-Chassis-management', 'VMware vCenter', 'DLink-Power-Line-Communication', 'JEECMS', 'TP-LINK-VPN', 'DouPHP', 'apide-adminsdk']
  }
]);

const subdomainData = reactive([
  {
    id: 1,
    index: 1,
    domain: 'developer.example.com',
    recordType: 'CNAME',
    recordValue: 'sgp-oop-pub-yj1w1a-1138354884.ap-southeast-1.elb.amazonaws.com',
    ipList: '1.1.1.1, 1.1.1.1'
  },
  {
    id: 2,
    index: 2,
    domain: 'pre-store.example.com',
    recordType: 'A',
    recordValue: '1.1.1.1',
    ipList: '1.1.1.1'
  }
]);

const ipData = reactive([
  {
    id: 1,
    index: 1,
    ip: '1.1.1.1',
    os: '-',
    ports: '-',
    domain: 'test.www.example.com',
    geo: '-'
  },
  {
    id: 2,
    index: 2,
    ip: '1.1.1.1',
    os: '-',
    ports: '-',
    domain: 'msts.example.com',
    geo: 'China / Guangzhou'
  }
]);

const currentColumns = computed(() => {
  if (activeTab.value === 'subdomain') return subdomainColumns;
  if (activeTab.value === 'ip') return ipColumns;
  return siteColumns;
});

const currentData = computed(() => {
  if (activeTab.value === 'subdomain') return subdomainData;
  if (activeTab.value === 'ip') return ipData;
  return siteData;
});

const selectedTargetCount = computed(() => (activeTab.value === 'site' ? siteData.length : 0));

const handleRiskSubmit = () => {
  riskFormRef.value
    ?.validate()
    .then(() => {
      // TODO: 调用风险任务下发接口
      showRiskModal.value = false;
      riskForm.strategy = undefined;
      riskForm.taskName = '';
    })
    .catch(() => {});
};

const handleRiskCancel = () => {
  showRiskModal.value = false;
  riskForm.strategy = undefined;
  riskForm.taskName = '';
};

// 组件生命周期示例（可选）
// 组件挂载时执行
onMounted(() => {
  console.log('✅ SearchView 组件已挂载');
});

// 组件卸载时执行
onUnmounted(() => {
  console.log('🔄 SearchView 组件即将卸载');
});
</script>

<style scoped>
.asset-search-page {
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

.search-tabs :deep(.ant-tabs-nav) {
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

.site-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.monospace {
  white-space: pre-wrap;
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
}

.finger-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 4px 12px;
  font-size: 13px;
}
</style>
