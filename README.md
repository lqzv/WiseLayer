# wiselayer

将 OGC **WMS** / **WMTS** 抽象为统一图层，方便添加到 Cesium Viewer。

## 主要用途

wiselayer 是一个面向 [Cesium](https://cesium.com/) 的轻量 npm 库，解决 WMS、WMTS 影像图层在 Cesium 中配置分散、API 不统一的问题。通过 `createLayer` 用相同方式创建两类图层，并统一管理显隐、透明度、叠放顺序与相机定位；还可解析服务 **GetCapabilities** 文档，批量生成图层配置。

典型场景：

- 在 Cesium 三维地球中叠加 GeoServer、ArcGIS 等 OGC 地图服务
- 从 Capabilities 自动发现可用图层并批量加载
- 在 Vite / 原生 HTML 等环境中快速集成 WMS/WMTS

## 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | TypeScript |
| 三维引擎 | Cesium ^1.142（peerDependency） |
| 构建 | [tsup](https://tsup.egoist.dev/)（ESM / CJS / IIFE 全局包） |
| 测试 | Vitest + happy-dom |
| API 文档 | TypeDoc |
| 示例 | Vite + vite-plugin-cesium；原生 HTML + 本地 Cesium |

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

环境要求：Node.js 18+，Cesium ^1.142.0（peerDependency，需自行安装）。

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

更多示例（WMTS、Vite 集成、典型工作流）见 [docs/快速开始.md](./docs/快速开始.md)。

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

## 原生 HTML 集成

构建后会生成 IIFE 全局包，并自动复制到 `examples/native/lib/wiselayer/`：

```html
<script>
  window.CESIUM_BASE_URL = './lib/Cesium142/Build/Cesium/';
</script>
<script src="./lib/Cesium142/Build/Cesium/Cesium.js"></script>
<script src="./lib/wiselayer/wiselayer.global.js"></script>
<script>
  const viewer = WiseLayer.createViewer('cesiumContainer');
  WiseLayer.createLayer({ type: 'wms', url: '...', layers: '...' }).addTo(viewer);
</script>
```

## 中文文档

完整中文帮助文档见 [docs/](./docs/) 目录：

| 文档 | 说明 |
|------|------|
| [文档首页](./docs/README.md) | 概述与快速示例 |
| [快速开始](./docs/快速开始.md) | 安装、Vite 集成、典型工作流 |
| [API 参考](./docs/API参考.md) | 类型、类、方法说明（手写） |
| [架构说明](./docs/架构说明.md) | 模块结构、设计思路 |
| [常见问题](./docs/常见问题.md) | 跨域、坐标系、定位失败等 FAQ |
| [API 文档发布](./docs/API文档发布.md) | TypeDoc 与 GitHub Pages 部署 |

### 自动生成 API 文档（TypeDoc）

```bash
npm run docs:api
```

生成结果在 `docs-api/`，本地可打开 `docs-api/index.html` 查看。推送到 `main` / `master` 后，GitHub Actions 会自动发布到 GitHub Pages（详见 [docs/API文档发布.md](./docs/API文档发布.md)）。

## 本地示例与启动

### Vite 示例

```bash
npm install
npm run build

cd examples/vite-cesium
npm install
npm run dev
```

浏览器打开 http://localhost:5173 。演示 WMS（GeoServer `topp:states`）与 WMTS（ArcGIS `World_Imagery`）。

### 原生 HTML 示例

```bash
npm install
npm run build

npx serve examples/native
```

| 页面 | 类型 | 数据源 |
|------|------|--------|
| `01_layer_wms_geoserver.html` | WMS | GeoServer `topp:states` |
| `01_layer_wmts_arcgis.html` | WMTS | ArcGIS Online `World_Imagery` |

## 开发

```bash
npm install
npm run dev      # 监听构建，并同步到 examples/native/lib/wiselayer/
npm test         # 运行测试
npm run build    # 构建 dist，并复制到 examples/native/lib/wiselayer/
npm run docs:api # 生成 API 文档到 docs-api/
```

## 发布到 npm

```bash
npm login
npm run release
```

## License

MIT
