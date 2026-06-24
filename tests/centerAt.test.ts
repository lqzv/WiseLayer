import { Rectangle } from 'cesium';
import { describe, expect, it, vi } from 'vitest';
import { WmsLayer } from '../src/layers/WmsLayer.js';
import { WmtsLayer } from '../src/layers/WmtsLayer.js';

const usBounds = Rectangle.fromDegrees(-125, 24, -66, 50);

function createMockViewer() {
  return {
    camera: {
      flyTo: vi.fn(),
    },
    imageryLayers: {
      addImageryProvider: vi.fn(() => ({})),
      remove: vi.fn(),
    },
  };
}

describe('centerAt', () => {
  it('WmsLayer flies to configured rectangle', () => {
    const viewer = createMockViewer();
    const layer = new WmsLayer({
      type: 'wms',
      url: 'https://example.com/wms',
      layers: 'test',
      rectangle: usBounds,
    });

    layer.addTo(viewer as never);
    layer.centerAt({ duration: 1.5 });

    expect(viewer.camera.flyTo).toHaveBeenCalledWith({
      destination: usBounds,
      duration: 1.5,
    });
  });

  it('WmtsLayer flies to configured rectangle', () => {
    const viewer = createMockViewer();
    const layer = new WmtsLayer({
      type: 'wmts',
      url: 'https://example.com/wmts',
      layer: 'test',
      tileMatrixSetID: 'EPSG:4326',
      rectangle: usBounds,
    });

    layer.addTo(viewer as never);
    layer.centerAt();

    expect(viewer.camera.flyTo).toHaveBeenCalledWith({
      destination: usBounds,
      duration: 2,
    });
  });

  it('throws when layer is not added to viewer', () => {
    const layer = new WmsLayer({
      type: 'wms',
      url: 'https://example.com/wms',
      layers: 'test',
      rectangle: usBounds,
    });

    expect(() => layer.centerAt()).toThrow('Layer must be added to a viewer before centerAt');
  });

  it('throws when layer extent is unbounded', () => {
    const viewer = createMockViewer();
    const layer = new WmsLayer({
      type: 'wms',
      url: 'https://example.com/wms',
      layers: 'test',
    });

    layer.addTo(viewer as never);

    expect(() => layer.centerAt()).toThrow('Layer has no bounded extent to center on');
  });
});
