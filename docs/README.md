# wiselayer 中文文档

wiselayer 是一个将 OGC **WMS** / **WMTS** 服务抽象为统一图层的 JavaScript 库，用于简化 Cesium 影像图层的创建与管理。

## 文档目录

| 文档 | 说明 |
|------|------|
| [快速开始](./快速开始.md) | 安装、最小示例、与 Cesium 集成 |
| [API 参考](./API参考.md) | 类型、类、方法完整说明（手写） |
| [API 文档（TypeDoc）](../docs-api/index.html) | 从源码注释自动生成的 HTML 文档 |
| [架构说明](./架构说明.md) | 模块结构、设计思路、数据流 |
| [常见问题](./常见问题.md) | 跨域、坐标系、定位失败等 FAQ |

## 核心能力

- 统一 API 创建 WMS / WMTS 图层
- 图层生命周期管理：`addTo` / `remove` / 显隐 / 透明度
- 相机定位：`centerAt` 飞行到图层范围
- 叠放顺序：`setZIndex` / `getZIndex` 控制上下关系
- 完整 TypeScript 类型支持

## 快速示例

```typescript
import { Viewer, Rectangle } from 'cesium';
import { createLayer } from 'wiselayer';

const viewer = new Viewer('cesiumContainer');

const layer = createLayer({
  type: 'wms',
  url: 'https://ahocevar.com/geoserver/wms',
  layers: 'topp:states',
  crs: 'EPSG:4326',
  rectangle: Rectangle.fromDegrees(-125, 24, -66, 50),
  zIndex: 1,
});

layer.addTo(viewer);
layer.setAlpha(0.85);
layer.centerAt({ duration: 2 });
```

## 本地示例项目

```bash
npm run build
cd examples/vite-cesium
npm install
npm run dev
```

## 相关链接

- [npm 包 wiselayer](https://www.npmjs.com/package/wiselayer)
- [Cesium 官方文档](https://cesium.com/learn/cesiumjs/ref-doc/)
- [OGC WMS 标准](https://www.ogc.org/standards/wms)
- [OGC WMTS 标准](https://www.ogc.org/standards/wmts)
