/**
 * 图层类型定义模块。
 * 统一导出 WMS、WMTS、天地图及公共配置类型。
 */

export type { BaseLayerOptions, CenterAtOptions } from './base.js';
export type { WmsLayerOptions, FetchWmsLayerConfigsOptions } from './wms.js';
export type { WmtsLayerOptions, FetchWmtsLayerConfigsOptions } from './wmts.js';
export type {
  TiandituLayerOptions,
  TiandituImageType,
  TiandituCrs,
} from './tianditu.js';

import type { WmsLayerOptions } from './wms.js';
import type { WmtsLayerOptions } from './wmts.js';
import type { TiandituLayerOptions } from './tianditu.js';

/** 所有支持的图层配置联合类型，由 type 字段区分具体协议 */
export type LayerOptions = WmsLayerOptions | WmtsLayerOptions | TiandituLayerOptions;

/** 图层协议类型字面量：'wms' | 'wmts' | 'tianditu' */
export type LayerType = LayerOptions['type'];
