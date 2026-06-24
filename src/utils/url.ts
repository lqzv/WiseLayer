/**
 * 合并 WMS GetMap 请求参数。
 * 用户自定义 parameters 会覆盖 base 中的同名键。
 *
 * @param base - 默认参数字典
 * @param extra - 用户传入的附加参数，可为 undefined
 * @returns 合并后的新参数字典（不修改原对象）
 */
export function mergeParameters(
  base: Record<string, string>,
  extra?: Record<string, string>,
): Record<string, string> {
  if (!extra) {
    return { ...base };
  }

  return { ...base, ...extra };
}
