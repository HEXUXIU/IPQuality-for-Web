/*
 * =========================================================
 * API服务封装
 * 统一封装所有API调用，提供统一的错误处理和数据处理
 * =========================================================
 */

import axios from 'axios'

// 创建axios实例
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 400:
          error.message = '请求参数错误'
          break
        case 401:
          error.message = '未授权，请重新登录'
          break
        case 403:
          error.message = '拒绝访问'
          break
        case 404:
          error.message = '请求资源不存在'
          break
        case 429:
          error.message = '请求过于频繁，请稍后再试'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        case 502:
          error.message = '网关错误'
          break
        case 503:
          error.message = '服务不可用'
          break
        default:
          error.message = `连接错误${error.response.status}`
      }
    } else if (error.request) {
      // 网络错误
      error.message = '网络连接失败，请检查网络'
    } else {
      // 其他错误
      error.message = '未知错误'
    }
    
    return Promise.reject(error)
  }
)

// IP查询API
export const ipApi = {
  // 查询IP信息
  async queryIP(ip) {
    try {
      // 从环境变量获取Worker URL
      const workerUrl = import.meta.env.VITE_WORKER_URL
      if (!workerUrl) {
        throw new Error('未配置Worker URL，请检查环境变量')
      }
      
      // 从环境变量获取API密钥
      const ipqsKey = import.meta.env.VITE_IPQS_API_KEY || null
      const abuseipdbKey = import.meta.env.VITE_ABUSEIPDB_API_KEY || null
      const ipdataKey = import.meta.env.VITE_IPDATA_API_KEY || null
      const vpnapiKey = import.meta.env.VITE_VPNAPI_API_KEY || null
      const ip2locationKey = import.meta.env.VITE_IP2LOCATION_API_KEY || null
      
      // 构建请求URL，包含API密钥参数
      let requestUrl = `${workerUrl}?ip=${ip}`
      if (ipqsKey) requestUrl += `&ipqs_key=${ipqsKey}`
      if (abuseipdbKey) requestUrl += `&abuseipdb_key=${abuseipdbKey}`
      if (ipdataKey) requestUrl += `&ipdata_key=${ipdataKey}`
      if (vpnapiKey) requestUrl += `&vpnapi_key=${vpnapiKey}`
      if (ip2locationKey) requestUrl += `&ip2location_key=${ip2locationKey}`
      
      const response = await apiClient.get(requestUrl)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 查询本机IP
  async getLocalIP() {
    try {
      const response = await apiClient.get('https://api.ipify.org?format=json')
      return response.data.ip
    } catch (error) {
      throw error
    }
  }
}

// 地图API
export const mapApi = {
  // 获取Google Maps API密钥
  getGoogleMapsApiKey() {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null
  },
  
  // 获取高德地图API密钥
  getAmapApiKey() {
    return import.meta.env.VITE_AMAP_API_KEY || null
  },
  
  // 获取IPQualityScore API密钥
  getIpqsApiKey() {
    return import.meta.env.VITE_IPQS_API_KEY || null
  },
  
  // 获取AbuseIPDB API密钥
  getAbuseipdbApiKey() {
    return import.meta.env.VITE_ABUSEIPDB_API_KEY || null
  },
  
  // 获取ipdata API密钥
  getIpdataApiKey() {
    return import.meta.env.VITE_IPDATA_API_KEY || null
  },
  
  // 获取vpnapi.io API密钥
  getVpnapiApiKey() {
    return import.meta.env.VITE_VPNAPI_API_KEY || null
  },
  
  // 获取ip2location API密钥
  getIp2locationApiKey() {
    return import.meta.env.VITE_IP2LOCATION_API_KEY || null
  }
}

export default apiClient