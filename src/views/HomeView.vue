<!-- 
  =========================================================
  首页视图组件
  提供IP查询功能和历史记录展示
  =========================================================
-->

<template>
  <div class="home">
    <div class="search-container">
      <div class="logo">
        <h1>IP质量查询</h1>
        <p>专业IP地址质量检测工具</p>
      </div>
      
      <div class="search-box">
        <form @submit.prevent="handleSearch">
          <div class="input-group">
            <input
              v-model="ipInput"
              type="text"
              placeholder="输入IP地址或留空查询本机IP"
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button type="submit" class="search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
      
      <div class="theme-toggle" @click="toggleDarkMode">
        <svg v-if="isDarkMode" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.34 17.66L4.93 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19.07 4.93L17.66 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    
    <div class="history-section" v-if="history.length > 0">
      <h2>查询历史</h2>
      <div class="history-list">
        <div
          v-for="(item, index) in history"
          :key="index"
          class="history-item"
          @click="searchIP(item.ip)"
        >
          <span class="ip">{{ item.ip }}</span>
          <span class="time">{{ formatTime(item.time) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const ipInput = ref('')
    const history = ref([])
    
    // 注入全局暗黑模式状态和切换函数
    const isDarkMode = inject('isDarkMode', ref(false))
    const toggleDarkMode = inject('toggleDarkMode', () => {})
    
    // 获取本机IP
    const getLocalIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        return data.ip
      } catch (error) {
        console.error('获取本机IP失败:', error)
        return ''
      }
    }
    
    // 处理搜索
    const handleSearch = async () => {
      let ip = ipInput.value.trim()
      
      // 如果没有输入IP，获取本机IP
      if (!ip) {
        ip = await getLocalIP()
        if (!ip) {
          alert('无法获取本机IP，请手动输入IP地址')
          return
        }
      }
      
      searchIP(ip)
    }
    
    // 搜索IP
    const searchIP = (ip) => {
      // 验证IP格式
      if (!isValidIP(ip)) {
        alert('请输入有效的IP地址')
        return
      }
      
      // 添加到历史记录
      addToHistory(ip)
      
      // 跳转到结果页
      router.push({ name: 'result', query: { ip } })
    }
    
    // 验证IP地址格式
    const isValidIP = (ip) => {
      const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
      const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/
      return ipv4Pattern.test(ip) || ipv6Pattern.test(ip)
    }
    
    // 添加到历史记录
    const addToHistory = (ip) => {
      const historyItem = {
        ip,
        time: Date.now()
      }
      
      // 检查是否已存在
      const existingIndex = history.value.findIndex(item => item.ip === ip)
      if (existingIndex !== -1) {
        // 移除已存在的项
        history.value.splice(existingIndex, 1)
      }
      
      // 添加到开头
      history.value.unshift(historyItem)
      
      // 限制历史记录数量
      if (history.value.length > 10) {
        history.value.pop()
      }
      
      // 保存到本地存储
      localStorage.setItem('ipHistory', JSON.stringify(history.value))
    }
    
    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      // 如果是今天，显示时间
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      
      // 如果是昨天，显示"昨天"
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return '昨天'
      }
      
      // 否则显示日期
      return date.toLocaleDateString('zh-CN')
    }
    
    // 加载历史记录
    const loadHistory = () => {
      const savedHistory = localStorage.getItem('ipHistory')
      if (savedHistory) {
        try {
          history.value = JSON.parse(savedHistory)
        } catch (error) {
          console.error('解析历史记录失败:', error)
          history.value = []
        }
      }
    }
    
    onMounted(() => {
      loadHistory()
    })
    
    return {
      ipInput,
      history,
      isDarkMode,
      toggleDarkMode,
      handleSearch,
      searchIP,
      formatTime
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  
  .search-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    position: relative;
    
    .logo {
      text-align: center;
      margin-bottom: 40px;
      
      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #409eff, #66b1ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      p {
        font-size: 1.1rem;
        color: $text-light;
        
        .dark-mode & {
          color: $text-light-theme;
        }
      }
    }
    
    .search-box {
      width: 100%;
      margin-bottom: 30px;
      
      .input-group {
        display: flex;
        border-radius: 50px;
        overflow: hidden;
        box-shadow: $shadow-light;
        
        .dark-mode & {
          box-shadow: $shadow-dark;
        }
        
        .search-input {
          flex: 1;
          padding: 15px 20px;
          font-size: 1rem;
          border: none;
          background-color: $background-light;
          
          .dark-mode & {
            background-color: $background-dark;
            color: $text-dark-theme;
          }
          
          &::placeholder {
            color: $text-placeholder;
          }
        }
        
        .search-btn {
          padding: 0 25px;
          background-color: #409eff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
          
          &:hover {
            background-color: #66b1ff;
          }
        }
      }
    }
    
    .theme-toggle {
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
      padding: 10px;
      border-radius: 50%;
      transition: background-color 0.3s ease;
      
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
  }
  
  .history-section {
    max-width: 600px;
    margin: 0 auto 40px;
    width: 100%;
    
    h2 {
      font-size: 1.3rem;
      margin-bottom: 15px;
      font-weight: 600;
    }
    
    .history-list {
      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        
        &:hover {
          background-color: rgba(64, 158, 255, 0.1);
          
          .dark-mode & {
            background-color: rgba(64, 158, 255, 0.2);
          }
        }
        
        .ip {
          font-weight: 500;
          color: $text-dark;
          
          .dark-mode & {
            color: $text-dark-theme;
          }
        }
        
        .time {
          font-size: 0.9rem;
          color: $text-light;
          
          .dark-mode & {
            color: $text-light-theme;
          }
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    .search-container {
      .logo {
        h1 {
          font-size: 2rem;
        }
      }
      
      .theme-toggle {
        top: 15px;
        right: 15px;
      }
    }
  }
}
</style>