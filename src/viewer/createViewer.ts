import { Viewer } from 'cesium';

const DEFAULT_VIEWER_OPTIONS: Viewer.ConstructorOptions = {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  baseLayer: false,
};

/** {@link createViewer} 的可选参数 */
export interface CreateViewerOptions extends Viewer.ConstructorOptions {
  /** 创建后清除影像图层，便于仅叠加 WMS/WMTS。默认 `true` */
  clearImageryLayers?: boolean;
}

/**
 * 创建适用于 WiseLayer 的 Cesium Viewer。
 *
 * 默认关闭常用 UI 控件、不加载默认底图，并清除已有影像图层，
 * 方便直接叠加 WMS / WMTS 图层。
 *
 * @example
 * ```typescript
 * import { createViewer, createLayer } from 'wiselayer';
 *
 * const viewer = createViewer('cesiumContainer');
 * createLayer({ type: 'wmts', url: '...', layer: 'img', tileMatrixSetID: 'EPSG:3857' }).addTo(viewer);
 * ```
 *
 * @param container - DOM 元素或容器 id
 * @param options - Cesium Viewer 配置，会与默认配置合并
 * @returns Cesium Viewer 实例
 */
export function createViewer(container: Element | string, options?: CreateViewerOptions): Viewer {
  const { clearImageryLayers = true, ...viewerOptions } = options ?? {};

  const viewer = new Viewer(container, {
    ...DEFAULT_VIEWER_OPTIONS,
    ...viewerOptions,
  });

  if (clearImageryLayers) {
    viewer.imageryLayers.removeAll();
  }

  return viewer;
}
