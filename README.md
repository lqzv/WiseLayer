# wiselayer

将 OGC **WMS** / **WMTS** 抽象为统一图层，方便添加到 Cesium Viewer。

## 特性

- 统一 API 创建 WMS / WMTS 图层
- 图层管理：添加、移除、显隐、透明度
- 相机定位：`centerAt` 飞行到图层范围
- 叠放顺序：`setZIndex` / `getZIndex`
- 完整 TypeScript 类型

## 安装

```bash
npm install wiselayer cesium
```

## 快速开始

```typescript
import { Viewer, Rectangle } from 'cesium';
import { createLayer } from 'wiselayer';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const viewer = new Viewer('cesiumContainer');

const wmsLayer = createLayer({
  type: 'wms',
  url: 'https://ahocevar.com/geoserver/wms',
  layers: 'topp:states',
  crs: 'EPSG:4326',
  rectangle: Rectangle.fromDegrees(-125, 24, -66, 50),
});

wmsLayer.addTo(viewer);
wmsLayer.setAlpha(0.85);
wmsLayer.centerAt({ duration: 2 });
```

## 从 GetCapabilities 自动创建 WMS 图层

```typescript
import { createWmsLayerOptionsFromCapabilities, createLayer, addLayers } from 'wiselayer';

const configs = await createWmsLayerOptionsFromCapabilities('https://ahocevar.com/geoserver/wms', {
  layerFilter: 'states',
});

// 单个创建
createLayer(configs[0]).addTo(viewer);

// 或批量添加
addLayers(viewer, configs);
```

## 从 GetCapabilities 自动创建 WMTS 图层

```typescript
import { createWmtsLayerOptionsFromCapabilities, addLayers } from 'wiselayer';

const configs = await createWmtsLayerOptionsFromCapabilities(
  'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS',
  { layerFilter: 'World_Imagery', preferredTileMatrixSet: 'default028mm' },
);
addLayers(viewer, configs);
```

## WMTS 示例

```typescript
const wmtsLayer = createLayer({
  type: 'wmts',
  url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS',
  layer: 'World_Imagery',
  style: 'default',
  format: 'image/jpeg',
  tileMatrixSetID: 'default028mm',
});

wmtsLayer.addTo(viewer);
```

## 批量添加

```typescript
import { addLayers } from 'wiselayer';

addLayers(viewer, [
  { type: 'wms', url: '...', layers: 'a', zIndex: 1 },
  { type: 'wmts', url: '...', layer: 'b', tileMatrixSetID: 'EPSG:4326', zIndex: 0 },
]);
```

## 中文文档

完整中文帮助文档见 [docs/](./docs/) 目录：

- [文档首页](./docs/README.md)
- [快速开始](./docs/快速开始.md)
- [API 参考](./docs/API参考.md)（手写）
- [架构说明](./docs/架构说明.md)
- [常见问题](./docs/常见问题.md)

### 自动生成 API 文档（TypeDoc）

```bash
npm run docs:api
```

生成结果在 `docs-api/`，本地可打开 `docs-api/index.html` 查看。

推送到 `main` / `master` 分支后，GitHub Actions 会自动发布到 **GitHub Pages**（需在仓库 Settings → Pages → Source 选择 **GitHub Actions**）。

## 本地示例

```bash
npm run build
cd examples/vite-cesium
npm install
npm run dev
```

## 开发

```bash
npm install
npm run dev      # 监听构建
npm test         # 运行测试
npm run build    # 构建 dist
npm run docs:api # 生成 API 文档到 docs-api/
```

## 发布到 npm

```bash
npm login
npm run release
```

## License

MIT
