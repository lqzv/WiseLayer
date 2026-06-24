import type { TilingScheme } from 'cesium';
import type { BaseLayerOptions } from './base.js';

/**
 * WMTS（Web Map Tile Service）图层配置项。
 * 对应 OGC WMTS 1.0.0 标准的 GetTile 请求参数。
 *
 * @see {@link https://www.ogc.org/standards/wmts OGC WMTS 标准}
 */
export interface WmtsLayerOptions extends BaseLayerOptions {
  /** 图层协议类型，固定为 'wmts' */
  type: 'wmts';
  /**
   * WMTS 服务地址。
   * 支持 KVP 编码 URL 或 RESTful 模板 URL（含 {TileMatrixSet}、{TileMatrix} 等占位符）。
   */
  url: string;
  /** WMTS 图层标识符（Capabilities 中的 Layer Identifier） */
  layer: string;
  /** 图层样式，默认 'default' */
  style?: string;
  /** 瓦片矩阵集 ID（TileMatrixSet），必填项 */
  tileMatrixSetID: string;
  /** 瓦片图片格式，默认 'image/png' */
  format?: string;
  /** 瓦片切分方案，默认由 Cesium 根据 WMTS 描述自动推断 */
  tilingScheme?: TilingScheme;
  /** 是否启用 GetFeatureInfo 要素拾取，默认 false */
  enablePickFeatures?: boolean;
  /** GetFeatureInfo 请求地址，未指定时使用 url */
  getFeatureInfoUrl?: string;
  /** 子域名列表，用于负载均衡（替换 URL 中的 {s} 占位符） */
  subdomains?: string | string[];
}

/** 从 WMTS GetCapabilities 生成图层配置时的选项 */
export interface FetchWmtsLayerConfigsOptions {
  /** WMTS 协议版本，默认 1.0.0 */
  version?: string;
  /** 按图层 Identifier 过滤，支持字符串（包含匹配）或正则 */
  layerFilter?: string | RegExp;
  /** 优先使用的 TileMatrixSet，未找到时使用服务首个或常见默认值 */
  preferredTileMatrixSet?: string;
  /** 优先使用的图片格式 */
  preferredFormat?: string;
  /** 是否为每个 TileMatrixSetLink 各生成一条配置，默认 false */
  allTileMatrixSets?: boolean;
  /** 传给 fetch 的额外参数 */
  fetchOptions?: RequestInit;
}
