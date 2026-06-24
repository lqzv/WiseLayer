import { WebMapTileServiceImageryProvider } from 'cesium';
import type { CenterAtOptions } from '../types/base.js';
import type { ImageryProvider } from 'cesium';
import type { WmtsLayerOptions } from '../types/wmts.js';
import { resolveOptionalRectangle } from '../utils/rectangle.js';
import { BaseLayer } from './BaseLayer.js';

/**
 * WMTS 图层实现。
 *
 * 内部封装 Cesium {@link WebMapTileServiceImageryProvider}，
 * 支持 KVP 与 RESTful 两种 URL 形式。
 */
export class WmtsLayer extends BaseLayer {
  readonly type = 'wmts';
  private readonly options: WmtsLayerOptions;

  constructor(options: WmtsLayerOptions) {
    super(options);

    if (!options.tileMatrixSetID) {
      throw new Error('WMTS layer requires tileMatrixSetID');
    }

    this.options = options;
  }

  /**
   * 定位相机到 WMTS 图层范围。
   * 全球覆盖的 WMTS 服务需显式配置 rectangle，否则无法定位。
   */
  centerAt(options?: CenterAtOptions): void {
    this.flyToLayerRectangle(this.getProviderRectangle(this.options.rectangle), options);
  }

  /** 设置 WMTS 图层的叠放层级 */
  setZIndex(zIndex: number): number {
    return this.applyZIndex(zIndex);
  }

  /**
   * 创建 Cesium WebMapTileServiceImageryProvider。
   *
   * 默认参数：
   * - style: default
   * - format: image/png
   * - enablePickFeatures: false
   */
  toImageryProvider(): ImageryProvider {
    const rectangle = resolveOptionalRectangle(this.options.rectangle);

    return new WebMapTileServiceImageryProvider({
      url: this.options.url,
      layer: this.options.layer,
      style: this.options.style ?? 'default',
      format: this.options.format ?? 'image/png',
      tileMatrixSetID: this.options.tileMatrixSetID,
      enablePickFeatures: this.options.enablePickFeatures ?? false,
      ...(this.options.getFeatureInfoUrl
        ? { getFeatureInfoUrl: this.options.getFeatureInfoUrl }
        : {}),
      ...(this.options.tilingScheme ? { tilingScheme: this.options.tilingScheme } : {}),
      ...(this.options.subdomains !== undefined ? { subdomains: this.options.subdomains } : {}),
      ...(this.options.minimumLevel !== undefined
        ? { minimumLevel: this.options.minimumLevel }
        : {}),
      ...(this.options.maximumLevel !== undefined
        ? { maximumLevel: this.options.maximumLevel }
        : {}),
      ...(rectangle !== undefined ? { rectangle } : {}),
    });
  }
}
