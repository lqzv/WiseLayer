// @vitest-environment happy-dom

import { Rectangle } from 'cesium';
import { describe, expect, it, vi } from 'vitest';
import {
  createLayer,
  createWmtsLayerOptionsFromCapabilities,
} from '../src/factory/createLayer.js';
import {
  buildWmtsGetCapabilitiesUrl,
  parseWmtsCapabilitiesXml,
} from '../src/utils/wmtsCapabilities.js';
import { WmtsLayer } from '../src/layers/WmtsLayer.js';

const sampleWmtsCapabilities = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities xmlns="http://www.opengis.net/wmts/1.0"
  xmlns:ows="http://www.opengis.net/ows/1.1"
  version="1.0.0">
  <Contents>
    <Layer>
      <ows:Title>World Imagery</ows:Title>
      <ows:Identifier>World_Imagery</ows:Identifier>
      <Style isDefault="true">
        <ows:Identifier>default</ows:Identifier>
      </Style>
      <Format>image/jpeg</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>default028mm</TileMatrixSet>
      </TileMatrixSetLink>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ResourceURL format="image/jpeg" resourceType="tile"
        template="https://example.com/wmts/tile/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg" />
      <ows:WGS84BoundingBox>
        <ows:LowerCorner>-180 -85</ows:LowerCorner>
        <ows:UpperCorner>180 85</ows:UpperCorner>
      </ows:WGS84BoundingBox>
    </Layer>
    <Layer>
      <ows:Identifier>World_Street_Map</ows:Identifier>
      <Style isDefault="true">
        <ows:Identifier>default</ows:Identifier>
      </Style>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>EPSG:3857</TileMatrixSet>
      </TileMatrixSetLink>
    </Layer>
  </Contents>
  <OperationsMetadata>
    <Operation name="GetTile">
      <DCP>
        <HTTP>
          <Get>
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
              xlink:href="https://example.com/wmts" />
          </Get>
        </HTTP>
      </DCP>
    </Operation>
  </OperationsMetadata>
</Capabilities>`;

describe('buildWmtsGetCapabilitiesUrl', () => {
  it('builds standard GetCapabilities url', () => {
    const url = buildWmtsGetCapabilitiesUrl('https://example.com/wmts');
    expect(url).toContain('service=WMTS');
    expect(url).toContain('request=GetCapabilities');
    expect(url).toContain('version=1.0.0');
  });
});

describe('parseWmtsCapabilitiesXml', () => {
  it('parses layers into WmtsLayerOptions', () => {
    const configs = parseWmtsCapabilitiesXml(
      sampleWmtsCapabilities,
      'https://example.com/wmts',
    );

    expect(configs.length).toBeGreaterThanOrEqual(2);
    expect(configs[0]).toMatchObject({
      type: 'wmts',
      layer: 'World_Imagery',
      name: 'World Imagery',
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible',
      url: 'https://example.com/wmts/tile/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    });
    expect(configs[0].rectangle).toBeDefined();
  });

  it('filters layers by layerFilter', () => {
    const configs = parseWmtsCapabilitiesXml(
      sampleWmtsCapabilities,
      'https://example.com/wmts',
      { layerFilter: 'Street' },
    );

    expect(configs).toHaveLength(1);
    expect(configs[0]?.layer).toBe('World_Street_Map');
  });

  it('uses KVP url when ResourceURL template is absent', () => {
    const configs = parseWmtsCapabilitiesXml(
      sampleWmtsCapabilities,
      'https://example.com/wmts',
      { layerFilter: 'Street' },
    );

    expect(configs[0]?.url).toBe('https://example.com/wmts');
  });

  it('generates config for each tile matrix set when allTileMatrixSets is true', () => {
    const configs = parseWmtsCapabilitiesXml(
      sampleWmtsCapabilities,
      'https://example.com/wmts',
      { layerFilter: 'Imagery', allTileMatrixSets: true },
    );

    expect(configs).toHaveLength(2);
    expect(configs.map((item) => item.tileMatrixSetID)).toEqual([
      'default028mm',
      'GoogleMapsCompatible',
    ]);
  });

  it('creates geographic rectangle from WGS84BoundingBox', () => {
    const configs = parseWmtsCapabilitiesXml(
      sampleWmtsCapabilities,
      'https://example.com/wmts',
      { layerFilter: 'Imagery' },
    );

    const expected = Rectangle.fromDegrees(-180, -85, 180, 85);
    expect(configs[0]?.rectangle && Rectangle.equals(configs[0].rectangle, expected)).toBe(true);
  });
});

describe('createWmtsLayerOptionsFromCapabilities', () => {
  it('fetches capabilities and returns WmtsLayerOptions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => sampleWmtsCapabilities,
      }),
    );

    const configs = await createWmtsLayerOptionsFromCapabilities('https://example.com/wmts', {
      layerFilter: /Imagery/,
    });

    expect(configs).toHaveLength(1);
    expect(configs[0]?.layer).toBe('World_Imagery');

    vi.unstubAllGlobals();
  });
});

describe('createLayer from capabilities configs', () => {
  it('creates WmtsLayer from parsed configs', () => {
    const configs = parseWmtsCapabilitiesXml(
      sampleWmtsCapabilities,
      'https://example.com/wmts',
      { layerFilter: 'Street' },
    );
    const layers = configs.map((config) => createLayer(config));

    expect(layers).toHaveLength(1);
    expect(layers[0]).toBeInstanceOf(WmtsLayer);
  });
});
