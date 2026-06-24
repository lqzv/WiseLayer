import { describe, expect, it, vi } from 'vitest';

const removeAll = vi.fn();

vi.mock('cesium', () => ({
  Viewer: vi.fn((_container: unknown, options: Record<string, unknown>) => ({
    options,
    imageryLayers: { removeAll },
  })),
}));

import { Viewer } from 'cesium';
import { createViewer } from '../src/viewer/createViewer.js';

describe('createViewer', () => {
  it('creates Viewer with default UI options and clears imagery layers', () => {
    removeAll.mockClear();

    const viewer = createViewer('cesiumContainer');

    expect(Viewer).toHaveBeenCalledWith('cesiumContainer', {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      baseLayer: false,
    });
    expect(removeAll).toHaveBeenCalledOnce();
    expect(viewer).toBeDefined();
  });

  it('merges custom options and can skip clearing imagery layers', () => {
    removeAll.mockClear();

    createViewer('map', {
      geocoder: true,
      clearImageryLayers: false,
    });

    expect(Viewer).toHaveBeenCalledWith('map', expect.objectContaining({ geocoder: true }));
    expect(removeAll).not.toHaveBeenCalled();
  });
});
