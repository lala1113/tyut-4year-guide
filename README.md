# 太原理工大学 · 大学四年生涯规划指南

> 面向太原理工大学（TYUT）学生的四年职业生涯规划指南网站，纯前端实现，无需后端。

线上地址：https://lala1113.github.io/tyut-4year-guide/

> 由 GitHub Pages 永久托管，`git push` 后自动更新（1–2 分钟生效）。

## 项目简介

一个集成了保研、考研、考公、就业四大方向，以及基础篇（四六级、转专业、评奖评优、挂科警示）的综合性生涯规划百科网站。

### 主要板块

- **首页 Hero** — 2025届毕业数据总览
- **基础篇** — 全局四年时间轴、四六级、转专业、评奖评优、挂科警示、FAQ
- **保研** — 推免政策、3+1+4本博贯通、支教保研、案例参考
- **考研** — 全年时间表、备考清单
- **考公** — 国考/省考/选调生（定向/普通）、备考清单
- **就业** — 求职时间线、简历模板
- **学长学姐说** — 真实案例
- **视频资源** — 19条B站直链精选视频
- **资料下载** — 简历模板、四六级/考研/考公备考清单
- **联系作者** — 二维码联系

### 特色功能

- **站内全文搜索** — 加权排序，键盘导航，120ms 防抖
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
├── index.html          # 主页面
├── css/style.css       # 样式
├── js/
│   ├── content.js      # 内容数据（Markdown 源）
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
    └── gongkao-checklist.html
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
