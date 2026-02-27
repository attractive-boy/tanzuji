前端原型说明

- 文件：
  - `index.html`：页面入口，包含控件、Canvas 和 SVG timeline。
  - `styles.css`：样式。
  - `treeViz.js`：树木生长隐喻绘制逻辑（Canvas）。
  - `timeline.js`：时间轴绘制（SVG）。
  - `app.js`：示例数据与交互逻辑。

- 运行：在 `frontend/` 目录，用浏览器直接打开 `index.html` 即可。推荐使用本地静态服务器：

```bash
cd frontend
# Python 3
python3 -m http.server 8000
# 打开 http://localhost:8000
```
