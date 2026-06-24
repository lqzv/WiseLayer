import { describe, expect, it, vi } from 'vitest';
import { clampZIndex, moveImageryLayerToIndex } from '../src/utils/imageryLayerOrder.js';
import { WmsLayer } from '../src/layers/WmsLayer.js';
import { WmtsLayer } from '../src/layers/WmtsLayer.js';

function createMockCollection(initialLayers: unknown[] = []) {
  const layers = [...initialLayers];

  const syncLength = () => {
    collection.length = layers.length;
  };

  const collection = {
    length: layers.length,
    indexOf(layer: unknown) {
      return layers.indexOf(layer);
    },
    raise(layer: unknown) {
      const index = layers.indexOf(layer);
      if (index < 0 || index >= layers.length - 1) {
        return;
      }
      [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
    },
    lower(layer: unknown) {
      const index = layers.indexOf(layer);
      if (index <= 0) {
        return;
      }
      [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
    },
    addImageryProvider(_provider: unknown) {
      const layer = { id: `layer-${layers.length}` };
      layers.push(layer);
      syncLength();
      return layer;
    },
    remove: vi.fn(),
    getLayers: () => layers,
  };

  syncLength();
  return collection;
}

describe('imageryLayerOrder', () => {
  it('clamps zIndex into valid range', () => {
    expect(clampZIndex(5, 2)).toBe(2);
    expect(clampZIndex(-1, 2)).toBe(0);
    expect(clampZIndex(1.8, 2)).toBe(1);
  });

  it('moves layer to target index', () => {
    const layerA = { id: 'a' };
    const layerB = { id: 'b' };
    const layerC = { id: 'c' };
    const collection = createMockCollection([layerA, layerB, layerC]);

    moveImageryLayerToIndex(collection as never, layerA, 2);

    expect(collection.getLayers()).toEqual([layerB, layerC, layerA]);
  });
});

describe('setZIndex', () => {
  it('WmsLayer applies zIndex after addTo', () => {
    const existingLayer = { id: 'existing' };
    const collection = createMockCollection([existingLayer]);
    const viewer = {
      imageryLayers: collection,
    };

    const wmsLayer = new WmsLayer({
      type: 'wms',
      url: 'https://example.com/wms',
      layers: 'test',
      zIndex: 0,
    });

    wmsLayer.addTo(viewer as never);

    expect(wmsLayer.getZIndex()).toBe(0);
    expect(collection.getLayers().map((layer) => (layer as { id: string }).id)).toEqual([
      'layer-1',
      'existing',
    ]);
  });

  it('WmtsLayer moves to top when setZIndex is called', () => {
    const existingLayer = { id: 'existing' };
    const collection = createMockCollection([existingLayer]);
    const viewer = {
      imageryLayers: collection,
    };

    const wmtsLayer = new WmtsLayer({
      type: 'wmts',
      url: 'https://example.com/wmts',
      layer: 'test',
      tileMatrixSetID: 'EPSG:4326',
    });

    wmtsLayer.addTo(viewer as never);
    const addedLayer = collection.getLayers()[1];
    wmtsLayer.setZIndex(1);

    expect(wmtsLayer.getZIndex()).toBe(1);
    expect(collection.getLayers()[1]).toBe(addedLayer);
  });

  it('throws when layer is not added to viewer', () => {
    const layer = new WmsLayer({
      type: 'wms',
      url: 'https://example.com/wms',
      layers: 'test',
    });

    expect(() => layer.setZIndex(0)).toThrow('Layer must be added to a viewer before setZIndex');
  });
});
