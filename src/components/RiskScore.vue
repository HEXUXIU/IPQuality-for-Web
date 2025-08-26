<!-- 
  =========================================================
  风险评分组件
  可视化展示IP风险评分
  =========================================================
-->

<template>
  <div class="risk-score">
    <div class="score-header">
      <h3>风险评估</h3>
      <span class="score-value">{{ score }}%</span>
    </div>
    
    <div class="score-visualization">
      <div class="score-bar">
        <div 
          class="score-fill" 
          :class="riskLevelClass"
          :style="{ width: score + '%' }"
        ></div>
      </div>
      
      <div class="risk-level">
        <span 
          v-for="level in riskLevels" 
          :key="level.name"
          class="level-indicator"
          :class="{ active: currentRiskLevel === level.name }"
        >
          {{ level.label }}
        </span>
      </div>
    </div>
    
    <div class="risk-factors" v-if="factors.length > 0">
      <h4>风险因子</h4>
      <div class="factors-grid">
        <div 
          v-for="factor in factors" 
          :key="factor.name"
          class="factor-item"
          :class="{ 'active': factor.value }"
        >
          <div class="factor-icon">
            <svg v-if="factor.value" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="factor-name">{{ factor.label }}</span>
          <span class="factor-value">{{ factor.value ? '是' : '否' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'RiskScore',
  props: {
    score: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100
    },
    factors: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 风险等级
    const riskLevels = [
      { name: 'low', label: '低风险', min: 0, max: 20 },
      { name: 'medium', label: '中等', min: 21, max: 50 },
      { name: 'high', label: '高风险', min: 51, max: 80 },
      { name: 'very-high', label: '极高', min: 81, max: 100 }
    ]
    
    // 当前风险等级
    const currentRiskLevel = computed(() => {
      const level = riskLevels.find(l => props.score >= l.min && props.score <= l.max)
      return level ? level.name : 'low'
    })
    
    // 风险等级CSS类
    const riskLevelClass = computed(() => {
      return `risk-${currentRiskLevel.value}`
    })
    
    return {
      riskLevels,
      currentRiskLevel,
      riskLevelClass
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.risk-score {
  .score-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: $text-dark;
      
      .dark-mode & {
        color: $text-dark-theme;
      }
    }
    
    .score-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: $primary-color;
    }
  }
  
  .score-visualization {
    margin-bottom: 25px;
    
    .score-bar {
      height: 12px;
      background-color: #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 15px;
      
      .dark-mode & {
        background-color: #333;
      }
      
      .score-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 0.5s ease, background-color 0.3s ease;
        
        &.risk-low {
          background: linear-gradient(90deg, #67c23a, #95d475);
        }
        
        &.risk-medium {
          background: linear-gradient(90deg, #e6a23c, #eebe77);
        }
        
        &.risk-high {
          background: linear-gradient(90deg, #f56c6c, #f89898);
        }
        
        &.risk-very-high {
          background: linear-gradient(90deg, #d4380d, #f36a3f);
        }
      }
    }
    
    .risk-level {
      display: flex;
      justify-content: space-between;
      
      .level-indicator {
        font-size: 0.8rem;
        color: $text-light;
        
        .dark-mode & {
          color: $text-light-theme;
        }
        
        &.active {
          font-weight: 600;
          color: $text-dark;
          
          .dark-mode & {
            color: $text-dark-theme;
          }
        }
      }
    }
  }
  
  .risk-factors {
    h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 15px;
      color: $text-dark;
      
      .dark-mode & {
        color: $text-dark-theme;
      }
    }
    
    .factors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
      
      .factor-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px 10px;
        border-radius: 8px;
        background-color: #f5f7fa;
        transition: all 0.3s ease;
        
        .dark-mode & {
          background-color: #2d2d2d;
        }
        
        &.active {
          background-color: rgba(245, 108, 108, 0.1);
          border: 1px solid rgba(245, 108, 108, 0.3);
          
          .dark-mode & {
            background-color: rgba(245, 108, 108, 0.2);
            border-color: rgba(245, 108, 108, 0.5);
          }
          
          .factor-icon {
            color: $error-color;
          }
        }
        
        .factor-icon {
          margin-bottom: 8px;
          color: $text-light;
          
          .dark-mode & {
            color: $text-light-theme;
          }
        }
        
        .factor-name {
          font-size: 0.9rem;
          margin-bottom: 5px;
          color: $text-dark;
          
          .dark-mode & {
            color: $text-dark-theme;
          }
        }
        
        .factor-value {
          font-size: 0.8rem;
          font-weight: 500;
          color: $text-light;
          
          .dark-mode & {
            color: $text-light-theme;
          }
        }
      }
    }
  }
}
</style>