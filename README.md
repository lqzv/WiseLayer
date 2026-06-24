# wiselayer

将 OGC **WMS** / **WMTS** 抽象为统一图层，方便添加到 Cesium Viewer。

## 目录

- [主要用途](#主要用途)
- [技术栈](#技术栈)
- [特性](#特性)
- [环境要求](#环境要求)
- [安装](#安装)
- [快速开始](#快速开始)
- [从 GetCapabilities 自动创建图层](#从-getcapabilities-自动创建-wms-图层)
- [与 Vite 集成](#与-vite-集成)
- [原生 HTML 集成](#原生-html-集成)
- [本地示例与启动](#本地示例与启动)
- [API 参考](#api-参考)
- [架构说明](#架构说明)
- [常见问题](#常见问题)
- [API 文档（TypeDoc）](#api-文档typedoc)
- [开发](#开发)
- [发布到 npm](#发布到-npm)
- [相关链接](#相关链接)

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

## 环境要求

- Node.js 18+
- Cesium ^1.142.0（作为 peerDependency，需自行安装）

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
  zIndex: 1,
});

wmsLayer.addTo(viewer);
wmsLayer.setAlpha(0.85);
wmsLayer.centerAt({ duration: 2 });
```

### 最小 WMTS 示例

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

### 典型工作流

```typescript
import { Viewer, Rectangle } from 'cesium';
import { createLayer, addLayers } from 'wiselayer';

const viewer = new Viewer('cesiumContainer');
viewer.imageryLayers.removeAll(); // 可选：清除默认底图

// 方式一：单个创建
const base = createLayer({
  type: 'wmts',
  url: '...',
  layer: 'World_Imagery',
  tileMatrixSetID: 'default028mm',
  zIndex: 0,
});
base.addTo(viewer);

// 方式二：批量添加
const layers = addLayers(viewer, [
  { type: 'wms', url: '...', layers: 'states', zIndex: 1, rectangle: Rectangle.fromDegrees(-125, 24, -66, 50) },
]);

layers[0].setAlpha(0.8);
layers[0].centerAt({ duration: 1.5 });
```

## 从 GetCapabilities 自动创建 WMS 图层

```typescript
import { createWmsLayerOptionsFromCapabilities, createLayer, addLayers } from 'wiselayer';

const configs = await createWmsLayerOptionsFromCapabilities('https://ahocevar.com/geoserver/wms', {
  layerFilter: 'states',
});

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

## 批量添加

```typescript
import { addLayers } from 'wiselayer';

addLayers(viewer, [
  { type: 'wms', url: '...', layers: 'a', zIndex: 1 },
  { type: 'wmts', url: '...', layer: 'b', tileMatrixSetID: 'EPSG:4326', zIndex: 0 },
]);
```

## 与 Vite 集成

推荐使用 `vite-plugin-cesium` 处理 Cesium 静态资源：

```bash
npm install -D vite-plugin-cesium
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [cesium()],
});
```

完整可运行示例见 [examples/vite-cesium/](./examples/vite-cesium/)。

## 原生 HTML 集成

构建后会生成 IIFE 全局包 `dist/wiselayer.global.js`，并自动复制到 `examples/native/lib/wiselayer/`。在 Cesium 之后引入即可：

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

## 本地示例与启动

### 1. Vite 示例（推荐）

交互式演示，含 WMS / WMTS 图层切换与面板控制。

```bash
# 仓库根目录
npm install
npm run build

cd examples/vite-cesium
npm install
npm run dev
```

浏览器打开 http://localhost:5173 。演示 WMS（GeoServer `topp:states`）与 WMTS（ArcGIS `World_Imagery`），面板可切换显隐、调整透明度。

### 2. 原生 HTML 示例

无需 Vite，适合静态页面集成。Cesium 位于 `examples/native/lib/Cesium142/`，构建后 wiselayer 会自动复制到 `examples/native/lib/wiselayer/`。

```bash
# 仓库根目录
npm install
npm run build

# 启动静态服务器（不能直接 file:// 打开，否则 Cesium Worker 会跨域失败）
npx serve examples/native
```

| 页面 | 类型 | 数据源 |
|------|------|--------|
| `01_layer_wms_geoserver.html` | WMS | GeoServer `topp:states` |
| `01_layer_wmts_arcgis.html` | WMTS | ArcGIS Online `World_Imagery` |

## API 参考

### createLayer(options)

根据 `type` 字段创建 WMS 或 WMTS 图层实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| options | `WmsLayerOptions` \| `WmtsLayerOptions` | 图层配置 |

**返回值：** `WmsLayer` 或 `WmtsLayer`（由 `type` 推断）

### addLayers(viewer, layers)

批量创建图层并添加到 Viewer。

| 参数 | 类型 | 说明 |
|------|------|------|
| viewer | `Cesium.Viewer` | Cesium 视图实例 |
| layers | `LayerOptions[]` | 图层配置数组 |

**返回值：** `ILayer[]`

### createWmsLayerOptionsFromCapabilities(serviceUrl, options?)

请求 WMS GetCapabilities，解析并生成 `WmsLayerOptions` 配置数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| serviceUrl | `string` | WMS 服务地址 |
| options | `FetchWmsLayerConfigsOptions` | 解析选项 |

**返回值：** `Promise<WmsLayerOptions[]>`

### createWmtsLayerOptionsFromCapabilities(serviceUrl, options?)

请求 WMTS GetCapabilities，解析并生成 `WmtsLayerOptions` 配置数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| serviceUrl | `string` | WMTS 服务地址 |
| options | `FetchWmtsLayerConfigsOptions` | 解析选项 |

**返回值：** `Promise<WmtsLayerOptions[]>`

### createViewer(container, options?)

创建适用于 WiseLayer 的 Cesium Viewer。默认关闭常用 UI 控件、不加载默认底图，并清除已有影像图层。

| 参数 | 类型 | 说明 |
|------|------|------|
| container | `Element` \| `string` | DOM 元素或容器 id |
| options | `CreateViewerOptions` | Cesium Viewer 配置，会与默认配置合并 |

**返回值：** `Cesium.Viewer`

### FetchWmsLayerConfigsOptions

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| version | `'1.1.1'` \| `'1.3.0'` | 1.3.0 | WMS 版本 |
| leafOnly | `boolean` | true | 仅返回叶子图层 |
| layerFilter | `string` \| `RegExp` | - | 图层名过滤 |
| preferredCrs | `string` | - | 优先坐标系 |
| fetchOptions | `RequestInit` | - | fetch 附加参数 |

### FetchWmtsLayerConfigsOptions

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| version | `string` | 1.0.0 | WMTS 版本 |
| layerFilter | `string` \| `RegExp` | - | 图层 Identifier 过滤 |
| preferredTileMatrixSet | `string` | - | 优先瓦片矩阵集 |
| preferredFormat | `string` | - | 优先图片格式 |
| allTileMatrixSets | `boolean` | false | 每个矩阵集各生成一条配置 |
| fetchOptions | `RequestInit` | - | fetch 附加参数 |

### 接口 ILayer

所有图层实例均实现此接口。

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `id` | `string` | 唯一标识（只读） |
| `type` | `string` | 协议类型：'wms' \| 'wmts'（只读） |
| `name` | `string` | 显示名称（只读） |
| `show` | `boolean` | 是否可见 |
| `alpha` | `number` | 透明度 0~1 |
| `toImageryProvider()` | `() => ImageryProvider` | 创建 Cesium Provider |
| `addTo(viewer)` | `(Viewer) => ImageryLayer` | 添加到 Viewer |
| `remove()` | `() => void` | 从 Viewer 移除 |
| `setVisible(visible)` | `(boolean) => void` | 设置可见性 |
| `setAlpha(alpha)` | `(number) => void` | 设置透明度 |
| `centerAt(options?)` | `(CenterAtOptions?) => void` | 定位到图层范围 |
| `getZIndex()` | `() => number` | 获取当前层级索引 |
| `setZIndex(zIndex)` | `(number) => number` | 设置层级，返回实际索引 |

### 配置类型

#### BaseLayerOptions（公共字段）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | `string` | 自动 UUID | 图层 ID |
| name | `string` | 同 id | 显示名称 |
| show | `boolean` | true | 是否可见 |
| alpha | `number` | 1 | 透明度 |
| minimumLevel | `number` | - | 最小瓦片级别 |
| maximumLevel | `number` | - | 最大瓦片级别 |
| rectangle | `Cesium.Rectangle` 或 `{ west, south, east, north }` | - | 地理范围（度） |
| zIndex | `number` | - | 叠放层级，越大越靠上 |

#### WmsLayerOptions

继承 `BaseLayerOptions`，额外字段：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | `'wms'` | 是 | - | 协议类型 |
| url | `string` | 是 | - | WMS 服务地址 |
| layers | `string` | 是 | - | 图层名，逗号分隔 |
| styles | `string` | 否 | - | 样式名 |
| format | `string` | 否 | image/png | 图片格式 |
| crs | `string` | 否 | EPSG:4326 | WMS 1.3.0 坐标系 |
| srs | `string` | 否 | EPSG:4326 | WMS 1.1.x 坐标系 |
| version | `'1.1.1'` \| `'1.3.0'` | 否 | 1.3.0 | WMS 版本 |
| parameters | `Record<string, string>` | 否 | - | 附加 GetMap 参数 |
| enablePickFeatures | `boolean` | 否 | false | 要素拾取 |
| getFeatureInfoUrl | `string` | 否 | - | GetFeatureInfo 地址 |

#### WmtsLayerOptions

继承 `BaseLayerOptions`，额外字段：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | `'wmts'` | 是 | - | 协议类型 |
| url | `string` | 是 | - | WMTS 服务地址 |
| layer | `string` | 是 | - | 图层标识 |
| style | `string` | 否 | default | 样式 |
| tileMatrixSetID | `string` | 是 | - | 瓦片矩阵集 |
| format | `string` | 否 | image/png | 图片格式 |
| tilingScheme | `TilingScheme` | 否 | 自动 | 切分方案 |
| enablePickFeatures | `boolean` | 否 | false | 要素拾取 |
| getFeatureInfoUrl | `string` | 否 | - | GetFeatureInfo 地址 |
| subdomains | `string` \| `string[]` | 否 | - | 子域名 |

#### CenterAtOptions

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| duration | `number` | 2 | 飞行动画时长（秒） |

### 类

- **BaseLayer** — 抽象基类，不建议直接实例化
- **WmsLayer** — WMS 图层，内部使用 `WebMapServiceImageryProvider`
- **WmtsLayer** — WMTS 图层，内部使用 `WebMapTileServiceImageryProvider`

### 错误说明

| 错误信息 | 原因 | 处理方式 |
|----------|------|----------|
| Layer must be added to a viewer before ... | 未调用 addTo 就操作图层 | 先 addTo(viewer) |
| Layer has no bounded extent to center on | 图层范围为全球，无法定位 | 配置 rectangle |
| WMTS layer requires tileMatrixSetID | 缺少瓦片矩阵集 | 传入 tileMatrixSetID |
| Unsupported layer type | type 字段不合法 | 使用 'wms' 或 'wmts' |
| zIndex must be a finite number | zIndex 非有效数字 | 传入整数 |

## 架构说明

### 设计目标

wiselayer 在 Cesium 原生 Provider 之上提供一层**统一的图层抽象**，让 WMS 和 WMTS 可以用相同的方式创建、管理和交互，而不重复实现 OGC 协议细节。

```
用户配置 (LayerOptions)
        │
        ▼
   createLayer()  ──►  WmsLayer / WmtsLayer
        │                    │
        │                    ▼
        │           toImageryProvider()
        │                    │
        ▼                    ▼
      addTo(viewer) ──► Cesium ImageryLayer
```

### 目录结构

```
src/
├── index.ts              # 公共 API 出口
├── types/                # TypeScript 类型定义
├── layers/               # BaseLayer、WmsLayer、WmtsLayer
├── factory/createLayer.ts
├── viewer/createViewer.ts
└── utils/                # crs、url、camera、capabilities 解析等
```

### 数据流

**addTo：** 清理旧实例 → 创建 Provider → 加入 `imageryLayers` → 应用 `zIndex`

**centerAt：** 读取 `rectangle` 或 Provider 范围 → 若非全球范围则 `camera.flyTo`

**setZIndex：** 通过 Cesium 的 `raise()` / `lower()` 移动到目标位置

### 与 Cesium 的边界

| 职责 | wiselayer | Cesium |
|------|-----------|--------|
| OGC 协议请求 | 委托 Provider | WebMapServiceImageryProvider 等 |
| 瓦片加载渲染 | - | ImageryLayer |
| 图层抽象 API | createLayer、ILayer | - |
| 相机控制 | centerAt 封装 | camera.flyTo |
| 层级管理 | setZIndex 封装 | imageryLayers.raise/lower |

## 常见问题

### 安装与集成

**为什么需要单独安装 cesium？**

wiselayer 将 cesium 声明为 `peerDependency`，不会把 Cesium 打包进库中，避免包体积膨胀、防止两个 Cesium 实例导致渲染异常，并让使用方自行控制版本。

**Vite 项目中 Cesium 资源加载失败？**

安装并配置 `vite-plugin-cesium`，并引入 `cesium/Build/Cesium/Widgets/widgets.css`（见上文 [与 Vite 集成](#与-vite-集成)）。

### WMS 相关

**WMS 图层不显示？** 常见原因：跨域（CORS）、坐标系不匹配（检查 `crs` / `srs`）、`layers` 名称错误、被其他图层遮挡。

**WMS 1.1.1 和 1.3.0 的区别：**

| 版本 | 坐标参数 | 默认 |
|------|----------|------|
| 1.3.0 | crs | wiselayer 默认 |
| 1.1.x | srs | 需设置 `version: '1.1.1'` |

**如何叠加透明 WMS 到底图上？** 使用 `format: 'image/png'`，设置合适的 `zIndex`，并用 `setAlpha()` 调整透明度。

### WMTS 相关

**tileMatrixSetID 填什么？** 需与 WMTS Capabilities 中的 TileMatrixSet 标识一致，常见值：`EPSG:4326`、`EPSG:3857`、`GoogleMapsCompatible`、`default028mm`（ArcGIS）。

**WMTS URL 支持 KVP 编码与 RESTful 模板两种格式。**

### 定位（centerAt）

**提示「Layer has no bounded extent to center on」？** Provider 返回全球范围，需在配置中显式传入 `rectangle`。

**centerAt 必须先 addTo 吗？** 是的，定位依赖 Viewer 的 camera。

### 层级（zIndex）

**数值越大越靠上**（与 CSS z-index 一致）。修改一个图层的 zIndex 可能使其他图层的 index 随之变化。

### 调试建议

1. 打开 Network 面板，检查 GetMap / GetTile 请求是否 200
2. 查看 URL 中的 layers、crs、tileMatrixSet 等参数
3. 临时隐藏其他图层排查遮挡
4. 参考 `examples/vite-cesium` 或 `examples/native` 对比配置

## API 文档（TypeDoc）

从源码 JSDoc 自动生成更详细的 API 文档：

```bash
npm run docs:api
```

生成结果在 `docs-api/`，本地可打开 `docs-api/index.html` 查看。`docs-api/` 已加入 `.gitignore`，由 CI 在部署时生成。

### GitHub Pages 自动发布

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. **Build and deployment → Source** 选择 **GitHub Actions**
4. 向 `main` 或 `master` 分支推送，或手动触发 **Deploy API Docs** workflow

发布地址一般为 `https://<用户名>.github.io/WiseLayer/`。配置文件：`typedoc.json`、`.github/workflows/docs.yml`。

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
npm run release  # 自动 build + test 后 publish
```

`prepublishOnly` 会在 `npm publish` 前自动执行 `build` 和 `test`。

## 相关链接

- [npm 包 wiselayer](https://www.npmjs.com/package/wiselayer)
- [Cesium 官方文档](https://cesium.com/learn/cesiumjs/ref-doc/)
- [OGC WMS 标准](https://www.ogc.org/standards/wms)
- [OGC WMTS 标准](https://www.ogc.org/standards/wmts)

## License

MIT
