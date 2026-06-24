/**
 * 浏览器 IIFE 打包时替代 npm 包 `cesium`，从全局 `Cesium` 读取运行时 API。
 * 使用前须通过 script 标签加载 Cesium.js。
 */
const cesium = (globalThis as typeof globalThis & { Cesium?: typeof import('cesium') }).Cesium;

if (!cesium) {
  throw new Error('WiseLayer requires global Cesium. Load Cesium.js before wiselayer.global.js.');
}

export const Rectangle = cesium.Rectangle;
export const Viewer = cesium.Viewer;
export const WebMapTileServiceImageryProvider = cesium.WebMapTileServiceImageryProvider;
export const WebMapServiceImageryProvider = cesium.WebMapServiceImageryProvider;

export type Viewer = import('cesium').Viewer;
export type ImageryLayer = import('cesium').ImageryLayer;
export type ImageryProvider = import('cesium').ImageryProvider;
export type ImageryLayerCollection = import('cesium').ImageryLayerCollection;
export type TilingScheme = import('cesium').TilingScheme;
