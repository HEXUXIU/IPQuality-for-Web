# IPQuality for Web - 一个基于Web的IP质量查询工具。
本项目是一个现代化的IP地址质量检测工具，提供地理位置、网络安全风险、网络服务可用性等全面信息。它基于AI生成，并借鉴了 [xykt/IPQuality](https://github.com/xykt/IPQuality) 的设计思路，目的是使无法使用该脚本的系统也可以部分达到该效果。原项目采用 AGPL-3.0 许可证，感谢 IPQuality 脚本的作者。

## 功能特性

- **IP质量检测**: 检测IP地址的地理位置、网络类型、风险等级等信息
- **可视化展示**: 交互式地图标记、风险评分可视化
- **多数据源**: 集成多个IP数据库和风险评估服务
- **响应式设计**: 适配各种设备屏幕尺寸
- **暗黑模式**: 支持明亮/暗黑主题切换
- **历史记录**: 自动保存查询历史
- **趣味彩蛋**: 特殊IP地址显示有趣信息

## 技术栈

- **前端框架**: Vue 3 + Vite
- **状态管理**: Vue Composition API
- **路由**: Vue Router
- **地图服务**: Leaflet + Google Maps/高德地图
- **样式**: SCSS + CSS Modules
- **部署**: Cloudflare Pages + Cloudflare Workers
- **API通信**: Axios

## 部署指南

### 部署顺序

**重要**: 必须先部署后端Worker，再部署前端Pages，因为前端需要Worker的URL。

### 后端部署 (Cloudflare Worker)

后端Worker位于独立的仓库中：[ip-quality-for-web-api](https://github.com/HEXUXIU/ip-quality-for-web-api)

请参考后端仓库的README.md文件获取详细的部署说明。

### 前端部署 (Cloudflare Pages)

1. 确保已部署后端Worker并获得Worker URL
2. 将代码推送到GitHub仓库
3. 登录Cloudflare仪表板
4. 选择"Workers & Pages" > "Create application" > "Pages"
5. 点击"Connect to Git"并选择您的仓库
6. 配置项目设置：
   - Project name: `ip-quality-frontend`
   - Production branch: `main`
7. 配置构建设置：
   - Build command: `npm run build`
   - Build output directory: `dist`
8. 添加环境变量（在"Advanced settings"中）：
   - `VITE_WORKER_URL` - 你的Worker URL（必须）
   - `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API密钥（可选，国际用户）
   - `VITE_AMAP_API_KEY` - 高德地图API密钥（可选，中国用户）
9. 点击"Save and Deploy"

### 本地开发

```bash
# 克隆项目
git clone https://github.com/HEXUXIU/IPQuality-for-Web.git
cd ip-quality-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 环境变量配置

创建 `.env` 文件并添加以下变量：

```env
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_AMAP_API_KEY=your_amap_api_key
```

参考 `.env.example` 文件获取完整示例。

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

## API集成

本项目通过Cloudflare Worker后端获取数据，Worker集成了多个IP信息服务：

- IP地理位置数据库
- 网络安全风险评估
- 代理和VPN检测
- CDN和服务器检测

所有API密钥都存储在Cloudflare环境变量中，不在前端代码中暴露。

## 功能详解

### IP查询页

- 简洁的搜索界面，类似Google首页
- 支持手动输入IP地址或自动检测本机IP
- 查询历史记录保存在本地存储中
- 支持回车键快速查询

### 结果展示页

- 卡片式布局展示不同类别的信息
- 交互式地图可视化IP位置
- 风险评分可视化图表
- ASN网络邻居信息展示
- 响应式设计适配各种屏幕

### 暗黑模式

- 支持系统主题自动检测
- 手动切换明亮/暗黑主题
- 主题状态持久化保存

### 彩蛋功能

特殊IP地址会显示有趣的彩蛋信息：
- 127.0.0.1 - 本地回环地址
- 8.8.8.8 - Google DNS
- 1.1.1.1 - Cloudflare DNS
- 其他特殊地址

## 浏览器支持

- Chrome 80+
- Firefox 74+
- Safari 13+
- Edge 80+

## 许可证

本项目采用 MIT License - 详见 [LICENSE](LICENSE) 文件

本项目主要由AI生成，并借鉴了 [xykt/IPQuality](https://github.com/xykt/IPQuality) 的设计思路，目的是使无法使用该脚本的系统也可以部分达到该效果。原项目采用 AGPL-3.0 许可证，感谢 IPQuality 脚本的作者。
