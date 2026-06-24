import { Rectangle } from 'cesium';

/**
 * WGS84 经纬度矩形（度），可直接用 JSON 配置。
 *
 * @example
 * ```json
 * { "west": -180, "south": -85, "east": 180, "north": 85 }
 * ```
 */
export interface GeoRectangle {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** 图层范围：Cesium Rectangle 或 JSON 经纬度对象 */
export type LayerRectangle = Rectangle | GeoRectangle;

function isGeoRectangle(value: LayerRectangle): value is GeoRectangle {
  return (
    typeof value === 'object' &&
    value !== null &&
    !(value instanceof Rectangle) &&
    typeof value.west === 'number' &&
    typeof value.south === 'number' &&
    typeof value.east === 'number' &&
    typeof value.north === 'number'
  );
}

/**
 * 将图层范围配置解析为 Cesium Rectangle。
 *
 * @param rectangle - Cesium Rectangle 或 {@link GeoRectangle}（度）
 */
export function resolveRectangle(rectangle: LayerRectangle): Rectangle {
  if (rectangle instanceof Rectangle) {
    return rectangle;
  }

  if (isGeoRectangle(rectangle)) {
    return Rectangle.fromDegrees(rectangle.west, rectangle.south, rectangle.east, rectangle.north);
  }

  throw new Error('Invalid rectangle: expected Cesium Rectangle or { west, south, east, north } in degrees');
}

/**
 * 可选图层范围解析，未配置时返回 undefined。
 */
export function resolveOptionalRectangle(rectangle?: LayerRectangle): Rectangle | undefined {
  return rectangle === undefined ? undefined : resolveRectangle(rectangle);
}
