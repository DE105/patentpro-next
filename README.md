<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PatentPro Next

现代化专利协同工作站前端（Vite + React + TypeScript）。

## 本地运行

**前置条件：** Node.js

1. 安装依赖：
   `npm install`
2. 在 `.env.local` 中设置 `GEMINI_API_KEY`
3. 启动开发环境：
   `npm run dev`

## 目录结构

```
src/
  app/                 应用入口与布局
    App.tsx
    layout/            通用布局组件
      Sidebar.tsx
  features/            业务功能域
    dashboard/
      Dashboard.tsx
    drafting/
      Drafting.tsx
    oa-agent/
      OAAgent.tsx
    understander/
      Understander.tsx
    diff-expert/
      DiffExpert.tsx
  shared/              跨功能共享
    constants/
      navigation.ts
    services/
      gemini.ts
    types/
      index.ts
    utils/
      file.ts
  main.tsx             入口文件
  styles.css           全局样式入口（含 Tailwind）
```

## 路径别名

`@` 指向 `src/`，示例：`@/shared/types`

## Tailwind CSS

使用本地构建方式（非 CDN），样式入口为 `src/styles.css`。
