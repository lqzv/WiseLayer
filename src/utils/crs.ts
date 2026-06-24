/** WMS 默认协议版本：1.3.0 */
const WMS_VERSION_130 = '1.3.0';

/**
 * 根据 WMS 版本解析空间参考参数。
 *
 * WMS 1.3.0 使用 `crs` 参数，1.1.x 使用 `srs` 参数。
 * 若未指定 crs/srs，默认使用 EPSG:4326。
 *
 * @param options - 包含版本与坐标系信息的配置
 * @returns 适配对应 WMS 版本的 crs 或 srs 字段
 */
export function resolveWmsSpatialReference(options: {
  version?: '1.1.1' | '1.3.0';
  crs?: string;
  srs?: string;
}): { crs?: string; srs?: string } {
  const version = options.version ?? WMS_VERSION_130;
  const spatialRef = options.crs ?? options.srs ?? 'EPSG:4326';

  if (version === WMS_VERSION_130) {
    return { crs: spatialRef };
  }

  return { srs: spatialRef };
}

/**
 * 解析 WMS 协议版本，未指定时返回默认 1.3.0。
 */
export function resolveWmsVersion(version?: '1.1.1' | '1.3.0'): '1.1.1' | '1.3.0' {
  return version ?? WMS_VERSION_130;
}
