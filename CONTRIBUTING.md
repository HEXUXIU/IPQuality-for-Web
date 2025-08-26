# 贡献指南

感谢您考虑为 IPQuality for Web 贡献代码！我们欢迎各种形式的贡献，包括但不限于：

- 报告 bug
- 提交修复
- 添加新功能
- 改进文档
- 提出改进建议

## 关于项目

本项目主要由AI生成，并借鉴了 [xykt/IPQuality](https://github.com/xykt/IPQuality) 的设计思路，目的是使无法使用该脚本的系统也可以部分达到该效果。原项目采用 AGPL-3.0 许可证，感谢 IPQuality 脚本的作者。

## 开发环境设置

1. Fork 本仓库
2. 克隆您的 Fork：
   ```bash
   git clone https://github.com/your-username/ip-quality-frontend.git
   cd ip-quality-frontend
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 创建特性分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 开发流程

1. 确保您在正确的分支上工作
2. 进行代码修改
3. 添加或更新测试（如适用）
4. 确保代码符合项目规范
5. 提交更改：
   ```bash
   git commit -m "描述您的更改"
   ```
6. 推送到您的 Fork：
   ```bash
   git push origin feature/your-feature-name
   ```
7. 创建 Pull Request

## 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 遵循 Vue.js 风格指南
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 编写清晰、有意义的提交信息

## 提交 Pull Request

1. 确保您的 PR 针对 `main` 分支
2. 提供清晰的 PR 描述，说明更改的目的和实现方式
3. 如果 PR 解决了某个 Issue，请在描述中引用该 Issue
4. 确保所有测试通过
5. 保持 PR 小而专注，只解决一个问题

## 报告 Bug

在报告 bug 时，请提供以下信息：

1. 清晰的 bug 描述
2. 重现步骤
3. 预期行为
4. 实际行为
5. 环境信息（浏览器、操作系统等）
6. 相关截图（如适用）

## 提出功能建议

我们欢迎新功能建议！在提交功能建议时，请：

1. 清晰描述您想要的功能
2. 解释该功能解决的问题或带来的价值
3. 提供可能的实现方案（如适用）

## 许可证

通过贡献代码，您同意您的贡献将根据项目的 MIT 许可证进行许可。