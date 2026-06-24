import type { ImageryLayer, ImageryLayerCollection } from 'cesium';

/**
 * 将 zIndex 限制在合法范围内 [0, maxIndex]。
 *
 * @param zIndex - 目标层级索引
 * @param maxIndex - 当前 imageryLayers 集合的最大索引
 * @returns 截断后的整数索引
 * @throws 当 zIndex 非有限数值时抛出
 */
export function clampZIndex(zIndex: number, maxIndex: number): number {
  if (!Number.isFinite(zIndex)) {
    throw new Error('zIndex must be a finite number');
  }

  const normalized = Math.trunc(zIndex);
  return Math.max(0, Math.min(normalized, maxIndex));
}

/**
 * 将 ImageryLayer 移动到指定 zIndex 位置。
 *
 * Cesium 不提供直接 setIndex API，通过循环调用 raise/lower 实现。
 * index 越小越靠底，越大越靠上（后渲染，覆盖下层）。
 *
 * @param collection - Viewer 的 imageryLayers 集合
 * @param layer - 要移动的 ImageryLayer 实例
 * @param zIndex - 目标索引
 * @returns 实际生效的索引（经 clamp 后）
 */
export function moveImageryLayerToIndex(
  collection: ImageryLayerCollection,
  layer: ImageryLayer,
  zIndex: number,
): number {
  const maxIndex = collection.length - 1;
  const targetIndex = clampZIndex(zIndex, maxIndex);

  let currentIndex = collection.indexOf(layer);
  if (currentIndex === -1) {
    throw new Error('Imagery layer is not in the viewer');
  }

  while (currentIndex < targetIndex) {
    collection.raise(layer);
    currentIndex += 1;
  }

  while (currentIndex > targetIndex) {
    collection.lower(layer);
    currentIndex -= 1;
  }

  return targetIndex;
}

/**
 * 获取 ImageryLayer 在集合中的当前索引。
 *
 * @throws 当图层不在集合中时抛出
 */
export function getImageryLayerIndex(
  collection: ImageryLayerCollection,
  layer: ImageryLayer,
): number {
  const index = collection.indexOf(layer);
  if (index === -1) {
    throw new Error('Imagery layer is not in the viewer');
  }

  return index;
}
