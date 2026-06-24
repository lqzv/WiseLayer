import { describe, expect, it } from 'vitest';
import { WmtsLayer } from '../src/layers/WmtsLayer.js';

describe('WmtsLayer', () => {
  it('throws when tileMatrixSetID is missing', () => {
    expect(
      () =>
        new WmtsLayer({
          type: 'wmts',
          url: 'https://example.com/wmts',
          layer: 'test',
          tileMatrixSetID: '',
        }),
    ).toThrow('WMTS layer requires tileMatrixSetID');
  });
});
