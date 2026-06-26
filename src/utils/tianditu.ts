/**
 * 天地图 WMTS 服务工具函数与常量。
 *
 * 负责将 {@link TiandituLayerOptions} 解析为 Cesium
 * {@link https://cesium.com/learn/cesiumjs/ref-doc/WebMapTileServiceImageryProvider.html WebMapTileServiceImageryProvider}
 * 所需的 URL、TileMatrixSet、切分方案及 tileMatrixLabels。
 *
 * @module utils/tianditu
 * @internal 内部模块，公共 API 请使用 {@link TiandituLayer}。
 */

import { GeographicTilingScheme, WebMercatorTilingScheme, type TilingScheme } from 'cesium';
import type { LayerRectangle } from './rectangle.js';
import type { TiandituCrs, TiandituImageType } from '../types/tianditu.js';

/** 天地图 WMTS 子域名（t0–t7），用于 `{s}` 占位符负载均衡 */
export const TIANDITU_SUBDOMAINS = ['0', '1', '2', '3', '4', '5', '6', '7'] as const;

/** 天地图 WMTS 服务根地址模板，`{s}` 为子域名占位符 */
export const TIANDITU_WMTS_HOST = 'https://t{s}.tianditu.gov.cn';

/** 天地图 WMTS 瓦片格式，固定为 `tiles` */
export const TIANDITU_TILE_FORMAT = 'tiles';

/** 天地图 WMTS 图层样式，固定为 `default` */
export const TIANDITU_DEFAULT_STYLE = 'default';

/**
 * 未配置 `rectangle` 时的默认范围（全球 Web 墨卡托有效纬度）。
 *
 * 经度 -180°~180°，纬度 -85°~85°。
 */
export const TIANDITU_DEFAULT_RECTANGLE: LayerRectangle = {
  west: -180,
  south: -85,
  east: 180,
  north: 85,
};

/** imageType 到天地图 WMTS Layer 标识的映射 */
const IMAGE_TYPE_LAYER_CODES: Record<TiandituImageType, string> = {
  vector: 'vec',
  imagery: 'img',
  vectorAnnotation: 'cva',
  imageryAnnotation: 'cia',
};

/** crs 到天地图 TileMatrixSet 后缀的映射（w = 墨卡托，c = 经纬直投） */
const CRS_TILE_MATRIX_SUFFIX: Record<TiandituCrs, string> = {
  'EPSG:3857': 'w',
  'EPSG:4326': 'c',
};

/** 各坐标系下未指定 maximumLevel 时的默认最大缩放级别 */
const DEFAULT_MAXIMUM_LEVEL: Record<TiandituCrs, number> = {
  'EPSG:3857': 18,
  'EPSG:4326': 17,
};

/**
 * 解析天地图影像类型。
 *
 * @param imageType - 用户配置的影像类型
 * @returns 有效影像类型，未指定时返回 `'vector'`
 */
export function resolveTiandituImageType(imageType?: TiandituImageType): TiandituImageType {
  return imageType ?? 'vector';
}

/**
 * 解析天地图坐标参考系。
 *
 * @param crs - 用户配置的坐标参考系
 * @returns 有效坐标参考系，未指定时返回 `'EPSG:3857'`
 */
export function resolveTiandituCrs(crs?: TiandituCrs): TiandituCrs {
  return crs ?? 'EPSG:3857';
}

/**
 * 根据坐标参考系返回 Cesium 瓦片切分方案。
 *
 * @param crs - 坐标参考系
 * @returns EPSG:4326 使用 GeographicTilingScheme，EPSG:3857 使用 WebMercatorTilingScheme
 */
export function resolveTiandituTilingScheme(crs: TiandituCrs): TilingScheme {
  return crs === 'EPSG:4326' ? new GeographicTilingScheme() : new WebMercatorTilingScheme();
}

/**
 * 根据坐标参考系返回默认最大缩放级别。
 *
 * @param crs - 坐标参考系
 * @param maximumLevel - 用户配置的最大级别，未指定时使用内置默认值
 * @returns 实际最大缩放级别
 */
export function resolveTiandituMaximumLevel(crs: TiandituCrs, maximumLevel?: number): number {
  return maximumLevel ?? DEFAULT_MAXIMUM_LEVEL[crs];
}

/**
 * 生成天地图经纬直投（EPSG:4326）的 tileMatrixLabels。
 *
 * 天地图经纬直投瓦片矩阵从 **1** 起编，Cesium 从 **0** 起编，
 * 需将 Cesium 第 n 级映射为天地图第 n + 1 级，否则会出现只显示半球等问题。
 *
 * Web 墨卡托（EPSG:3857）与 Cesium WebMercatorTilingScheme 级别已对齐，返回 `undefined`。
 *
 * @param crs - 坐标参考系
 * @param minimumLevel - 最小缩放级别
 * @param maximumLevel - 最大缩放级别
 * @returns EPSG:4326 时返回标签数组，否则返回 `undefined`
 */
export function resolveTiandituTileMatrixLabels(
  crs: TiandituCrs,
  minimumLevel: number,
  maximumLevel: number,
): string[] | undefined {
  if (crs !== 'EPSG:4326') {
    return undefined;
  }

  const labels: string[] = [];

  for (let level = minimumLevel; level <= maximumLevel; level++) {
    labels.push(String(level + 1));
  }

  return labels;
}

/**
 * 天地图 WMTS 服务连接信息，由 {@link buildTiandituWmtsServiceInfo} 生成。
 */
export interface TiandituWmtsServiceInfo {
  /** WMTS 服务地址（含 tk 参数），含 `{s}` 子域名占位符 */
  url: string;
  /** WMTS Layer 标识（vec / img / cva / cia） */
  layer: string;
  /** TileMatrixSet 标识（w / c） */
  tileMatrixSetID: string;
  /** 服务路径标识（如 vec_w、img_c） */
  serviceId: string;
}

/**
 * 根据天地图配置生成 WMTS 连接参数。
 *
 * URL 格式：`https://t{s}.tianditu.gov.cn/{serviceId}/wmts?tk={token}`
 *
 * @param options - 影像类型、坐标参考系与 Token
 * @returns WMTS Provider 所需的 url、layer、tileMatrixSetID 等字段
 *
 * @example
 * ```typescript
 * buildTiandituWmtsServiceInfo({
 *   imageType: 'vector',
 *   crs: 'EPSG:3857',
 *   token: 'YOUR_TOKEN',
 * });
 * // => { url: 'https://t{s}.tianditu.gov.cn/vec_w/wmts?tk=...', layer: 'vec', ... }
 * ```
 */
export function buildTiandituWmtsServiceInfo(options: {
  imageType: TiandituImageType;
  crs: TiandituCrs;
  token: string;
}): TiandituWmtsServiceInfo {
  const layer = IMAGE_TYPE_LAYER_CODES[options.imageType];
  const tileMatrixSetID = CRS_TILE_MATRIX_SUFFIX[options.crs];
  const serviceId = `${layer}_${tileMatrixSetID}`;
  const url = `${TIANDITU_WMTS_HOST}/${serviceId}/wmts?tk=${encodeURIComponent(options.token)}`;

  return {
    url,
    layer,
    tileMatrixSetID,
    serviceId,
  };
}
