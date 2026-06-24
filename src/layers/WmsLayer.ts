import { WebMapServiceImageryProvider } from 'cesium';
import type { CenterAtOptions } from '../types/base.js';
import type { ImageryProvider } from 'cesium';
import type { WmsLayerOptions } from '../types/wms.js';
import { resolveWmsSpatialReference, resolveWmsVersion } from '../utils/crs.js';
import { resolveOptionalRectangle } from '../utils/rectangle.js';
import { mergeParameters } from '../utils/url.js';
import { BaseLayer } from './BaseLayer.js';

/**
 * WMS 图层实现。
 *
 * 内部封装 Cesium {@link WebMapServiceImageryProvider}，
 * 自动处理 WMS 1.1.x / 1.3.0 的 crs/srs 差异及默认 GetMap 参数。
 */
export class WmsLayer extends BaseLayer {
  readonly type = 'wms';
  private readonly options: WmsLayerOptions;

  constructor(options: WmsLayerOptions) {
    super(options);
    this.options = options;
  }

  /**
   * 定位相机到 WMS 图层范围。
   * 优先使用配置中的 rectangle，否则读取 Provider 的范围。
   */
  centerAt(options?: CenterAtOptions): void {
    this.flyToLayerRectangle(this.getProviderRectangle(this.options.rectangle), options);
  }

  /** 设置 WMS 图层的叠放层级 */
  setZIndex(zIndex: number): number {
    return this.applyZIndex(zIndex);
  }

  /**
   * 创建 Cesium WebMapServiceImageryProvider。
   *
   * 默认参数：
   * - transparent: true
   * - format: image/png
   * - enablePickFeatures: false
   */
  toImageryProvider(): ImageryProvider {
    const version = resolveWmsVersion(this.options.version);
    const spatialRef = resolveWmsSpatialReference({
      version,
      crs: this.options.crs,
      srs: this.options.srs,
    });

    const parameters = mergeParameters(
      {
        transparent: 'true',
        format: this.options.format ?? 'image/png',
        ...(this.options.styles ? { styles: this.options.styles } : {}),
      },
      this.options.parameters,
    );

    const rectangle = resolveOptionalRectangle(this.options.rectangle);

    return new WebMapServiceImageryProvider({
      url: this.options.url,
      layers: this.options.layers,
      parameters,
      ...spatialRef,
      enablePickFeatures: this.options.enablePickFeatures ?? false,
      ...(this.options.getFeatureInfoUrl
        ? { getFeatureInfoUrl: this.options.getFeatureInfoUrl }
        : {}),
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
