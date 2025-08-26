<!-- 
  =========================================================
  IP 质量查询主应用组件
  根组件，包含全局布局和主题管理
  =========================================================
-->

<template>
  <div :class="['app', { 'dark-mode': isDarkMode }]">
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  setup() {
    // 暗黑模式状态
    const isDarkMode = ref(false)

    // 检查系统主题偏好
    const checkSystemTheme = () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDarkMode.value = true
      }
    }

    // 切换暗黑模式
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      localStorage.setItem('darkMode', isDarkMode.value)
    }

    // 初始化主题
    const initTheme = () => {
      const savedTheme = localStorage.getItem('darkMode')
      if (savedTheme !== null) {
        isDarkMode.value = savedTheme === 'true'
      } else {
        checkSystemTheme()
      }
    }

    // 监听系统主题变化
    const handleSystemThemeChange = (e) => {
      if (localStorage.getItem('darkMode') === null) {
        isDarkMode.value = e.matches
      }
    }

    let mediaQuery
    onMounted(() => {
      initTheme()
      
      // 监听系统主题变化
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    })

    onUnmounted(() => {
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      }
    })

    return {
      isDarkMode,
      toggleDarkMode
    }
  }
}
</script>

<style lang="scss">
@import './styles/variables.scss';

.app {
  min-height: 100vh;
  background-color: $background-light;
  color: $text-dark;
  transition: background-color 0.3s ease, color 0.3s ease;

  &.dark-mode {
    background-color: $background-dark;
    color: $text-light;
  }
}
</style>