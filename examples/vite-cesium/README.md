# vite-cesium 示例

本地演示 wiselayer 与 Cesium 的集成。

## 运行

在仓库根目录先构建库：

```bash
npm run build
```

然后进入示例目录：

```bash
cd examples/vite-cesium
npm install
npm run dev
```

浏览器打开 http://localhost:5173 即可。

## 演示内容

- **WMS**：GeoServer 美国各州边界（`topp:states`）
- **WMTS**：ArcGIS Online 全球影像（`World_Imagery`）
- 面板可切换图层显隐、调整透明度
