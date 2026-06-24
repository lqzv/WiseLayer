import { Rectangle } from 'cesium';
import type { FetchWmtsLayerConfigsOptions, WmtsLayerOptions } from '../types/wmts.js';
import {
  findFirstByLocalName,
  getBaseHref,
  getDirectChildElements,
  getDirectChildText,
  matchesLayerFilter,
  normalizeServiceUrl,
  parseXmlDocument,
  pickPreferredFormat,
  pickPreferredTileMatrixSet,
  readOnlineResourceHref,
} from './xml.js';

export type { FetchWmtsLayerConfigsOptions };

interface ParsedWmtsLayer {
  identifier: string;
  title?: string;
  style?: string;
  formats: string[];
  tileMatrixSetIds: string[];
  resourceUrlTemplate?: string;
  geographicBounds?: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
}

const WMTS_VERSION = '1.0.0';

/**
 * 构建 WMTS GetCapabilities 请求 URL。
 */
export function buildWmtsGetCapabilitiesUrl(
  serviceUrl: string,
  version: string = WMTS_VERSION,
): string {
  const url = new URL(serviceUrl, getBaseHref());
  url.searchParams.set('service', 'WMTS');
  url.searchParams.set('request', 'GetCapabilities');
  url.searchParams.set('version', version);
  return url.toString();
}

/**
 * 请求 WMTS GetCapabilities 并解析为 WmtsLayerOptions 数组。
 */
export async function fetchWmtsLayerConfigs(
  serviceUrl: string,
  options: FetchWmtsLayerConfigsOptions = {},
): Promise<WmtsLayerOptions[]> {
  const version = options.version ?? WMTS_VERSION;
  const capabilitiesUrl = buildWmtsGetCapabilitiesUrl(serviceUrl, version);
  const response = await fetch(capabilitiesUrl, options.fetchOptions);

  if (!response.ok) {
    throw new Error(`WMTS GetCapabilities request failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  return parseWmtsCapabilitiesXml(xml, serviceUrl, options);
}

/**
 * 解析 WMTS GetCapabilities XML 文档。
 */
export function parseWmtsCapabilitiesXml(
  xml: string,
  serviceUrl: string,
  options: FetchWmtsLayerConfigsOptions = {},
): WmtsLayerOptions[] {
  const document = parseXmlDocument(xml, 'WMTS Capabilities');
  const kvpGetTileUrl = extractGetTileUrl(document) ?? normalizeServiceUrl(serviceUrl);
  const contents = findFirstByLocalName(document, 'Contents');

  if (!contents) {
    throw new Error('WMTS Capabilities document does not contain a Contents element');
  }

  const parsedLayers = getDirectChildElements(contents, 'Layer')
    .map((layerElement) => parseWmtsLayerElement(layerElement))
    .filter((layer) => layer.identifier)
    .filter((layer) => matchesLayerFilter(layer.identifier, options.layerFilter));

  const configs: WmtsLayerOptions[] = [];

  for (const layer of parsedLayers) {
    const matrixSetIds = options.allTileMatrixSets
      ? layer.tileMatrixSetIds
      : [pickPreferredTileMatrixSet(layer.tileMatrixSetIds, options.preferredTileMatrixSet)].filter(
          (id): id is string => Boolean(id),
        );

    for (const tileMatrixSetID of matrixSetIds) {
      configs.push(
        toWmtsLayerOptions(layer, {
          serviceUrl,
          kvpGetTileUrl,
          tileMatrixSetID,
          preferredFormat: options.preferredFormat,
        }),
      );
    }
  }

  return configs;
}

function parseWmtsLayerElement(layerElement: Element): ParsedWmtsLayer {
  const identifier = getDirectChildText(layerElement, 'Identifier') ?? '';
  const formats = getDirectChildElements(layerElement, 'Format')
    .map((node) => node.textContent?.trim() ?? '')
    .filter(Boolean);

  const resourceUrls = getDirectChildElements(layerElement, 'ResourceURL');
  const tileResource = resourceUrls.find(
    (node) => (node.getAttribute('resourceType') ?? '').toLowerCase() === 'tile',
  );

  return {
    identifier,
    title: getDirectChildText(layerElement, 'Title') ?? identifier,
    style: readDefaultWmtsStyle(layerElement),
    formats: tileResource?.getAttribute('format')
      ? [tileResource.getAttribute('format')!, ...formats]
      : formats,
    tileMatrixSetIds: readTileMatrixSetIds(layerElement),
    resourceUrlTemplate: tileResource?.getAttribute('template') ?? undefined,
    geographicBounds: readWgs84BoundingBox(layerElement),
  };
}

function readDefaultWmtsStyle(layerElement: Element): string | undefined {
  const styles = getDirectChildElements(layerElement, 'Style');
  const defaultStyle =
    styles.find((style) => style.getAttribute('isDefault') === 'true') ?? styles[0];

  return defaultStyle ? getDirectChildText(defaultStyle, 'Identifier') : undefined;
}

function readTileMatrixSetIds(layerElement: Element): string[] {
  return getDirectChildElements(layerElement, 'TileMatrixSetLink')
    .map((link) => getDirectChildText(link, 'TileMatrixSet'))
    .filter((id): id is string => Boolean(id));
}

function readWgs84BoundingBox(layerElement: Element): ParsedWmtsLayer['geographicBounds'] | undefined {
  const bounds = getDirectChildElements(layerElement, 'WGS84BoundingBox')[0];
  if (!bounds) {
    return undefined;
  }

  const lower = getDirectChildText(bounds, 'LowerCorner');
  const upper = getDirectChildText(bounds, 'UpperCorner');
  if (!lower || !upper) {
    return undefined;
  }

  const [west, south] = lower.split(/\s+/).map(Number);
  const [east, north] = upper.split(/\s+/).map(Number);

  if ([west, south, east, north].some((value) => !Number.isFinite(value))) {
    return undefined;
  }

  return { west: west!, south: south!, east: east!, north: north! };
}

function extractGetTileUrl(document: Document): string | undefined {
  const operations = findFirstByLocalName(document, 'OperationsMetadata');
  if (!operations) {
    return undefined;
  }

  const getTileOperation = getDirectChildElements(operations, 'Operation').find(
    (operation) => operation.getAttribute('name') === 'GetTile',
  );

  if (!getTileOperation) {
    return undefined;
  }

  const dcp = getDirectChildElements(getTileOperation, 'DCP')[0];
  const http = dcp ? getDirectChildElements(dcp, 'HTTP')[0] : undefined;
  const getNode = http ? getDirectChildElements(http, 'Get')[0] : undefined;
  const onlineResource = getNode ? getDirectChildElements(getNode, 'OnlineResource')[0] : undefined;

  if (!onlineResource) {
    return undefined;
  }

  return readOnlineResourceHref(onlineResource);
}

function toWmtsLayerOptions(
  layer: ParsedWmtsLayer,
  context: {
    serviceUrl: string;
    kvpGetTileUrl: string;
    tileMatrixSetID: string;
    preferredFormat?: string;
  },
): WmtsLayerOptions {
  const format = pickPreferredFormat(layer.formats, context.preferredFormat);
  const url = layer.resourceUrlTemplate ?? context.kvpGetTileUrl ?? normalizeServiceUrl(context.serviceUrl);

  const options: WmtsLayerOptions = {
    type: 'wmts',
    url,
    layer: layer.identifier,
    name: layer.title ?? layer.identifier,
    tileMatrixSetID: context.tileMatrixSetID,
    format,
    ...(layer.style ? { style: layer.style } : {}),
  };

  if (layer.geographicBounds) {
    const { west, south, east, north } = layer.geographicBounds;
    options.rectangle = Rectangle.fromDegrees(west, south, east, north);
  }

  return options;
}
