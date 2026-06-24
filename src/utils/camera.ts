import type { ILayer } from '../layers/BaseLayer.js';
import type { CenterAtOptions } from '../types/base.js';
import { Rectangle, type Viewer } from 'cesium';

/**
 * 将相机飞行到指定矩形范围。
 *
 * @param viewer - Cesium Viewer 实例
 * @param rectangle - 目标地理范围（弧度）
 * @param options - 飞行动画配置
 * @throws 当 rectangle 为全球范围（MAX_VALUE）时抛出，表示无法定位
 */
export function flyToRectangle(
  viewer: Viewer,
  rectangle: Rectangle,
  options?: CenterAtOptions,
): void {
  if (Rectangle.equals(rectangle, Rectangle.MAX_VALUE)) {
    throw new Error('Layer has no bounded extent to center on');
  }

  viewer.camera.flyTo({
    destination: rectangle,
    duration: options?.duration ?? 2,
  });
}

/**
 * 断言 Viewer 已绑定，否则抛出明确错误信息。
 *
 * @param viewer - 可能为 undefined 的 Viewer 引用
 * @param method - 调用此方法的操作名称，用于错误提示
 */
export function requireViewer(viewer: Viewer | undefined, method: string): Viewer {
  if (!viewer) {
    throw new Error(`Layer must be added to a viewer before ${method}`);
  }

  return viewer;
}

/**
 * 断言图层实例支持 centerAt 方法。
 * 预留用于未来扩展更多图层类型时的运行时检查。
 */
export function assertLayerSupportsCenterAt(layer: ILayer): void {
  if (typeof layer.centerAt !== 'function') {
    throw new Error(`Layer type "${layer.type}" does not support centerAt`);
  }
}
