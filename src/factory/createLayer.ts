import type { Viewer } from 'cesium';
import type { LayerOptions } from '../types/index.js';
import type { ILayer } from '../layers/BaseLayer.js';
import { WmsLayer } from '../layers/WmsLayer.js';
import { WmtsLayer } from '../layers/WmtsLayer.js';
import { TiandituLayer } from '../layers/TiandituLayer.js';
import type { FetchWmsLayerConfigsOptions, WmsLayerOptions } from '../types/wms.js';
import type { FetchWmtsLayerConfigsOptions, WmtsLayerOptions } from '../types/wmts.js';
import type { TiandituLayerOptions } from '../types/tianditu.js';
import { fetchWmsLayerConfigs } from '../utils/wmsCapabilities.js';
import { fetchWmtsLayerConfigs } from '../utils/wmtsCapabilities.js';

/**
 * 根据配置创建图层实例（工厂方法）。
 *
 * 通过 `type` 字段自动分发到 {@link WmsLayer}、{@link WmtsLayer} 或 {@link TiandituLayer}。
 * TypeScript 会根据 `type` 字面量推断返回的具体类型。
 *
 * @example
 * ```typescript
 * const wms = createLayer({ type: 'wms', url: '...', layers: 'states' });
 * const wmts = createLayer({ type: 'wmts', url: '...', layer: 'img', tileMatrixSetID: 'EPSG:3857' });
 * const tianditu = createLayer({ type: 'tianditu', token: 'YOUR_TOKEN', imageType: 'imagery' });
 * wms.addTo(viewer);
 * ```
 *
 * @param options - WMS、WMTS 或天地图图层配置
 * @returns 对应协议类型的图层实例
 * @throws 当 `type` 不受支持时抛出
 */
export function createLayer(options: WmsLayerOptions): WmsLayer;
export function createLayer(options: WmtsLayerOptions): WmtsLayer;
export function createLayer(options: TiandituLayerOptions): TiandituLayer;
export function createLayer(options: LayerOptions): ILayer;
export function createLayer(options: LayerOptions): ILayer {
  switch (options.type) {
    case 'wms':
      return new WmsLayer(options);
    case 'wmts':
      return new WmtsLayer(options);
    case 'tianditu':
      return new TiandituLayer(options);
    default: {
      const unknownType = (options as { type?: string }).type ?? 'unknown';
      throw new Error(`Unsupported layer type: ${unknownType}`);
    }
  }
}

/**
 * 批量创建图层并添加到 Cesium Viewer。
 *
 * 按数组顺序依次调用 {@link ILayer.addTo}，先添加的图层默认在底层（除非配置了 `zIndex`）。
 *
 * @example
 * ```typescript
 * const configs = await createWmsLayerOptionsFromCapabilities('https://example.com/geoserver/wms');
 * const layers = addLayers(viewer, configs);
 * ```
 *
 * @param viewer - Cesium Viewer 实例
 * @param layers - 图层配置数组
 * @returns 已添加到 Viewer 的图层实例数组
 */
export function addLayers(viewer: Viewer, layers: LayerOptions[]): ILayer[] {
  return layers.map((options) => {
    const layer = createLayer(options);
    layer.addTo(viewer);
    return layer;
  });
}

/**
 * 请求 WMS GetCapabilities，解析并生成 {@link WmsLayerOptions} 配置数组。
 *
 * 每个可请求的图层对应一条配置，可直接传给 {@link createLayer} 或 {@link addLayers}。
 *
 * @example
 * ```typescript
 * const configs = await createWmsLayerOptionsFromCapabilities('https://example.com/geoserver/wms', {
 *   layerFilter: 'states',
 *   preferredCrs: 'EPSG:4326',
 * });
 * createLayer(configs[0]).addTo(viewer);
 * ```
 *
 * @param serviceUrl - WMS 服务地址
 * @param options - GetCapabilities 解析选项
 * @returns 解析后的 WMS 图层配置数组
 */
export async function createWmsLayerOptionsFromCapabilities(
  serviceUrl: string,
  options?: FetchWmsLayerConfigsOptions,
): Promise<WmsLayerOptions[]> {
  return fetchWmsLayerConfigs(serviceUrl, options);
}

/**
 * 请求 WMTS GetCapabilities，解析并生成 {@link WmtsLayerOptions} 配置数组。
 *
 * 每个图层（及所选 TileMatrixSet）对应一条配置，可直接传给 {@link createLayer} 或 {@link addLayers}。
 *
 * @example
 * ```typescript
 * const configs = await createWmtsLayerOptionsFromCapabilities('https://example.com/wmts', {
 *   layerFilter: 'World_Imagery',
 *   preferredTileMatrixSet: 'default028mm',
 * });
 * addLayers(viewer, configs);
 * ```
 *
 * @param serviceUrl - WMTS 服务地址
 * @param options - GetCapabilities 解析选项
 * @returns 解析后的 WMTS 图层配置数组
 */
export async function createWmtsLayerOptionsFromCapabilities(
  serviceUrl: string,
  options?: FetchWmtsLayerConfigsOptions,
): Promise<WmtsLayerOptions[]> {
  return fetchWmtsLayerConfigs(serviceUrl, options);
}
