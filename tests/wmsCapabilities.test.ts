// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest';
import {
  createLayer,
  createWmsLayerOptionsFromCapabilities,
} from '../src/factory/createLayer.js';
import { parseWmsCapabilitiesXml, buildGetCapabilitiesUrl } from '../src/utils/wmsCapabilities.js';
import { WmsLayer } from '../src/layers/WmsLayer.js';

const sampleCapabilities130 = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms">
  <Capability>
    <Request>
      <GetMap>
        <Format>image/png</Format>
        <Format>image/jpeg</Format>
        <DCPType>
          <HTTP>
            <Get>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://example.com/geoserver/wms" />
            </Get>
          </HTTP>
        </DCPType>
      </GetMap>
    </Request>
    <Layer>
      <Title>Root</Title>
      <CRS>EPSG:4326</CRS>
      <CRS>EPSG:3857</CRS>
      <Layer>
        <Name>topp:states</Name>
        <Title>USA Population</Title>
        <CRS>EPSG:4326</CRS>
        <Style>
          <Name>population</Name>
        </Style>
        <EX_GeographicBoundingBox>
          <westBoundLongitude>-124.731422</westBoundLongitude>
          <eastBoundLongitude>-66.969849</eastBoundLongitude>
          <southBoundLatitude>24.955967</southBoundLatitude>
          <northBoundLatitude>49.371735</northBoundLatitude>
        </EX_GeographicBoundingBox>
      </Layer>
      <Layer>
        <Name>topp:roads</Name>
        <Title>Roads</Title>
        <CRS>EPSG:4326</CRS>
      </Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

describe('buildGetCapabilitiesUrl', () => {
  it('builds standard GetCapabilities url', () => {
    const url = buildGetCapabilitiesUrl('https://example.com/geoserver/wms', '1.3.0');
    expect(url).toContain('service=WMS');
    expect(url).toContain('request=GetCapabilities');
    expect(url).toContain('version=1.3.0');
  });
});

describe('parseWmsCapabilitiesXml', () => {
  it('parses named leaf layers into WmsLayerOptions', () => {
    const configs = parseWmsCapabilitiesXml(
      sampleCapabilities130,
      'https://example.com/geoserver/wms',
    );

    expect(configs).toHaveLength(2);
    expect(configs[0]).toMatchObject({
      type: 'wms',
      url: 'https://example.com/geoserver/wms',
      layers: 'topp:states',
      name: 'USA Population',
      crs: 'EPSG:4326',
      version: '1.3.0',
      styles: 'population',
      format: 'image/png',
    });
    expect(configs[0].rectangle).toBeDefined();
  });

  it('filters layers by layerFilter', () => {
    const configs = parseWmsCapabilitiesXml(
      sampleCapabilities130,
      'https://example.com/geoserver/wms',
      { layerFilter: 'states' },
    );

    expect(configs).toHaveLength(1);
    expect(configs[0]?.layers).toBe('topp:states');
  });
});

describe('createWmsLayerOptionsFromCapabilities', () => {
  it('fetches capabilities and returns WmsLayerOptions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => sampleCapabilities130,
      }),
    );

    const configs = await createWmsLayerOptionsFromCapabilities('https://example.com/geoserver/wms', {
      layerFilter: /states/,
    });

    expect(configs).toHaveLength(1);
    expect(configs[0]?.layers).toBe('topp:states');

    vi.unstubAllGlobals();
  });
});

describe('createLayer from capabilities configs', () => {
  it('creates WmsLayer from parsed configs', () => {
    const configs = parseWmsCapabilitiesXml(
      sampleCapabilities130,
      'https://example.com/geoserver/wms',
      { layerFilter: 'roads' },
    );
    const layers = configs.map((config) => createLayer(config));

    expect(layers).toHaveLength(1);
    expect(layers[0]).toBeInstanceOf(WmsLayer);
  });
});
