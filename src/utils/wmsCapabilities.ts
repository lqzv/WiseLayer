import { Rectangle } from 'cesium';
import type { FetchWmsLayerConfigsOptions, WmsLayerOptions } from '../types/wms.js';
import {
  getBaseHref,
  getDirectChildElements,
  getDirectChildText,
  matchesLayerFilter,
  normalizeServiceUrl,
  parseXmlDocument,
  readNumber,
  readOnlineResourceHref,
} from './xml.js';

export type { FetchWmsLayerConfigsOptions };

interface ParsedWmsLayer {
  name: string;
  title?: string;
  crsList: string[];
  style?: string;
  geographicBounds?: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
}

/**
 * 构建 WMS GetCapabilities 请求 URL。
 */
export function buildGetCapabilitiesUrl(
  serviceUrl: string,
  version: '1.1.1' | '1.3.0' = '1.3.0',
): string {
  const url = new URL(serviceUrl, getBaseHref());
  url.searchParams.set('service', 'WMS');
  url.searchParams.set('request', 'GetCapabilities');
  url.searchParams.set('version', version);
  return url.toString();
}

/**
 * 请求 WMS GetCapabilities 并解析为 WmsLayerOptions 数组。
 */
export async function fetchWmsLayerConfigs(
  serviceUrl: string,
  options: FetchWmsLayerConfigsOptions = {},
): Promise<WmsLayerOptions[]> {
  const version = options.version ?? '1.3.0';
  const capabilitiesUrl = buildGetCapabilitiesUrl(serviceUrl, version);
  const response = await fetch(capabilitiesUrl, options.fetchOptions);

  if (!response.ok) {
    throw new Error(`WMS GetCapabilities request failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  return parseWmsCapabilitiesXml(xml, serviceUrl, options);
}

/**
 * 解析 WMS GetCapabilities XML 文档。
 */
export function parseWmsCapabilitiesXml(
  xml: string,
  serviceUrl: string,
  options: FetchWmsLayerConfigsOptions = {},
): WmsLayerOptions[] {
  const version = options.version ?? detectWmsVersion(xml) ?? '1.3.0';
  const document = parseXmlDocument(xml, 'WMS Capabilities');
  const getMapUrl = extractGetMapUrl(document) ?? normalizeServiceUrl(serviceUrl);
  const defaultFormat = extractDefaultFormat(document) ?? 'image/png';
  const capabilityLayer = findCapabilityRootLayer(document);

  if (!capabilityLayer) {
    throw new Error('WMS Capabilities document does not contain a Capability/Layer element');
  }

  const parsedLayers = collectWmsLayers(capabilityLayer, version, options.leafOnly ?? true);
  const filteredLayers = parsedLayers.filter((layer) => matchesLayerFilter(layer.name, options.layerFilter));

  return filteredLayers.map((layer) =>
    toWmsLayerOptions(layer, {
      getMapUrl,
      version,
      defaultFormat,
      preferredCrs: options.preferredCrs,
    }),
  );
}

function detectWmsVersion(xml: string): '1.1.1' | '1.3.0' | undefined {
  const match = xml.match(/<WMS_Capabilities[^>]*version="(1\.1\.1|1\.3\.0)"/i);
  return match?.[1] as '1.1.1' | '1.3.0' | undefined;
}

function findCapabilityRootLayer(document: Document): Element | null {
  const capability =
    document.querySelector('Capability') ??
    document.querySelector('WMT_MS_Capabilities Capability') ??
    document.querySelector('WMS_Capabilities Capability');

  return capability?.querySelector(':scope > Layer') ?? capability?.querySelector('Layer') ?? null;
}

function extractGetMapUrl(document: Document): string | undefined {
  const onlineResource =
    document.querySelector('Capability Request GetMap DCPType HTTP Get OnlineResource') ??
    document.querySelector('GetMap OnlineResource');

  return onlineResource ? readOnlineResourceHref(onlineResource) : undefined;
}

function extractDefaultFormat(document: Document): string | undefined {
  const formats = Array.from(document.querySelectorAll('Capability Request GetMap Format')).map(
    (node) => node.textContent?.trim() ?? '',
  );

  const preferred = formats.find((format) => format === 'image/png' || format === 'image/jpeg');
  return preferred ?? formats[0];
}

function collectWmsLayers(rootLayer: Element, version: '1.1.1' | '1.3.0', leafOnly: boolean): ParsedWmsLayer[] {
  const result: ParsedWmsLayer[] = [];
  walkLayerElement(rootLayer, version, leafOnly, result, true);
  return result;
}

function walkLayerElement(
  layerElement: Element,
  version: '1.1.1' | '1.3.0',
  leafOnly: boolean,
  result: ParsedWmsLayer[],
  isRoot: boolean,
): void {
  const childLayers = getDirectChildElements(layerElement, 'Layer');
  const name = getDirectChildText(layerElement, 'Name');

  if (name && (!leafOnly || childLayers.length === 0)) {
    result.push({
      name,
      title: getDirectChildText(layerElement, 'Title') ?? name,
      crsList: readSpatialReferences(layerElement, version),
      style: readDefaultStyle(layerElement),
      geographicBounds: readGeographicBounds(layerElement),
    });
  }

  if (isRoot && !name && childLayers.length === 0) {
    return;
  }

  for (const childLayer of childLayers) {
    walkLayerElement(childLayer, version, leafOnly, result, false);
  }
}

function readSpatialReferences(layerElement: Element, version: '1.1.1' | '1.3.0'): string[] {
  const tagName = version === '1.3.0' ? 'CRS' : 'SRS';
  return getDirectChildElements(layerElement, tagName)
    .map((node) => node.textContent?.trim() ?? '')
    .filter(Boolean);
}

function readDefaultStyle(layerElement: Element): string | undefined {
  const styleElements = getDirectChildElements(layerElement, 'Style');
  const namedStyle = styleElements.find((style) => getDirectChildText(style, 'Name'));
  return namedStyle ? getDirectChildText(namedStyle, 'Name') ?? undefined : undefined;
}

function readGeographicBounds(layerElement: Element): ParsedWmsLayer['geographicBounds'] | undefined {
  const bounds = getDirectChildElements(layerElement, 'EX_GeographicBoundingBox')[0];
  if (!bounds) {
    return undefined;
  }

  const west = readNumber(bounds, 'westBoundLongitude');
  const east = readNumber(bounds, 'eastBoundLongitude');
  const south = readNumber(bounds, 'southBoundLatitude');
  const north = readNumber(bounds, 'northBoundLatitude');

  if ([west, east, south, north].some((value) => value === undefined)) {
    return undefined;
  }

  return { west: west!, east: east!, south: south!, north: north! };
}

function toWmsLayerOptions(
  layer: ParsedWmsLayer,
  context: {
    getMapUrl: string;
    version: '1.1.1' | '1.3.0';
    defaultFormat: string;
    preferredCrs?: string;
  },
): WmsLayerOptions {
  const crs = pickSpatialReference(layer.crsList, context.preferredCrs, context.version);
  const options: WmsLayerOptions = {
    type: 'wms',
    url: context.getMapUrl,
    layers: layer.name,
    name: layer.title ?? layer.name,
    format: context.defaultFormat,
    version: context.version,
    ...(layer.style ? { styles: layer.style } : {}),
  };

  if (context.version === '1.3.0') {
    options.crs = crs;
  } else {
    options.srs = crs;
  }

  if (layer.geographicBounds) {
    const { west, south, east, north } = layer.geographicBounds;
    options.rectangle = Rectangle.fromDegrees(west, south, east, north);
  }

  return options;
}

function pickSpatialReference(
  crsList: string[],
  preferredCrs: string | undefined,
  version: '1.1.1' | '1.3.0',
): string {
  const normalizedPreferred = preferredCrs?.trim();
  if (normalizedPreferred && crsList.includes(normalizedPreferred)) {
    return normalizedPreferred;
  }

  const defaults =
    version === '1.3.0'
      ? ['EPSG:4326', 'CRS:84', 'EPSG:3857']
      : ['EPSG:4326', 'EPSG:3857'];

  for (const candidate of defaults) {
    if (crsList.includes(candidate)) {
      return candidate;
    }
  }

  return crsList[0] ?? 'EPSG:4326';
}
