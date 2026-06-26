import { WebMapTileServiceImageryProvider } from 'cesium';
import type { CenterAtOptions } from '../types/base.js';
import type { ImageryProvider } from 'cesium';
import type { TiandituLayerOptions } from '../types/tianditu.js';
import {
  TIANDITU_DEFAULT_RECTANGLE,
  TIANDITU_DEFAULT_STYLE,
  TIANDITU_SUBDOMAINS,
  TIANDITU_TILE_FORMAT,
  buildTiandituWmtsServiceInfo,
  resolveTiandituCrs,
  resolveTiandituImageType,
  resolveTiandituMaximumLevel,
  resolveTiandituTileMatrixLabels,
  resolveTiandituTilingScheme,
} from '../utils/tianditu.js';
import { resolveOptionalRectangle } from '../utils/rectangle.js';
import { BaseLayer } from './BaseLayer.js';

/**
 * 天地图 WMTS 图层实现。
 *
 * 内部封装 Cesium {@link WebMapTileServiceImageryProvider}，
 * 预设 tianditu.gov.cn 服务地址、子域名（t0–t7）、瓦片矩阵集与切分方案。
 *
 * 与通用 {@link WmtsLayer} 的区别：
 * - 无需手动填写 url、layer、tileMatrixSetID，只需 `token`、`crs`、`imageType`
 * - 自动处理 EPSG:4326 的 tileMatrixLabels 级别映射
 * - 默认范围为全球（-180°~180°，-85°~85°）
 *
 * @example Web 墨卡托矢量 + 注记
 * ```typescript
 * import { createLayer } from 'wiselayer';
 *
 * const token = 'YOUR_TOKEN';
 * createLayer({ type: 'tianditu', token, imageType: 'vector' }).addTo(viewer);
 * createLayer({ type: 'tianditu', token, imageType: 'vectorAnnotation', zIndex: 1 }).addTo(viewer);
 * ```
 *
 * @example 经纬直投影像
 * ```typescript
 * createLayer({
 *   type: 'tianditu',
 *   token: 'YOUR_TOKEN',
 *   crs: 'EPSG:4326',
 *   imageType: 'imagery',
 * }).addTo(viewer);
 * ```
 */
export class TiandituLayer extends BaseLayer {
  /** 图层协议类型，固定为 `'tianditu'` */
  readonly type = 'tianditu';
  private readonly options: TiandituLayerOptions;

  /**
   * 创建天地图图层实例。
   *
   * @param options - 天地图图层配置，{@link TiandituLayerOptions.token token} 为必填项
   * @throws 当 token 为空时抛出
   */
  constructor(options: TiandituLayerOptions) {
    super(options);

    if (!options.token?.trim()) {
      throw new Error('Tianditu layer requires token');
    }

    this.options = options;
  }

  /**
   * 定位相机到天地图图层范围。
   *
   * 优先使用配置中的 `rectangle`，否则使用全球默认范围（-180°~180°，-85°~85°）。
   *
   * @param options - 飞行动画参数
   */
  centerAt(options?: CenterAtOptions): void {
    this.flyToLayerRectangle(
      this.getProviderRectangle(this.options.rectangle ?? TIANDITU_DEFAULT_RECTANGLE),
      options,
    );
  }

  /** 设置天地图图层的叠放层级 */
  setZIndex(zIndex: number): number {
    return this.applyZIndex(zIndex);
  }

  /**
   * 创建 Cesium WebMapTileServiceImageryProvider。
   *
   * 内置默认值：
   * - crs: `'EPSG:3857'`
   * - imageType: `'vector'`
   * - style: `'default'`
   * - format: `'tiles'`
   * - rectangle: 全球（-180°~180°，-85°~85°）
   * - enablePickFeatures: `false`
   * - subdomains: `'0'`~`'7'`
   */
  toImageryProvider(): ImageryProvider {
    const crs = resolveTiandituCrs(this.options.crs);
    const imageType = resolveTiandituImageType(this.options.imageType);
    const service = buildTiandituWmtsServiceInfo({
      imageType,
      crs,
      token: this.options.token,
    });
    const rectangle = resolveOptionalRectangle(this.options.rectangle ?? TIANDITU_DEFAULT_RECTANGLE);
    const minimumLevel = this.options.minimumLevel ?? 0;
    const maximumLevel = resolveTiandituMaximumLevel(crs, this.options.maximumLevel);
    const tileMatrixLabels = resolveTiandituTileMatrixLabels(crs, minimumLevel, maximumLevel);

    return new WebMapTileServiceImageryProvider({
      url: service.url,
      layer: service.layer,
      style: TIANDITU_DEFAULT_STYLE,
      format: TIANDITU_TILE_FORMAT,
      tileMatrixSetID: service.tileMatrixSetID,
      tilingScheme: resolveTiandituTilingScheme(crs),
      ...(tileMatrixLabels ? { tileMatrixLabels } : {}),
      subdomains: [...TIANDITU_SUBDOMAINS],
      enablePickFeatures: false,
      minimumLevel,
      maximumLevel,
      rectangle,
    });
  }
}
