<!-- 
  =========================================================
  地图可视化组件
  集成Leaflet地图，支持国内外不同地图服务
  =========================================================
-->

<template>
  <div class="map-visualization">
    <div class="map-header">
      <h3>位置地图</h3>
      <div class="map-controls">
        <button 
          class="control-btn" 
          :class="{ 'active': mapType === 'openstreetmap' }"
          @click="switchMap('openstreetmap')"
        >
          OpenStreetMap
        </button>
        <button 
          class="control-btn" 
          :class="{ 'active': mapType === 'google' }"
          @click="switchMap('google')"
          :disabled="!hasGoogleKey"
        >
          Google Maps
        </button>
        <button 
          class="control-btn" 
          :class="{ 'active': mapType === 'amap' }"
          @click="switchMap('amap')"
          :disabled="!hasAmapKey"
        >
          高德地图
        </button>
      </div>
    </div>
    
    <div id="map-container" ref="mapContainer"></div>
    
    <div class="map-info" v-if="locationInfo">
      <div class="info-item">
        <span class="label">坐标:</span>
        <span class="value">{{ locationInfo.lat }}, {{ locationInfo.lon }}</span>
      </div>
      <div class="info-item">
        <span class="label">位置:</span>
        <span class="value">{{ locationInfo.address }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'MapVisualization',
  props: {
    location: {
      type: Object,
      required: true,
      default: () => ({ lat: 0, lon: 0, address: '' })
    },
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const mapContainer = ref(null)
    const mapInstance = ref(null)
    const mapType = ref('openstreetmap')
    let currentMarker = null
    
    // 检查API密钥
    const hasGoogleKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const hasAmapKey = !!import.meta.env.VITE_AMAP_API_KEY
    
    // 位置信息
    const locationInfo = ref(null)
    
    // 初始化地图
    const initMap = () => {
      if (!mapContainer.value) return
      
      // 清除之前的地图实例
      if (mapInstance.value) {
        mapInstance.value.remove()
      }
      
      // 创建地图实例
      mapInstance.value = L.map(mapContainer.value).setView(
        [props.location.lat || 0, props.location.lon || 0], 
        10
      )
      
      // 添加默认图层
      updateMapLayer()
      
      // 添加标记
      updateMarker()
      
      // 更新位置信息
      locationInfo.value = {
        lat: props.location.lat || 0,
        lon: props.location.lon || 0,
        address: props.location.address || '未知位置'
      }
    }
    
    // 更新地图图层
    const updateMapLayer = () => {
      if (!mapInstance.value) return
      
      // 清除所有图层
      mapInstance.value.eachLayer(layer => {
        mapInstance.value.removeLayer(layer)
      })
      
      // 根据类型添加图层
      let tileLayer
      switch (mapType.value) {
        case 'google':
          if (hasGoogleKey) {
            tileLayer = L.tileLayer(`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`, {
              attribution: '© Google Maps'
            })
          } else {
            // 如果没有Google Key，回退到OpenStreetMap
            mapType.value = 'openstreetmap'
            updateMapLayer()
            return
          }
          break
          
        case 'amap':
          if (hasAmapKey) {
            tileLayer = L.tileLayer(`https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}&key=${import.meta.env.VITE_AMAP_API_KEY}`, {
              attribution: '© 高德地图'
            })
          } else {
            // 如果没有高德Key，回退到OpenStreetMap
            mapType.value = 'openstreetmap'
            updateMapLayer()
            return
          }
          break
          
        default: // openstreetmap
          const tileUrl = props.isDarkMode 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          
          tileLayer = L.tileLayer(tileUrl, {
            attribution: '© <a href="https://www.openstreammap.org/copyright">OpenStreetMap</a> contributors'
          })
      }
      
      tileLayer.addTo(mapInstance.value)
    }
    
    // 更新标记
    const updateMarker = () => {
      if (!mapInstance.value || !props.location.lat || !props.location.lon) return
      
      // 移除旧标记
      if (currentMarker) {
        mapInstance.value.removeLayer(currentMarker)
      }
      
      // 添加新标记
      currentMarker = L.marker([props.location.lat, props.location.lon])
        .addTo(mapInstance.value)
        .bindPopup(props.location.address || '未知位置')
        .openPopup()
      
      // 居中地图
      mapInstance.value.setView([props.location.lat, props.location.lon], 10)
    }
    
    // 切换地图类型
    const switchMap = (type) => {
      mapType.value = type
      updateMapLayer()
    }
    
    // 监听位置变化
    watch(() => props.location, () => {
      if (mapInstance.value) {
        updateMarker()
        locationInfo.value = {
          lat: props.location.lat || 0,
          lon: props.location.lon || 0,
          address: props.location.address || '未知位置'
        }
      }
    }, { deep: true })
    
    // 监听主题变化
    watch(() => props.isDarkMode, () => {
      if (mapType.value === 'openstreetmap') {
        updateMapLayer()
      }
    })
    
    // 组件挂载时初始化地图
    onMounted(() => {
      initMap()
    })
    
    // 组件卸载时清理地图
    onUnmounted(() => {
      if (mapInstance.value) {
        mapInstance.value.remove()
      }
    })
    
    return {
      mapContainer,
      mapType,
      hasGoogleKey,
      hasAmapKey,
      locationInfo,
      switchMap
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.map-visualization {
  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
    
    h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: $text-dark;
      
      .dark-mode & {
        color: $text-dark-theme;
      }
    }
    
    .map-controls {
      display: flex;
      gap: 10px;
      
      .control-btn {
        padding: 8px 15px;
        border-radius: 6px;
        font-size: 0.9rem;
        background-color: #f5f7fa;
        color: $text-dark;
        transition: all 0.3s ease;
        
        .dark-mode & {
          background-color: #2d2d2d;
          color: $text-light-theme;
        }
        
        &:hover:not(:disabled) {
          background-color: $primary-color;
          color: white;
        }
        
        &.active {
          background-color: $primary-color;
          color: white;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
  
  #map-container {
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: $shadow-light;
    
    .dark-mode & {
      box-shadow: $shadow-dark;
    }
  }
  
  .map-info {
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 15px;
    
    .dark-mode & {
      background-color: #2d2d2d;
    }
    
    .info-item {
      display: flex;
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        font-weight: 600;
        margin-right: 10px;
        color: $text-dark;
        min-width: 50px;
        
        .dark-mode & {
          color: $text-dark-theme;
        }
      }
      
      .value {
        color: $text-light;
        
        .dark-mode & {
          color: $text-light-theme;
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    .map-header {
      flex-direction: column;
      align-items: flex-start;
      
      .map-controls {
        width: 100%;
        justify-content: center;
      }
    }
    
    #map-container {
      height: 300px;
    }
  }
}
</style>