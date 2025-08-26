# IP质量查询系统 - iFlow上下文

## 项目概述

这是一个现代化的IP地址质量检测工具，基于Vue 3 + Vite构建。项目提供地理位置、网络安全风险、网络服务可用性等全面信息的查询功能。

### 主要功能特性

- IP质量检测：检测IP地址的地理位置、网络类型、风险等级等信息
- 可视化展示：交互式地图标记、风险评分可视化
- 多数据源：集成多个IP数据库和风险评估服务
- 响应式设计：适配各种设备屏幕尺寸
- 暗黑模式：支持明亮/暗黑主题切换
- 历史记录：自动保存查询历史
- 彩蛋功能：特殊IP地址显示有趣信息

### 技术栈

- 前端框架：Vue 3 + Vite
- 状态管理：Vue Composition API
- 路由：Vue Router
- 地图服务：Leaflet
- 样式：SCSS
- 部署：Cloudflare Pages
- API通信：Axios

## 项目结构

```
ip-quality-frontend/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 静态资源文件
│   ├── components/        # Vue组件
│   ├── views/             # 页面视图
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   ├── styles/            # 全局样式
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── .env.example           # 环境变量示例
├── index.html             # HTML模板
├── vite.config.js         # Vite配置
└── package.json           # 项目依赖
```

## 构建和运行

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 默认访问地址: http://localhost:3000
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 部署到Cloudflare Pages

1. 将代码推送到GitHub仓库
2. 登录Cloudflare仪表板
3. 选择"Workers & Pages" > "Create application" > "Pages"
4. 点击"Connect to Git"并选择您的仓库
5. 配置项目设置：
   - Project name: `ip-quality-check`
   - Production branch: `main`
6. 配置构建设置：
   - Build command: `npm run build`
   - Build output directory: `dist`
7. 添加环境变量（在"Advanced settings"中）：
   - `VITE_WORKER_URL` - 您的Worker URL
   - `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API密钥（可选）
   - `VITE_AMAP_API_KEY` - 高德地图API密钥（可选）

## 开发约定

### 代码规范

- 使用ESLint和Prettier保持代码风格一致
- 遵循Vue.js风格指南
- 组件命名使用PascalCase
- 文件命名使用kebab-case

### 目录说明

- `src/assets/` - 静态资源（图片、字体等）
- `src/components/` - 可复用的Vue组件
- `src/views/` - 页面级组件
- `src/router/` - 路由配置
- `src/store/` - 状态管理
- `src/utils/` - 工具函数
- `src/styles/` - 全局样式文件

### 样式管理

项目使用SCSS作为CSS预处理器，定义了以下全局样式变量：

- 颜色主题变量（主色、成功色、警告色、错误色等）
- 浅色和深色主题的颜色值
- 响应式断点
- 阴影样式

### 路由配置

项目使用Vue Router进行路由管理，包含以下路由：

- `/` - 首页，提供IP查询功能
- `/result` - 结果页，展示IP查询结果
- 404页面重定向到首页

### 状态管理

项目使用Vue 3 Composition API进行状态管理，主要状态包括：

- 暗黑模式状态
- IP查询历史记录

### API集成

项目通过Cloudflare Worker后端获取数据，Worker集成了多个IP信息服务：

- IP地理位置数据库
- 网络安全风险评估
- 代理和VPN检测
- CDN和服务器检测

所有API密钥都存储在Cloudflare环境变量中，不在前端代码中暴露。

## 环境变量配置

创建 `.env` 文件并添加以下变量：

```env
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_AMAP_API_KEY=your_amap_api_key
```

参考 `.env.example` 文件获取完整示例。