export const FIELD_SEPERATOR_CHAR = '$'

export const RAW_DATA_KEY = '$rawData'

export function matchInputFromName(name: string, inputs: any[]): any {
  if (name.includes(FIELD_SEPERATOR_CHAR)) {
    const [first, ...rest] = name.split(FIELD_SEPERATOR_CHAR)
    return matchInputFromName(
      rest.join(FIELD_SEPERATOR_CHAR),
      inputs.find((input: any) => input.name == first).components,
    )
  }
  return inputs.find((input: any) => input.name === name)!
}

export function normalizePathName(name: string, path?: string[]) {
  if (path?.length) {
    return `${path.join(FIELD_SEPERATOR_CHAR)}${FIELD_SEPERATOR_CHAR}${name}`
  }
  return name
}

export function matchTypeParameters(type: string) {
  const matches = type.match(/^([a-z]+)([0-9]+)?(\[\])?$/)
  const [_, argumentTypePrefix, size, isArray] = matches
    ? matches
    : [undefined, undefined, undefined, undefined]
  return {
    type,
    argumentTypePrefix,
    size,
    isArray: !!isArray,
  }
}
