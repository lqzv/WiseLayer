/** XML 解析与 DOM 遍历的公共工具 */

export const XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * 解析 XML 字符串为 Document。
 * @throws 无 DOMParser 环境或 XML 无效时抛出
 */
export function parseXmlDocument(xml: string, label = 'Capabilities'): Document {
  if (typeof DOMParser === 'undefined') {
    throw new Error(`${label} parsing requires DOMParser (browser environment)`);
  }

  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = document.querySelector('parsererror');

  if (parserError) {
    throw new Error(`Invalid ${label} XML document`);
  }

  return document;
}

/** 获取直接子元素（按 localName 忽略大小写匹配） */
export function getDirectChildElements(parent: Element, tagName: string): Element[] {
  return Array.from(parent.children).filter(
    (child) => child.localName.toLowerCase() === tagName.toLowerCase(),
  );
}

/** 获取直接子元素的文本内容 */
export function getDirectChildText(parent: Element, tagName: string): string | undefined {
  const text = getDirectChildElements(parent, tagName)[0]?.textContent?.trim();
  return text || undefined;
}

/** 在文档中查找第一个匹配 localName 的元素 */
export function findFirstByLocalName(root: Document | Element, localName: string): Element | null {
  const elements = Array.from(root.getElementsByTagName('*'));
  for (const element of elements) {
    if (element.localName.toLowerCase() === localName.toLowerCase()) {
      return element;
    }
  }
  return null;
}

/** 读取子元素数值 */
export function readNumber(parent: Element, tagName: string): number | undefined {
  const text = getDirectChildText(parent, tagName);
  if (!text) {
    return undefined;
  }

  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

/** 按图层名过滤 */
export function matchesLayerFilter(name: string, layerFilter?: string | RegExp): boolean {
  if (!layerFilter) {
    return true;
  }

  if (typeof layerFilter === 'string') {
    return name.includes(layerFilter);
  }

  return layerFilter.test(name);
}

/** 清除 query 参数，保留服务基址 */
export function normalizeServiceUrl(serviceUrl: string): string {
  const url = new URL(serviceUrl, getBaseHref());
  url.search = '';
  return url.toString();
}

/** 获取 URL 解析基准地址 */
export function getBaseHref(): string {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href;
  }

  return 'http://localhost/';
}

/** 读取 xlink:href 或 href 属性 */
export function readOnlineResourceHref(element: Element): string | undefined {
  return (
    element.getAttributeNS(XLINK_NS, 'href') ??
    element.getAttribute('xlink:href') ??
    element.getAttribute('href') ??
    undefined
  );
}

/** 从格式列表中选取优先格式 */
export function pickPreferredFormat(formats: string[], preferred?: string): string {
  if (preferred && formats.includes(preferred)) {
    return preferred;
  }

  const defaults = ['image/png', 'image/jpeg'];
  for (const candidate of defaults) {
    if (formats.includes(candidate)) {
      return candidate;
    }
  }

  return formats[0] ?? 'image/png';
}

/** 从列表中选取优先 TileMatrixSet */
export function pickPreferredTileMatrixSet(ids: string[], preferred?: string): string | undefined {
  if (preferred && ids.includes(preferred)) {
    return preferred;
  }

  const defaults = ['GoogleMapsCompatible', 'EPSG:3857', 'EPSG:4326', 'default028mm'];
  for (const candidate of defaults) {
    if (ids.includes(candidate)) {
      return candidate;
    }
  }

  return ids[0];
}
