import { describe, expect, it } from 'vitest';
import { resolveWmsSpatialReference, resolveWmsVersion } from '../src/utils/crs.js';

describe('resolveWmsVersion', () => {
  it('defaults to 1.3.0', () => {
    expect(resolveWmsVersion()).toBe('1.3.0');
  });
});

describe('resolveWmsSpatialReference', () => {
  it('uses crs for WMS 1.3.0', () => {
    expect(
      resolveWmsSpatialReference({
        version: '1.3.0',
        crs: 'EPSG:3857',
      }),
    ).toEqual({ crs: 'EPSG:3857' });
  });

  it('uses srs for WMS 1.1.1', () => {
    expect(
      resolveWmsSpatialReference({
        version: '1.1.1',
        crs: 'EPSG:4326',
      }),
    ).toEqual({ srs: 'EPSG:4326' });
  });

  it('defaults to EPSG:4326', () => {
    expect(resolveWmsSpatialReference({})).toEqual({ crs: 'EPSG:4326' });
  });
});
