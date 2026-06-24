/**
 * @module wiselayer
 * 将 OGC WMS / WMTS 服务抽象为统一图层，简化 Cesium 影像图层的创建与管理。
 *
 * @example
 * ```typescript
 * import { Viewer } from 'cesium';
 * import { createLayer } from 'wiselayer';
 *
 * const viewer = new Viewer('cesiumContainer');
 * createLayer({ type: 'wms', url: '...', layers: 'layer_name' }).addTo(viewer);
 * ```
 */

export type {
  BaseLayerOptions,
  CenterAtOptions,
  LayerOptions,
  LayerType,
  WmsLayerOptions,
  WmtsLayerOptions,
  FetchWmsLayerConfigsOptions,
  FetchWmtsLayerConfigsOptions,
} from './types/index.js';

export type { ILayer } from './layers/BaseLayer.js';
export { BaseLayer } from './layers/BaseLayer.js';
export { WmsLayer } from './layers/WmsLayer.js';
export { WmtsLayer } from './layers/WmtsLayer.js';
export {
  createLayer,
  addLayers,
  createWmsLayerOptionsFromCapabilities,
  createWmtsLayerOptionsFromCapabilities,
} from './factory/createLayer.js';
export { createViewer } from './viewer/createViewer.js';
export type { CreateViewerOptions } from './viewer/createViewer.js';
export type { GeoRectangle, LayerRectangle } from './utils/rectangle.js';
