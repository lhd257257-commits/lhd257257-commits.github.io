# GitHub Pages 部署说明（草堂游戏子目录）

目标目录：

```text
lhd257257-commits.github.io/
└─ dufu-garden/
   ├─ index.html
   ├─ assets/
   ├─ shots/
   ├─ README.md
   └─ ATTRIBUTION.md
```

## 上传

1. 打开仓库根目录：

   ```text
   https://github.com/lhd257257-commits/lhd257257-commits.github.io
   ```

2. **Add file → Upload files**；
3. 把整个 `dufu-garden` 文件夹拖进去；
4. 确认路径为 `/dufu-garden/index.html`；
5. Commit message：

   ```text
   Add Du Fu Thatched Cottage 3D garden prototype
   ```

6. Commit changes。

## 访问

```text
https://lhd257257-commits.github.io/dufu-garden/
```

## 构建注意

`vite.config.js` 已设置：

```js
base: "./"
```

构建产物中的资源路径为：

```html
<script src="./assets/index-....js"></script>
<link rel="stylesheet" href="./assets/index-....css">
```

因此可以直接放在 `/dufu-garden/` 子目录，不需要改成绝对路径。

## 授权提醒

上游模板没有 LICENSE，公开上传前应确认授权；本项目仅作为研究/教学原型展示。详见 `ATTRIBUTION.md`。
