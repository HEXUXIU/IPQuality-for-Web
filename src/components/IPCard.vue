<!-- 
  =========================================================
  IP 信息卡片组件
  展示单个数据源的IP信息
  =========================================================
-->

<template>
  <div class="ip-card" :class="{ 'expanded': expanded }">
    <div class="card-header" @click="toggleExpand">
      <div class="source-info">
        <h3>{{ getSourceName(source) }}</h3>
        <span class="source-tag">{{ source }}</span>
      </div>
      <div class="expand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    
    <div class="card-content" v-if="expanded">
      <div class="info-grid">
        <div class="info-item" v-for="(value, key) in data" :key="key">
          <span class="label">{{ getFieldLabel(key) }}</span>
          <span class="value">{{ formatValue(value) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'IPCard',
  props: {
    source: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  setup() {
    const expanded = ref(false)
    
    // 切换展开状态
    const toggleExpand = () => {
      expanded.value = !expanded.value
    }
    
    // 获取数据源名称
    const getSourceName = (source) => {
      const names = {
        ipinfo: 'IPInfo',
        ipapi: 'IP-API',
        ipregistry: 'IPRegistry',
        ipwhois: 'IPWhois',
        ipdata: 'IPData',
        abuseipdb: 'AbuseIPDB',
        ipqs: 'IPQualityScore',
        vpnapi: 'VPNAPI',
        ip2location: 'IP2Location'
      }
      return names[source] || source
    }
    
    // 获取字段标签
    const getFieldLabel = (key) => {
      const labels = {
        country: '国家',
        city: '城市',
        isp: 'ISP',
        org: '组织',
        asn: 'ASN',
        lat: '纬度',
        lon: '经度',
        loc: '坐标',
        timezone: '时区',
        fraud_score: '欺诈分数',
        proxy: '代理',
        vpn: 'VPN',
        tor: 'Tor',
        abuse_score: '滥用分数',
        risk_score: '风险分数'
      }
      return labels[key] || key
    }
    
    // 格式化值
    const formatValue = (value) => {
      if (value === null || value === undefined) {
        return 'N/A'
      }
      
      if (typeof value === 'boolean') {
        return value ? '是' : '否'
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      
      return String(value)
    }
    
    return {
      expanded,
      toggleExpand,
      getSourceName,
      getFieldLabel,
      formatValue
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ip-card {
  border: 1px solid $border-light;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  .dark-mode & {
    border-color: $border-dark-theme;
  }
  
  &:hover {
    border-color: $primary-color;
  }
  
  &.expanded {
    .card-header {
      border-bottom: 1px solid $border-light;
      
      .dark-mode & {
        border-color: $border-dark-theme;
      }
    }
    
    .expand-icon {
      transform: rotate(180deg);
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    cursor: pointer;
    background-color: rgba(64, 158, 255, 0.05);
    
    .dark-mode & {
      background-color: rgba(64, 158, 255, 0.1);
    }
    
    .source-info {
      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: $text-dark;
        margin-bottom: 5px;
        
        .dark-mode & {
          color: $text-dark-theme;
        }
      }
      
      .source-tag {
        font-size: 0.8rem;
        padding: 2px 8px;
        border-radius: 10px;
        background-color: $primary-color;
        color: white;
      }
    }
    
    .expand-icon {
      transition: transform 0.3s ease;
      color: $text-light;
      
      .dark-mode & {
        color: $text-light-theme;
      }
    }
  }
  
  .card-content {
    padding: 20px;
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      
      .info-item {
        display: flex;
        flex-direction: column;
        
        .label {
          font-size: 0.9rem;
          color: $text-light;
          margin-bottom: 5px;
          
          .dark-mode & {
            color: $text-light-theme;
          }
        }
        
        .value {
          font-size: 1rem;
          font-weight: 500;
          color: $text-dark;
          word-break: break-all;
          
          .dark-mode & {
            color: $text-dark-theme;
          }
        }
      }
    }
  }
}
</style>