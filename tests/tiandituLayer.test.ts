import { describe, expect, it } from 'vitest';
import { TiandituLayer } from '../src/layers/TiandituLayer.js';
import {
  buildTiandituWmtsServiceInfo,
  resolveTiandituCrs,
  resolveTiandituMaximumLevel,
  resolveTiandituTileMatrixLabels,
  resolveTiandituTilingScheme,
} from '../src/utils/tianditu.js';

describe('TiandituLayer', () => {
  it('throws when token is missing', () => {
    expect(
      () =>
        new TiandituLayer({
          type: 'tianditu',
          token: '',
        }),
    ).toThrow('Tianditu layer requires token');
  });

  it('builds EPSG:3857 vector service info', () => {
    const service = buildTiandituWmtsServiceInfo({
      imageType: 'vector',
      crs: 'EPSG:3857',
      token: 'test-token',
    });

    expect(service).toEqual({
      url: 'https://t{s}.tianditu.gov.cn/vec_w/wmts?tk=test-token',
      layer: 'vec',
      tileMatrixSetID: 'w',
      serviceId: 'vec_w',
    });
  });

  it('builds EPSG:4326 imagery service info', () => {
    const service = buildTiandituWmtsServiceInfo({
      imageType: 'imagery',
      crs: 'EPSG:4326',
      token: 'abc 123',
    });

    expect(service).toEqual({
      url: 'https://t{s}.tianditu.gov.cn/img_c/wmts?tk=abc%20123',
      layer: 'img',
      tileMatrixSetID: 'c',
      serviceId: 'img_c',
    });
  });

  it('uses crs-specific tiling scheme and maximum level defaults', () => {
    expect(resolveTiandituCrs()).toBe('EPSG:3857');
    expect(resolveTiandituTilingScheme('EPSG:3857').constructor.name).toBe(
      'WebMercatorTilingScheme',
    );
    expect(resolveTiandituTilingScheme('EPSG:4326').constructor.name).toBe(
      'GeographicTilingScheme',
    );
    expect(resolveTiandituMaximumLevel('EPSG:3857')).toBe(18);
    expect(resolveTiandituMaximumLevel('EPSG:4326')).toBe(17);
  });

  it('maps cesium tile levels to tianditu 1-based labels for EPSG:4326 only', () => {
    expect(resolveTiandituTileMatrixLabels('EPSG:3857', 0, 17)).toBeUndefined();
    expect(resolveTiandituTileMatrixLabels('EPSG:4326', 0, 2)).toEqual(['1', '2', '3']);
    expect(resolveTiandituTileMatrixLabels('EPSG:4326', 0, 17)).toHaveLength(18);
    expect(resolveTiandituTileMatrixLabels('EPSG:4326', 0, 17)?.[0]).toBe('1');
    expect(resolveTiandituTileMatrixLabels('EPSG:4326', 0, 17)?.[17]).toBe('18');
  });
});
