# 太原理工大学 · 大学四年生涯规划指南

> 面向太原理工大学（TYUT）学生的四年职业生涯规划指南网站，纯前端实现，无需后端。

线上地址：https://lala1113.github.io/tyut-4year-guide/

> 由 GitHub Pages 永久托管，`git push` 后自动更新（1–2 分钟生效）。

## 项目简介

一个采用“轻首页 + 独立模块页”结构的生涯规划网站，整合保研、考研、考公、就业、行动计划、推免去向和学习资源。

### 主要板块

- **首页** — 四大发展方向、常用工具与最近更新入口
- **行动中心** — 按年级和月份安排待办，本机保存进度
- **方向探索** — 六题方向探索与下一步建议
- **基础篇** — 全局四年时间轴、四六级、转专业、评奖评优、挂科警示、FAQ
- **保研** — 推免政策、3+1+4本博贯通、支教保研、案例参考
- **考研** — 全年时间表、备考清单
- **考公** — 国考/省考/选调生（定向/普通）、备考清单
- **就业** — 求职时间线、简历模板
- **推免去向** — 2026届匿名记录筛选与统计
- **资源中心** — 学长学姐案例、B站视频和可下载资料
- **联系作者** — 二维码联系

### 特色功能

- **跨页面全文搜索** — 支持内容类型、方向、官方来源筛选和关键词高亮
- **本地规划工具** — 待办、收藏、搜索历史和择校对比只保存在当前浏览器
- **继续上次使用** — 首页汇总最近模块、待办进度、收藏和择校记录
- **资源收藏** — 收藏具体经验、视频或下载资料，并显示最近浏览
- **信息复核提醒** — 根据内容最后更新时间提示下一次复核节点
- **Markdown 渲染** — 内容与样式分离，便于维护
- **响应式设计** — 手机/平板/电脑自适应
- **校徽蓝主题** — #005BAC 太原理工蓝

## 技术栈

- 纯前端：HTML5 + CSS3 + 原生 JavaScript（无框架、无后端）
- Markdown 渲染：[marked.js](https://github.com/markedjs/marked) v12.0.2 + [DOMPurify](https://github.com/cure53/DOMPurify) v3.1.6
- 字体：思源黑体 + 系统字体栈

## 目录结构

```
tyut-career-guide/
├── index.html          # 轻量导航首页
├── action-center.html  # 本月行动中心
├── exploration.html    # 六题方向探索
├── foundation.html     # 大学基础篇
├── baoyan.html         # 保研指南
├── promotion-destinations.html # 推免去向查询
├── kaoyan.html         # 考研指南与择校对比
├── kaogong.html        # 考公与选调指南
├── jiuye.html          # 就业指南
├── resources.html      # 经验、视频和资料中心
├── css/style.css       # 样式
├── js/
│   ├── content-*.js    # 各模块按页面加载的 Markdown 内容
│   ├── search-index.js # 小节级跨页面搜索索引
│   ├── home-dashboard.js # 首页继续使用面板
│   ├── main.js         # 交互逻辑
│   ├── md-render.js    # Markdown 渲染
│   └── search.js       # 站内搜索
├── images/
│   ├── author-qr.png   # 作者二维码
│   └── site-qrcode.png # 网站二维码
└── files/              # 可下载资料
    ├── resume-template.html
    ├── cet-checklist.html
    ├── kaoyan-checklist.html
    ├── gongkao-checklist.html
    └── 太理保研清单01_课程学分表.xlsx
```

## 本地预览

直接用浏览器打开 `index.html` 即可，或用任意静态服务器：

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

访问 http://localhost:8000

## 内容来源

- 太原理工大学官方文件（校教〔2025〕6号 推免、校教〔2026〕9号 转专业、校学〔2024〕22号 奖学金）
- B站公开视频资源
- 学长学姐真实经历

## License

[MIT License](LICENSE) — 内容与代码均可自由使用，请保留版权声明。

## 致谢

感谢太原理工大学全体师生提供的资料与建议。
