<template>
  <div class="policy-create-page">
    <a-card class="form-card" bordered>
      <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
        <a-form-item name="name" label="策略名称" required>
          <a-input v-model:value="formState.name" placeholder="请输入策略名称" />
        </a-form-item>
        <a-form-item name="description" label="策略描述">
          <a-input v-model:value="formState.description" placeholder="请输入策略描述" />
        </a-form-item>
      </a-form>

      <a-collapse ghost class="config-collapse" expand-icon-position="start">
        <a-collapse-panel key="domain" header="域名和 IP 配置">
          <a-form layout="vertical" class="domain-config-form">
            <div class="form-row">
              <a-form-item label="域名爆破类型" required>
                <a-select v-model:value="domainConfig.dictType" placeholder="请选择域名爆破类型">
                  <a-select-option value="large">大字典</a-select-option>
                  <a-select-option value="medium">中字典</a-select-option>
                  <a-select-option value="small">小字典</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="端口扫描类型" required>
                <a-select v-model:value="domainConfig.portScan" placeholder="请选择端口扫描类型">
                  <a-select-option value="top100">TOP100</a-select-option>
                  <a-select-option value="top1000">TOP1000</a-select-option>
                  <a-select-option value="all">全端口</a-select-option>
                </a-select>
              </a-form-item>
            </div>

            <div class="section-toolbar">
              <a-checkbox :checked="domainAllSelected" @change="handleDomainSelectAll">全选</a-checkbox>
            </div>

            <a-checkbox-group v-model:value="domainConfig.selected">
              <div class="checkbox-grid">
                <a-checkbox
                  v-for="item in filteredDomainFeatures"
                  :key="item.value"
                  :value="item.value"
                  class="policy-checkbox"
                >
                  {{ item.label }}
                </a-checkbox>
              </div>
            </a-checkbox-group>
          </a-form>
        </a-collapse-panel>

        <a-collapse-panel key="ip-advanced" header="IP 高级配置">
          <a-form layout="vertical" class="ip-advanced-form">
            <a-form-item label="主机超时时间" required>
              <a-select v-model:value="ipAdvancedConfig.hostTimeout">
                <a-select-option value="default">默认(900s)</a-select-option>
                <a-select-option value="600">600s</a-select-option>
                <a-select-option value="1200">1200s</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="探测报文并行度" required>
              <a-input-number v-model:value="ipAdvancedConfig.parallelism" :min="1" style="width: 200px" />
            </a-form-item>
            <a-form-item label="最少发包速率" required>
              <a-input-number v-model:value="ipAdvancedConfig.minRate" :min="1" style="width: 200px" />
            </a-form-item>
            <a-form-item label="排除端口">
              <a-input
                v-model:value="ipAdvancedConfig.excludePorts"
                placeholder="排除指定端口，不对其进行扫描，如：9100,9102,1-100"
              />
            </a-form-item>
          </a-form>
        </a-collapse-panel>

        <a-collapse-panel key="site-risk" header="站点和风险配置">
          <div class="section-toolbar">
            <a-checkbox :checked="siteAllSelected" @change="handleSiteSelectAll">全选</a-checkbox>
          </div>
          <a-checkbox-group v-model:value="siteConfig.selected">
            <div class="checkbox-grid">
              <a-checkbox
                v-for="item in filteredSiteFeatures"
                :key="item.value"
                :value="item.value"
                class="policy-checkbox"
              >
                {{ item.label }}
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </a-collapse-panel>

        <a-collapse-panel key="poc" header="PoC 配置">
          <div class="section-toolbar">
            <a-checkbox :checked="pocAllSelected" @change="handlePocSelectAll">全选</a-checkbox>
            <a-input-search
              v-model:value="pocConfig.keyword"
              placeholder="请输入关键字进行查询"
              allow-clear
              style="width: 320px"
            />
          </div>
          <a-checkbox-group v-model:value="pocConfig.selected">
            <div class="checkbox-grid two-columns">
              <a-checkbox
                v-for="item in filteredPocList"
                :key="item.value"
                :value="item.value"
                class="policy-checkbox"
              >
                {{ item.label }}
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </a-collapse-panel>

        <a-collapse-panel key="weak" header="弱口令爆破配置">
          <div class="section-toolbar">
            <a-checkbox :checked="weakAllSelected" @change="handleWeakSelectAll">全选</a-checkbox>
            <a-input-search
              v-model:value="weakConfig.keyword"
              placeholder="请输入关键字进行查询"
              allow-clear
              style="width: 320px"
            />
          </div>
          <a-checkbox-group v-model:value="weakConfig.selected">
            <div class="checkbox-grid two-columns">
              <a-checkbox
                v-for="item in filteredWeakList"
                :key="item.value"
                :value="item.value"
                class="policy-checkbox"
              >
                {{ item.label }}
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </a-collapse-panel>

        <a-collapse-panel key="asset-group" header="资产组配置">
          <a-form-item label="关联资产组" class="asset-select-item">
            <a-select
              v-model:value="assetConfig.selected"
              mode="multiple"
              placeholder="请选择关联资产组"
              :options="assetSelectOptions"
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>

      <div class="form-actions">
        <a-space>
          <a-button type="primary" @click="handleSubmit">确定</a-button>
          <a-button @click="handleCancel">取消</a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const formRef = ref();
const formState = reactive({
  name: '',
  description: ''
});

const formRules = {
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }]
};

const domainFeatureOptions = [
  { value: 'domain-brute', label: '1. 域名爆破' },
  { value: 'dns-auto', label: '2. DNS字典智能生成' },
  { value: 'history', label: '3. ARL 历史查询' },
  { value: 'domain-plugin', label: '4. 域名查询插件' },
  { value: 'port-scan', label: '5. 端口扫描' },
  { value: 'service', label: '6. 服务识别' },
  { value: 'os-detect', label: '7. 操作系统识别' },
  { value: 'ssl', label: '8. SSL 证书获取' },
  { value: 'cdn', label: '9. 跳过CDN' },
  { value: 'service-python', label: '10. 服务(python)识别' }
];

const domainConfig = reactive({
  dictType: 'large',
  portScan: 'top100',
  selected: ['domain-brute', 'dns-auto', 'history', 'domain-plugin', 'port-scan', 'cdn']
});

const filteredDomainFeatures = computed(() => domainFeatureOptions);

const domainAllSelected = computed(
  () => domainConfig.selected.length === domainFeatureOptions.length
);

const handleDomainSelectAll = (event) => {
  domainConfig.selected = event.target.checked
    ? domainFeatureOptions.map((item) => item.value)
    : [];
};

const ipAdvancedConfig = reactive({
  hostTimeout: 'default',
  parallelism: 32,
  minRate: 60,
  excludePorts: ''
});

const siteFeatureOptions = [
  { value: 'site-identify', label: '1. 站点识别' },
  { value: 'search-engine', label: '2. 搜索引擎调用' },
  { value: 'site-crawler', label: '3. 站点爬虫' },
  { value: 'site-screenshot', label: '4. 站点截图' },
  { value: 'file-leak', label: '5. 文件泄露' },
  { value: 'nuclei', label: '6. nuclei 调用' },
  { value: 'wih', label: '7. WIH 调用' }
];

const siteConfig = reactive({ selected: [] });

const filteredSiteFeatures = computed(() => siteFeatureOptions);

const siteAllSelected = computed(
  () => siteConfig.selected.length === siteFeatureOptions.length
);

const handleSiteSelectAll = (event) => {
  siteConfig.selected = event.target.checked
    ? siteFeatureOptions.map((item) => item.value)
    : [];
};

const pocOptions = [
  'Memcached 未授权访问',
  'Apache solr 未授权访问',
  'Docker Remote API 未授权访问',
  'Elasticsearch 未授权访问',
  'Headless Remote API 未授权访问',
  'Kibana 未授权访问',
  'ZooKeeper 未授权访问',
  'Hadoop YARN RCP 未授权访问漏洞',
  'Actuator API 未授权访问 (绕过WAF)',
  'apollo-adminservice 未授权访问',
  'Actuator httptrace API 未授权访问',
  'Actuator API 未授权访问',
  'Nacos 未授权访问',
  'Mongodb 未授权访问',
  'Redis 未授权访问',
  'Druid 未授权访问'
].map((label, index) => ({ value: `poc-${index + 1}`, label: `${index + 1}. ${label}` }));

const pocConfig = reactive({ keyword: '', selected: [] });

const filteredPocList = computed(() => {
  const keyword = pocConfig.keyword.trim();
  if (!keyword) return pocOptions;
  return pocOptions.filter((item) => item.label.includes(keyword));
});

const pocAllSelected = computed(() => pocConfig.selected.length === pocOptions.length);

const handlePocSelectAll = (event) => {
  pocConfig.selected = event.target.checked
    ? pocOptions.map((item) => item.value)
    : [];
};

const weakOptions = [
  'RDP 弱口令',
  'Openfire 弱口令',
  'Tomcat 弱口令',
  'SSH 弱口令',
  'Harbor 弱口令',
  'MongoDB 弱口令',
  'Exchange 邮件服务器弱口令',
  'PostgreSQL 弱口令',
  'IMAP 弱口令',
  'MySQL 弱口令',
  'Gitlab 弱口令',
  'Alibaba Druid 弱口令',
  'Nexus Repository 弱口令',
  'Grafana 弱口令'
].map((label, index) => ({ value: `weak-${index + 1}`, label: `${index + 1}. ${label}` }));

const weakConfig = reactive({ keyword: '', selected: [] });

const filteredWeakList = computed(() => {
  const keyword = weakConfig.keyword.trim();
  if (!keyword) return weakOptions;
  return weakOptions.filter((item) => item.label.includes(keyword));
});

const weakAllSelected = computed(() => weakConfig.selected.length === weakOptions.length);

const handleWeakSelectAll = (event) => {
  weakConfig.selected = event.target.checked
    ? weakOptions.map((item) => item.value)
    : [];
};

const assetSelectOptions = [
  { value: 'public', label: '互联网公开资产' },
  { value: 'internal', label: '内网重点资产' },
  { value: 'cloud', label: '云账号资产' },
  { value: 'third-party', label: '第三方托管资产' }
];

const assetConfig = reactive({ selected: [] });

const handleSubmit = () => {
  formRef.value
    ?.validate()
    .then(() => {
      // TODO: 提交新建策略
      router.push('/policy');
    })
    .catch(() => {});
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
.policy-create-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-breadcrumb {
  font-size: 14px;
}

.form-card {
  border-radius: 8px;
}

.config-collapse {
  margin-top: 16px;
  background: #fff;
}

.placeholder-text {
  margin: 0;
  color: #666;
}

.form-actions {
  margin-top: 24px;
  text-align: left;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px 24px;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
}


.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px 24px;
}

.checkbox-grid.two-columns {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.policy-checkbox {
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.policy-checkbox:hover {
  border-color: #1890ff;
  box-shadow: 0 0 6px rgba(24, 144, 255, 0.2);
}

.domain-config-form :deep(.ant-form-item) {
  margin-bottom: 0;
}

.ip-advanced-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

