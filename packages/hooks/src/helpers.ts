export function omit<T extends object, K extends keyof T>(
  obj: T,
  keysToOmit: K[],
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysToOmit.includes(key as K)),
  ) as Omit<T, K>
}
