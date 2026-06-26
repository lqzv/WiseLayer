import type { BaseLayerOptions } from './base.js';

/**
 * 天地图 WMTS 服务支持的坐标参考系。
 *
 * | 值 | 说明 | 天地图 TileMatrixSet | Cesium 切分方案 |
 * |----|------|----------------------|-----------------|
 * | `EPSG:3857` | Web 墨卡托（默认） | `w` | WebMercatorTilingScheme |
 * | `EPSG:4326` | 经纬直投 | `c` | GeographicTilingScheme |
 */
export type TiandituCrs = 'EPSG:3857' | 'EPSG:4326';

/**
 * 天地图影像类型，对应 WMTS Layer 标识。
 *
 * | 值 | WMTS Layer | 说明 |
 * |----|------------|------|
 * | `vector` | vec | 矢量底图 |
 * | `imagery` | img | 影像底图 |
 * | `vectorAnnotation` | cva | 矢量注记（叠加在矢量底图之上） |
 * | `imageryAnnotation` | cia | 影像注记（叠加在影像底图之上） |
 *
 * 完整底图通常需要 **底图 + 注记** 两层，例如 `vector` + `vectorAnnotation`。
 */
export type TiandituImageType =
  | 'vector'
  | 'imagery'
  | 'vectorAnnotation'
  | 'imageryAnnotation';

/**
 * 天地图 WMTS 图层配置项。
 *
 * 封装国家地理信息公共服务平台（tianditu.gov.cn）标准 WMTS 服务，
 * 自动处理服务地址、子域名、瓦片矩阵集、切分方案及 EPSG:4326 级别映射。
 *
 * Token 需在 [天地图开发者控制台](https://console.tianditu.gov.cn/) 申请。
 *
 * @example 矢量底图 + 注记（Web 墨卡托）
 * ```typescript
 * const token = 'YOUR_TOKEN';
 * const base = createLayer({ type: 'tianditu', token, imageType: 'vector' });
 * const label = createLayer({ type: 'tianditu', token, imageType: 'vectorAnnotation', zIndex: 1 });
 * base.addTo(viewer);
 * label.addTo(viewer);
 * ```
 *
 * @example 影像底图（经纬直投）
 * ```typescript
 * createLayer({
 *   type: 'tianditu',
 *   token: 'YOUR_TOKEN',
 *   crs: 'EPSG:4326',
 *   imageType: 'imagery',
 * }).addTo(viewer);
 * ```
 *
 * @see {@link TiandituLayer}
 */
export interface TiandituLayerOptions extends BaseLayerOptions {
  /** 图层协议类型，固定为 `'tianditu'` */
  type: 'tianditu';
  /** 天地图 API Token（tk），在开发者控制台申请 */
  token: string;
  /**
   * 坐标参考系。
   * @defaultValue `'EPSG:3857'`
   */
  crs?: TiandituCrs;
  /**
   * 影像类型。
   * @defaultValue `'vector'`
   */
  imageType?: TiandituImageType;
}
