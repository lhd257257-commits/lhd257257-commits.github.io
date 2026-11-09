# GitHub Pages 部署说明（个人站点子目录）

本站已经放入：

```text
lhd257257-commits.github.io/
└─ tactical-atlas/
```

它不会覆盖根目录 `index.html` 的作品集首页。

## 1. 本地预览

从仓库根目录：

```bash
python -m http.server 8000
```

打开：

```text
http://127.0.0.1:8000/tactical-atlas/
```

## 2. 推送到 GitHub

```bash
cd E:\研究生\简历\游戏\github-pages-site

git status
git add tactical-atlas .nojekyll
git commit -m "Add Tactical Atlas tactical heatmap site"
git push origin main
```

## 3. 访问

不用新建仓库，也不用重新配置 Pages。个人站点仓库默认从 `main` 根目录发布：

```text
https://lhd257257-commits.github.io/tactical-atlas/
```

如果 1—2 分钟后仍 404，检查：

- 仓库 **Settings → Pages** 的 Branch 是否为 `main` / `(root)`；
- `tactical-atlas/index.html` 是否已推送；
- 是否误把 `tactical-atlas` 放进了 `.gitignore`。

## 4. 不要提交

- `_pubg_data/`、`downloads/`、`work/`、`*.zip`
- `*.csv`、`*.parquet`（原始数据）
- `kaggle.json`、`access_token`、任何 token
- `node_modules/`

仓库根目录的 `.gitignore` 和子目录的 `.gitignore` 已覆盖大部分。

## 5. 设计约束

- 根目录作品集保持原样；
- 本站为独立子目录；
- 数据使用相对路径 `./data/...`，在子路径下可以正常加载；
- `serve.mjs` 只用于本地预览，GitHub Pages 不需要运行它。

## 6. 授权

- 代码：MIT；
- 数据：见 `DATA_LICENSE.md`；
- 不使用 PUBG 官方地图、Logo、音乐或角色素材；
- 保留 `ATTRIBUTION.md` 与 `DATA_LICENSE.md`。
