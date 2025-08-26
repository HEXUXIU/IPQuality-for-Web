<!-- 
  =========================================================
  结果视图组件
  展示IP查询结果，包含地理位置、风险评估等信息
  =========================================================
-->

<template>
  <div class="result">
    <!-- 返回按钮 -->
    <div class="back-btn" @click="goBack">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      返回
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading">
        <div class="spinner"></div>
        <p>正在查询IP信息...</p>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error">
        <h3>查询失败</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="retry">重试</button>
      </div>
    </div>
    
    <!-- 彩蛋 -->
    <div v-else-if="easterEgg" class="easter-egg">
      <div class="card">
        <h2>🎉 彩蛋时间！</h2>
        <div class="egg-content">
          <h3>{{ easterEgg.title }}</h3>
          <p>{{ easterEgg.message }}</p>
          <div class="egg-icon">{{ easterEgg.icon }}</div>
        </div>
      </div>
    </div>
    
    <!-- 查询结果 -->
    <div v-else-if="ipData" class="result-content">
      <!-- IP基本信息 -->
      <div class="card ip-info">
        <h2>IP信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">IP地址</span>
            <span class="value">{{ ip }}</span>
          </div>
          <div class="info-item">
            <span class="label">地理位置</span>
            <span class="value">{{ locationText }}</span>
          </div>
          <div class="info-item">
            <span class="label">ISP</span>
            <span class="value">{{ ipData.isp || '未知' }}</span>
          </div>
          <div class="info-item">
            <span class="label">ASN</span>
            <span class="value">{{ ipData.asn || '未知' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 风险评估 -->
      <div class="card risk-assessment" v-if="riskData">
        <h2>风险评估</h2>
        <div class="risk-score">
          <div class="score-display">
            <span class="score">{{ riskScore }}</span>
            <span class="score-label">{{ riskLevel }}</span>
          </div>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: riskScore + '%' }"></div>
          </div>
        </div>
        <div class="risk-factors">
          <div class="factor" v-for="(value, key) in riskFactors" :key="key">
            <span class="factor-label">{{ getFactorLabel(key) }}</span>
            <span class="factor-value" :class="{ 'risk': value }">{{ value ? '是' : '否' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 地图可视化 -->
      <div class="card map-container">
        <h2>位置地图</h2>
        <div id="map" ref="mapRef"></div>
      </div>
      
      <!-- ASN邻居 -->
      <div class="card asn-neighbors" v-if="asnNeighbors.length > 0">
        <h2>ASN网络邻居</h2>
        <div class="neighbors-grid">
          <div v-for="neighbor in asnNeighbors" :key="neighbor.name" class="neighbor-item">
            <div class="neighbor-icon">{{ neighbor.icon }}</div>
            <div class="neighbor-name">{{ neighbor.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'ResultView',
  props: {
    ip: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    
    // 注入全局暗黑模式状态
    const isDarkMode = inject('isDarkMode', ref(false))
    
    // 响应式数据
    const loading = ref(true)
    const error = ref(null)
    const ipData = ref(null)
    const riskData = ref(null)
    const mapRef = ref(null)
    let mapInstance = null
    
    // 彩蛋数据
    const easterEgg = ref(null)
    const easterEggs = {
      '127.0.0.1': {
        title: '本地回环地址',
        message: '这是您的本地计算机地址，用于本地网络通信测试。',
        icon: '🏠'
      },
      '8.8.8.8': {
        title: 'Google DNS',
        message: '这是Google提供的公共DNS服务，全球最常用的DNS服务器之一。',
        icon: '🔍'
      },
      '1.1.1.1': {
        title: 'Cloudflare DNS',
        message: '这是Cloudflare提供的快速、安全的公共DNS服务。',
        icon: '☁️'
      },
      '0.0.0.0': {
        title: '无效地址',
        message: '这是一个特殊的IP地址，通常用于表示无效或未知的地址。',
        icon: '❓'
      }
    }
    
    // ASN邻居数据（示例）
    const asnNeighbors = ref([
      { name: 'Google', icon: '🔍' },
      { name: 'Cloudflare', icon: '☁️' },
      { name: 'Amazon', icon: '📦' },
      { name: 'Microsoft', icon: '💻' }
    ])
    
    // 返回首页
    const goBack = () => {
      router.push({ name: 'home' })
    }
    
    // 重试查询
    const retry = () => {
      fetchData()
    }
    
    // 获取数据
    const fetchData = async () => {
      loading.value = true
      error.value = null
      ipData.value = null
      riskData.value = null
      easterEgg.value = null
      
      // 检查是否为彩蛋IP
      if (easterEggs[props.ip]) {
        easterEgg.value = easterEggs[props.ip]
        loading.value = false
        return
      }
      
      try {
        // 从环境变量获取Worker URL
        const workerUrl = import.meta.env.VITE_WORKER_URL
        if (!workerUrl) {
          throw new Error('未配置Worker URL，请检查环境变量')
        }
        
        // 调用Worker API
        const response = await axios.get(`${workerUrl}?ip=${props.ip}`)
        const data = response.data
        
        // 处理数据
        ipData.value = processIPData(data.results)
        riskData.value = processRiskData(data.results)
        
        // 初始化地图
        await initMap()
      } catch (err) {
        console.error('查询失败:', err)
        error.value = err.message || '查询失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }
    
    // 处理IP数据
    const processIPData = (results) => {
      // 查找第一个有效的数据源
      for (const [source, result] of Object.entries(results)) {
        if (result.standardized && Object.keys(result.standardized).length > 0) {
          return {
            ...result.standardized,
            source
          }
        }
      }
      
      return {}
    }
    
    // 处理风险数据
    const processRiskData = (results) => {
      const riskData = {}
      
      // 收集所有风险因子
      for (const [source, result] of Object.entries(results)) {
        if (result.standardized) {
          const standardized = result.standardized
          if (standardized.fraud_score !== undefined) {
            riskData.fraud_score = standardized.fraud_score
          }
          if (standardized.proxy !== undefined) {
            riskData.proxy = riskData.proxy || standardized.proxy
          }
          if (standardized.vpn !== undefined) {
            riskData.vpn = riskData.vpn || standardized.vpn
          }
          if (standardized.tor !== undefined) {
            riskData.tor = riskData.tor || standardized.tor
          }
        }
      }
      
      return riskData
    }
    
    // 初始化地图
    const initMap = async () => {
      if (!mapRef.value || !ipData.value) return
      
      try {
        // 清除之前的地图实例
        if (mapInstance) {
          mapInstance.remove()
        }
        
        // 设置默认坐标（如果数据中没有坐标）
        let lat = ipData.value.lat || 0
        let lon = ipData.value.lon || 0
        
        // 如果有loc字段，解析坐标
        if (ipData.value.loc) {
          const coords = ipData.value.loc.split(',')
          if (coords.length === 2) {
            lat = parseFloat(coords[0])
            lon = parseFloat(coords[1])
          }
        }
        
        // 创建地图
        mapInstance = L.map(mapRef.value).setView([lat, lon], 10)
        
        // 根据主题选择地图图层
        let tileLayer
        if (isDarkMode.value) {
          // 暗黑模式使用暗色地图
          tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        } else {
          // 浅色模式使用标准地图
          tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        }
        
        tileLayer.addTo(mapInstance)
        
        // 添加标记
        L.marker([lat, lon]).addTo(mapInstance)
          .bindPopup(`IP: ${props.ip}<br>位置: ${locationText.value}`)
          .openPopup()
      } catch (err) {
        console.error('地图初始化失败:', err)
      }
    }
    
    // 计算风险分数
    const riskScore = computed(() => {
      if (!riskData.value) return 0
      
      // 如果有欺诈分数，直接使用
      if (riskData.value.fraud_score !== undefined) {
        return Math.min(100, Math.max(0, riskData.value.fraud_score))
      }
      
      // 否则根据风险因子计算
      let score = 0
      if (riskData.value.proxy) score += 30
      if (riskData.value.vpn) score += 25
      if (riskData.value.tor) score += 45
      
      return Math.min(100, score)
    })
    
    // 风险等级
    const riskLevel = computed(() => {
      const score = riskScore.value
      if (score < 20) return '低风险'
      if (score < 50) return '中等风险'
      if (score < 80) return '高风险'
      return '极高风险'
    })
    
    // 风险因子
    const riskFactors = computed(() => {
      if (!riskData.value) return {}
      
      return {
        proxy: riskData.value.proxy,
        vpn: riskData.value.vpn,
        tor: riskData.value.tor
      }
    })
    
    // 风险因子标签
    const getFactorLabel = (key) => {
      const labels = {
        proxy: '代理服务器',
        vpn: 'VPN',
        tor: 'Tor网络'
      }
      return labels[key] || key
    }
    
    // 位置文本
    const locationText = computed(() => {
      if (!ipData.value) return '未知位置'
      
      const parts = []
      if (ipData.value.city) parts.push(ipData.value.city)
      if (ipData.value.country) parts.push(ipData.value.country)
      
      return parts.length > 0 ? parts.join(', ') : '未知位置'
    })
    
    // 监听主题变化
    const handleThemeChange = () => {
      if (mapInstance) {
        // 重新初始化地图以应用主题
        initMap()
      }
    }
    
    // 组件挂载时获取数据
    onMounted(() => {
      fetchData()
      
      // 监听主题变化
      const unwatch = watch(isDarkMode, handleThemeChange)
      
      // 清理函数
      onUnmounted(() => {
        if (mapInstance) {
          mapInstance.remove()
        }
        unwatch()
      })
    })
    
    return {
      loading,
      error,
      ipData,
      riskData,
      mapRef,
      easterEgg,
      asnNeighbors,
      riskScore,
      riskLevel,
      riskFactors,
      locationText,
      goBack,
      retry,
      getFactorLabel
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.result {
  min-height: 100vh;
  padding: 20px;
  
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-bottom: 20px;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      
      .dark-mode & {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
    
    svg {
      color: $text-dark;
      
      .dark-mode & {
        color: $text-light-theme;
      }
    }
  }
  
  .loading-container,
  .error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    
    .loading {
      flex-direction: column;
      gap: 20px;
      
      p {
        font-size: 1.1rem;
        color: $text-light;
        
        .dark-mode & {
          color: $text-light-theme;
        }
      }
    }
  }
  
  .easter-egg {
    .egg-content {
      text-align: center;
      padding: 20px 0;
      
      h3 {
        font-size: 1.5rem;
        margin-bottom: 10px;
        color: $primary-color;
      }
      
      p {
        font-size: 1.1rem;
        margin-bottom: 20px;
        color: $text-light;
        
        .dark-mode & {
          color: $text-light-theme;
        }
      }
      
      .egg-icon {
        font-size: 3rem;
      }
    }
  }
  
  .result-content {
    max-width: 1200px;
    margin: 0 auto;
    
    .ip-info {
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        
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
            font-size: 1.1rem;
            font-weight: 500;
            color: $text-dark;
            
            .dark-mode & {
              color: $text-dark-theme;
            }
          }
        }
      }
    }
    
    .risk-assessment {
      .risk-score {
        margin-bottom: 30px;
        
        .score-display {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          
          .score {
            font-size: 3rem;
            font-weight: 700;
            color: $primary-color;
          }
          
          .score-label {
            font-size: 1.2rem;
            font-weight: 600;
          }
        }
        
        .score-bar {
          height: 12px;
          background-color: #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
          
          .dark-mode & {
            background-color: #333;
          }
          
          .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #67c23a, #e6a23c, #f56c6c);
            border-radius: 6px;
            transition: width 0.5s ease;
          }
        }
      }
      
      .risk-factors {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        
        .factor {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border-radius: 6px;
          background-color: #f5f7fa;
          
          .dark-mode & {
            background-color: #2d2d2d;
          }
          
          .factor-label {
            color: $text-light;
            
            .dark-mode & {
              color: $text-light-theme;
            }
          }
          
          .factor-value {
            font-weight: 600;
            
            &.risk {
              color: $error-color;
            }
          }
        }
      }
    }
    
    .map-container {
      #map {
        height: 400px;
        border-radius: 8px;
        overflow: hidden;
        margin-top: 15px;
      }
    }
    
    .asn-neighbors {
      .neighbors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 20px;
        
        .neighbor-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          border-radius: 8px;
          background-color: #f5f7fa;
          transition: transform 0.3s ease;
          
          .dark-mode & {
            background-color: #2d2d2d;
          }
          
          &:hover {
            transform: translateY(-5px);
          }
          
          .neighbor-icon {
            font-size: 2rem;
            margin-bottom: 10px;
          }
          
          .neighbor-name {
            font-weight: 500;
            text-align: center;
            color: $text-dark;
            
            .dark-mode & {
              color: $text-dark-theme;
            }
          }
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    padding: 15px;
    
    .result-content {
      .risk-assessment {
        .risk-score {
          .score-display {
            .score {
              font-size: 2rem;
            }
          }
        }
      }
      
      .map-container {
        #map {
          height: 300px;
        }
      }
    }
  }
}
</style>