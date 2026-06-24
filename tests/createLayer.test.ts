import { describe, expect, it } from 'vitest';
import { createLayer } from '../src/factory/createLayer.js';
import { WmsLayer } from '../src/layers/WmsLayer.js';
import { WmtsLayer } from '../src/layers/WmtsLayer.js';
import type { LayerOptions } from '../src/types/index.js';

describe('createLayer', () => {
  it('creates WmsLayer for wms type', () => {
    const layer = createLayer({
      type: 'wms',
      url: 'https://example.com/wms',
      layers: 'test',
    });

    expect(layer).toBeInstanceOf(WmsLayer);
    expect(layer.type).toBe('wms');
  });

  it('creates WmtsLayer for wmts type', () => {
    const layer = createLayer({
      type: 'wmts',
      url: 'https://example.com/wmts',
      layer: 'test',
      tileMatrixSetID: 'EPSG:4326',
    });

    expect(layer).toBeInstanceOf(WmtsLayer);
    expect(layer.type).toBe('wmts');
  });

  it('throws for unsupported layer type', () => {
    expect(() =>
      createLayer({
        type: 'xyz',
        url: 'https://example.com',
        layers: 'test',
      } as LayerOptions),
    ).toThrow('Unsupported layer type');
  });
});
