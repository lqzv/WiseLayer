import type { BaseLayerOptions } from './base.js';

/**
 * WMS（Web Map Service）图层配置项。
 * 对应 OGC WMS 标准的 GetMap 请求参数。
 *
 * @see {@link https://www.ogc.org/standards/wms OGC WMS 标准}
 */
export interface WmsLayerOptions extends BaseLayerOptions {
  /** 图层协议类型，固定为 'wms' */
  type: 'wms';
  /** WMS 服务地址（GetMap 请求 URL） */
  url: string;
  /** 要加载的图层名，多个图层用逗号分隔 */
  layers: string;
  /** 图层样式名，多个样式用逗号分隔，需与 layers 一一对应 */
  styles?: string;
  /** 返回图片格式，默认 'image/png' */
  format?: string;
  /** 坐标参考系（WMS 1.3.0 使用 crs 参数） */
  crs?: string;
  /** 空间参考系（WMS 1.1.x 使用 srs 参数） */
  srs?: string;
  /** WMS 协议版本，默认 '1.3.0' */
  version?: '1.1.1' | '1.3.0';
  /** 附加 GetMap 请求参数，会合并到默认参数之上 */
  parameters?: Record<string, string>;
  /** 是否启用 GetFeatureInfo 要素拾取，默认 false */
  enablePickFeatures?: boolean;
  /** GetFeatureInfo 请求地址，未指定时使用 url */
  getFeatureInfoUrl?: string;
}

/** 从 WMS GetCapabilities 生成图层配置时的选项 */
export interface FetchWmsLayerConfigsOptions {
  /** WMS 协议版本，默认 1.3.0 */
  version?: '1.1.1' | '1.3.0';
  /** 是否仅返回具有 Name 的叶子图层，默认 true */
  leafOnly?: boolean;
  /** 按图层名过滤，支持字符串（包含匹配）或正则 */
  layerFilter?: string | RegExp;
  /** 优先使用的坐标系，未找到时回退 EPSG:4326 或服务首个 CRS/SRS */
  preferredCrs?: string;
  /** 传给 fetch 的额外参数（headers、signal 等） */
  fetchOptions?: RequestInit;
}
