import { Rectangle, type ImageryLayer, type ImageryProvider, type Viewer } from 'cesium';
import type { LayerRectangle } from '../utils/rectangle.js';
import { resolveOptionalRectangle } from '../utils/rectangle.js';
import type { CenterAtOptions } from '../types/base.js';
import { flyToRectangle, requireViewer } from '../utils/camera.js';
import {
  getImageryLayerIndex,
  moveImageryLayerToIndex,
} from '../utils/imageryLayerOrder.js';

/**
 * 图层公共接口。
 * 定义 WMS、WMTS 等所有图层类型必须实现的标准操作。
 */
export interface ILayer {
  /** 图层唯一标识 */
  readonly id: string;
  /** 图层协议类型，如 'wms'、'wmts' */
  readonly type: string;
  /** 图层显示名称 */
  readonly name: string;
  /** 是否可见 */
  show: boolean;
  /** 透明度，0~1 */
  alpha: number;

  /** 创建底层 Cesium ImageryProvider 实例 */
  toImageryProvider(): ImageryProvider;
  /** 将图层添加到 Viewer 的 imageryLayers 中 */
  addTo(viewer: Viewer): ImageryLayer;
  /** 从 Viewer 中移除并销毁图层 */
  remove(): void;
  /** 设置图层可见性 */
  setVisible(visible: boolean): void;
  /** 设置图层透明度 */
  setAlpha(alpha: number): void;
  /** 相机飞行定位到图层范围 */
  centerAt(options?: CenterAtOptions): void;
  /** 获取当前叠放层级索引 */
  getZIndex(): number;
  /** 设置叠放层级，返回实际生效的索引 */
  setZIndex(zIndex: number): number;
}

/**
 * 图层抽象基类。
 *
 * 封装与 Cesium Viewer 的交互逻辑（添加、移除、显隐、透明度、层级），
 * 子类只需实现 {@link toImageryProvider}、{@link centerAt}、{@link setZIndex}。
 */
export abstract class BaseLayer implements ILayer {
  readonly id: string;
  readonly name: string;
  abstract readonly type: string;

  /** 当前绑定的 Cesium Viewer，remove 后置为 undefined */
  protected viewer: Viewer | undefined;
  /** Cesium ImageryLayer 实例，addTo 后创建 */
  protected imageryLayer: ImageryLayer | undefined;
  /** Cesium ImageryProvider 实例 */
  protected provider: ImageryProvider | undefined;
  /** 用户配置的初始 zIndex，addTo 时自动应用 */
  protected requestedZIndex: number | undefined;

  constructor(options: { id?: string; name?: string; zIndex?: number }) {
    this.id = options.id ?? crypto.randomUUID();
    this.name = options.name ?? this.id;
    this.requestedZIndex = options.zIndex;
  }

  /** 子类实现：根据协议配置创建 Cesium ImageryProvider */
  abstract toImageryProvider(): ImageryProvider;
  /** 子类实现：定位相机到图层范围 */
  abstract centerAt(options?: CenterAtOptions): void;
  /** 子类实现：设置图层叠放顺序 */
  abstract setZIndex(zIndex: number): number;

  get show(): boolean {
    return this.imageryLayer?.show ?? true;
  }

  set show(value: boolean) {
    if (this.imageryLayer) {
      this.imageryLayer.show = value;
    }
  }

  get alpha(): number {
    return this.imageryLayer?.alpha ?? 1;
  }

  set alpha(value: number) {
    if (this.imageryLayer) {
      this.imageryLayer.alpha = value;
    }
  }

  /**
   * 将图层添加到 Viewer。
   * 若已添加则先移除旧实例，再创建新的 ImageryProvider 并加入 imageryLayers。
   * 若配置了 zIndex，添加完成后自动调整叠放顺序。
   */
  addTo(viewer: Viewer): ImageryLayer {
    this.remove();

    this.viewer = viewer;
    this.provider = this.toImageryProvider();
    this.imageryLayer = viewer.imageryLayers.addImageryProvider(this.provider);

    if (this.requestedZIndex !== undefined) {
      this.setZIndex(this.requestedZIndex);
    }

    return this.imageryLayer;
  }

  /** 从 Viewer 移除图层并释放相关引用 */
  remove(): void {
    if (this.imageryLayer && this.viewer) {
      this.viewer.imageryLayers.remove(this.imageryLayer, true);
    }

    this.viewer = undefined;
    this.imageryLayer = undefined;
    this.provider = undefined;
  }

  setVisible(visible: boolean): void {
    this.show = visible;
  }

  setAlpha(alpha: number): void {
    this.alpha = alpha;
  }

  /**
   * 获取图层在 imageryLayers 中的当前索引。
   * @throws 图层未 addTo 时抛出
   */
  getZIndex(): number {
    const viewer = requireViewer(this.viewer, 'getZIndex');
    const imageryLayer = this.requireImageryLayer('getZIndex');
    return getImageryLayerIndex(viewer.imageryLayers, imageryLayer);
  }

  /**
   * 将 ImageryLayer 移动到指定 zIndex（供子类 setZIndex 调用）。
   * @returns 经 clamp 后实际生效的索引
   */
  protected applyZIndex(zIndex: number): number {
    const viewer = requireViewer(this.viewer, 'setZIndex');
    const imageryLayer = this.requireImageryLayer('setZIndex');
    const appliedIndex = moveImageryLayerToIndex(viewer.imageryLayers, imageryLayer, zIndex);
    this.requestedZIndex = appliedIndex;
    return appliedIndex;
  }

  /** 断言 ImageryLayer 已创建，用于需要图层实例的操作前检查 */
  protected requireImageryLayer(method: string): ImageryLayer {
    if (!this.imageryLayer) {
      throw new Error(`Layer must be added to a viewer before ${method}`);
    }

    return this.imageryLayer;
  }

  /** 相机飞行到指定矩形范围（供子类 centerAt 调用） */
  protected flyToLayerRectangle(rectangle: Rectangle, options?: CenterAtOptions): void {
    flyToRectangle(requireViewer(this.viewer, 'centerAt'), rectangle, options);
  }

  /**
   * 获取用于 centerAt 的地理范围。
   * 优先级：用户配置的 rectangle > ImageryProvider.rectangle
   */
  protected getProviderRectangle(fallbackRectangle?: LayerRectangle): Rectangle {
    const resolvedFallback = resolveOptionalRectangle(fallbackRectangle);
    if (resolvedFallback) {
      return resolvedFallback;
    }

    const provider = this.provider ?? this.toImageryProvider();
    return provider.rectangle;
  }
}
