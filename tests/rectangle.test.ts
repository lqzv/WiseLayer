import { Rectangle } from 'cesium';
import { describe, expect, it } from 'vitest';
import { resolveOptionalRectangle, resolveRectangle } from '../src/utils/rectangle.js';

describe('resolveRectangle', () => {
  it('converts GeoRectangle degrees to Cesium Rectangle', () => {
    const rectangle = resolveRectangle({ west: -180, south: -85, east: 180, north: 85 });

    expect(rectangle).toBeInstanceOf(Rectangle);
    expect(rectangle.west).toBeCloseTo(Rectangle.fromDegrees(-180, -85, 180, 85).west);
    expect(rectangle.north).toBeCloseTo(Rectangle.fromDegrees(-180, -85, 180, 85).north);
  });

  it('returns Cesium Rectangle as-is', () => {
    const input = Rectangle.fromDegrees(-125, 24, -66, 50);
    expect(resolveRectangle(input)).toBe(input);
  });

  it('resolveOptionalRectangle returns undefined when omitted', () => {
    expect(resolveOptionalRectangle()).toBeUndefined();
  });
});
