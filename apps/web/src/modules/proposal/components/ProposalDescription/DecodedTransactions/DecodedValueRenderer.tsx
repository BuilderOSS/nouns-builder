import { Flex, Stack, Text } from '@buildeross/zord'

import { DecodedValue } from 'src/typings'

interface DecodedValueRendererProps {
  name: string
  value: DecodedValue
}

export const DecodedValueRenderer: React.FC<DecodedValueRendererProps> = ({
  name,
  value,
}) => {
  if (typeof value === 'string') {
    return (
      <Flex key={name} align="flex-start" w="100%">
        <Text pr="x1" style={{ flexShrink: 0 }}>
          {name}:
        </Text>
        <Text>{value}</Text>
      </Flex>
    )
  }

  if (Array.isArray(value)) {
    return (
      <>
        <Flex wrap="wrap" align="flex-start">
          <Text pr="x1" style={{ flexShrink: 0 }}>
            {name}:
          </Text>
          <Text>[</Text>
        </Flex>
        <Stack pl="x4" gap="x1">
          {value.map((item, index) => (
            <DecodedValueRenderer
              key={`${name}-${index}`}
              name={`[${index}]`}
              value={item}
            />
          ))}
        </Stack>
        <Text>]</Text>
      </>
    )
  }

  if (typeof value === 'object' && value !== null) {
    return (
      <>
        <Flex wrap="wrap" align="flex-start">
          <Text pr="x1" style={{ flexShrink: 0 }}>
            {name}:
          </Text>
          <Text>{'{'}</Text>
        </Flex>
        <Stack pl="x4" gap="x1">
          {Object.entries(value).map(([key, val], i) => (
            <DecodedValueRenderer key={`${key}-${i}`} name={key} value={val} />
          ))}
        </Stack>
        <Text>{'}'}</Text>
      </>
    )
  }

  return <DecodedValueRenderer {...{ name, value: JSON.stringify(value) }} /> // fallback
}
