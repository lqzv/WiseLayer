import type { LayerRectangle } from '../utils/rectangle.js';

/**
 * 所有图层类型共享的基础配置项。
 * WMS、WMTS 图层均继承此接口中的通用字段。
 */
export interface BaseLayerOptions {
  /** 图层唯一标识，未指定时自动生成 UUID */
  id?: string;
  /** 图层显示名称，未指定时使用 id */
  name?: string;
  /** 是否可见，默认 true（需在 addTo 之后通过 setVisible 生效） */
  show?: boolean;
  /** 图层透明度，取值范围 0~1，默认 1 */
  alpha?: number;
  /** 最小缩放级别（瓦片层级下限） */
  minimumLevel?: number;
  /** 最大缩放级别（瓦片层级上限） */
  maximumLevel?: number;
  /**
   * 图层地理范围。
   * 支持 Cesium Rectangle，或 JSON 经纬度对象 `{ west, south, east, north }`（单位：度）。
   * 用于限制瓦片加载范围，也是 centerAt 定位时的优先范围来源。
   */
  rectangle?: LayerRectangle;
  /**
   * 图层叠放顺序（z 轴索引）。
   * 数值越大越靠上显示；在 addTo 时自动应用。
   * 与 Cesium imageryLayers 的 index 一致：0 为最底层。
   */
  zIndex?: number;
}

/**
 * centerAt（定位到图层）方法的可选参数。
 */
export interface CenterAtOptions {
  /** 相机飞行动画时长（秒），默认 2 */
  duration?: number;
}
