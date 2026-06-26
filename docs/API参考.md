# API 参考

## 工厂函数

### createLayer(options)

根据 `type` 字段创建 WMS、WMTS 或天地图图层实例。

| 参数 | 类型 | 说明 |
|------|------|------|
| options | `WmsLayerOptions` \| `WmtsLayerOptions` \| `TiandituLayerOptions` | 图层配置 |

**返回值：** `WmsLayer`、`WmtsLayer` 或 `TiandituLayer`（由 `type` 推断）

---

### addLayers(viewer, layers)

批量创建图层并添加到 Viewer。

| 参数 | 类型 | 说明 |
|------|------|------|
| viewer | `Cesium.Viewer` | Cesium 视图实例 |
| layers | `LayerOptions[]` | 图层配置数组 |

**返回值：** `ILayer[]`

---

### createWmsLayerOptionsFromCapabilities(serviceUrl, options?)

请求 WMS GetCapabilities，解析并生成 `WmsLayerOptions` 配置数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| serviceUrl | `string` | WMS 服务地址 |
| options | `FetchWmsLayerConfigsOptions` | 解析选项 |

**返回值：** `Promise<WmsLayerOptions[]>`

---

### createWmtsLayerOptionsFromCapabilities(serviceUrl, options?)

请求 WMTS GetCapabilities，解析并生成 `WmtsLayerOptions` 配置数组。

| 参数 | 类型 | 说明 |
|------|------|------|
| serviceUrl | `string` | WMTS 服务地址 |
| options | `FetchWmtsLayerConfigsOptions` | 解析选项 |

**返回值：** `Promise<WmtsLayerOptions[]>`

---

### FetchWmtsLayerConfigsOptions

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| version | `string` | 1.0.0 | WMTS 版本 |
| layerFilter | `string` \| `RegExp` | - | 图层 Identifier 过滤 |
| preferredTileMatrixSet | `string` | - | 优先瓦片矩阵集 |
| preferredFormat | `string` | - | 优先图片格式 |
| allTileMatrixSets | `boolean` | false | 每个矩阵集各生成一条配置 |
| fetchOptions | `RequestInit` | - | fetch 附加参数 |

---

### FetchWmsLayerConfigsOptions

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| version | `'1.1.1'` \| `'1.3.0'` | 1.3.0 | WMS 版本 |
| leafOnly | `boolean` | true | 仅返回叶子图层 |
| layerFilter | `string` \| `RegExp` | - | 图层名过滤 |
| preferredCrs | `string` | - | 优先坐标系 |
| fetchOptions | `RequestInit` | - | fetch 附加参数 |

---

## 接口 ILayer

所有图层实例均实现此接口。

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `id` | `string` | 唯一标识（只读） |
| `type` | `string` | 协议类型：'wms' \| 'wmts' \| 'tianditu'（只读） |
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

---

## 配置类型

### BaseLayerOptions（公共字段）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | `string` | 自动 UUID | 图层 ID |
| name | `string` | 同 id | 显示名称 |
| show | `boolean` | true | 是否可见 |
| alpha | `number` | 1 | 透明度 |
| minimumLevel | `number` | - | 最小瓦片级别 |
| maximumLevel | `number` | - | 最大瓦片级别 |
| rectangle | `Cesium.Rectangle` | - | 地理范围 |
| zIndex | `number` | - | 叠放层级，越大越靠上 |

### WmsLayerOptions

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

### WmtsLayerOptions

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

### TiandituLayerOptions

继承 `BaseLayerOptions`，额外字段：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| type | `'tianditu'` | 是 | - | 协议类型 |
| token | `string` | 是 | - | 天地图 API Token（tk） |
| crs | `'EPSG:3857'` \| `'EPSG:4326'` | 否 | EPSG:3857 | 坐标参考系 |
| imageType | `'vector'` \| `'imagery'` \| `'vectorAnnotation'` \| `'imageryAnnotation'` | 否 | vector | 影像类型 |

**crs 与天地图服务对应关系：**

| crs | 说明 | TileMatrixSet |
|-----|------|---------------|
| EPSG:3857 | Web 墨卡托 | w |
| EPSG:4326 | 经纬直投 | c |

**imageType 与 WMTS Layer 对应关系：**

| imageType | WMTS Layer | 说明 |
|-----------|------------|------|
| vector | vec | 矢量底图 |
| imagery | img | 影像底图 |
| vectorAnnotation | cva | 矢量注记 |
| imageryAnnotation | cia | 影像注记 |

完整底图通常需叠加两层，例如 `vector` + `vectorAnnotation`。

**默认范围：** 未配置 `rectangle` 时使用全球范围（-180°~180°，-85°~85°）。

### TiandituCrs

```typescript
type TiandituCrs = 'EPSG:3857' | 'EPSG:4326';
```

### TiandituImageType

```typescript
type TiandituImageType = 'vector' | 'imagery' | 'vectorAnnotation' | 'imageryAnnotation';
```

### CenterAtOptions

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| duration | `number` | 2 | 飞行动画时长（秒） |

---

## 类

### BaseLayer（抽象基类）

不建议直接实例化，通过 `WmsLayer` / `WmtsLayer` / `TiandituLayer` 或 `createLayer` 使用。

### WmsLayer

WMS 图层，内部使用 `WebMapServiceImageryProvider`。

### WmtsLayer

WMTS 图层，内部使用 `WebMapTileServiceImageryProvider`。

### TiandituLayer

天地图 WMTS 图层，内部使用 `WebMapTileServiceImageryProvider`。

预设 tianditu.gov.cn 服务地址、子域名、瓦片矩阵集与切分方案，相比 `WmtsLayer` 无需手动配置 url / layer / tileMatrixSetID。

```typescript
const token = 'YOUR_TOKEN';

// 矢量底图 + 注记
createLayer({ type: 'tianditu', token, imageType: 'vector' }).addTo(viewer);
createLayer({ type: 'tianditu', token, imageType: 'vectorAnnotation', zIndex: 1 }).addTo(viewer);

// 经纬直投影像
createLayer({ type: 'tianditu', token, crs: 'EPSG:4326', imageType: 'imagery' }).addTo(viewer);
```

Token 在 [天地图开发者控制台](https://console.tianditu.gov.cn/) 申请。

---

## 错误说明

| 错误信息 | 原因 | 处理方式 |
|----------|------|----------|
| Layer must be added to a viewer before ... | 未调用 addTo 就操作图层 | 先 addTo(viewer) |
| Layer has no bounded extent to center on | 图层范围为全球，无法定位 | 配置 rectangle |
| WMTS layer requires tileMatrixSetID | 缺少瓦片矩阵集 | 传入 tileMatrixSetID |
| Tianditu layer requires token | 天地图缺少 Token | 传入 token |
| Unsupported layer type | type 字段不合法 | 使用 'wms'、'wmts' 或 'tianditu' |
| zIndex must be a finite number | zIndex 非有效数字 | 传入整数 |

---

## 导出清单

```typescript
// 类型
export type {
  BaseLayerOptions, CenterAtOptions, LayerOptions, LayerType,
  WmsLayerOptions, WmtsLayerOptions, TiandituLayerOptions,
  TiandituCrs, TiandituImageType, ILayer,
};

// 类
export { BaseLayer, WmsLayer, WmtsLayer, TiandituLayer };

// 函数
export {
  createLayer,
  addLayers,
  createWmsLayerOptionsFromCapabilities,
  createWmtsLayerOptionsFromCapabilities,
};
```
