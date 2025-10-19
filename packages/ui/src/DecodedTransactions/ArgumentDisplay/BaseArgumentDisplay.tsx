import { DecodedValue } from '@buildeross/types'
import { Flex, Stack, Text } from '@buildeross/zord'

interface BaseArgumentDisplayProps {
  name: string
  value: DecodedValue
}

export const BaseArgumentDisplay: React.FC<BaseArgumentDisplayProps> = ({
  name,
  value,
}) => {
  if (typeof value === 'string') {
    return (
      <Flex align="flex-start" w="100%">
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
            <BaseArgumentDisplay
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
            <BaseArgumentDisplay key={`${key}-${i}`} name={key} value={val} />
          ))}
        </Stack>
        <Text>{'}'}</Text>
      </>
    )
  }

  let text = String(value)
  try {
    text = JSON.stringify(value)
  } catch {}

  return (
    <Flex align="flex-start" w="100%">
      <Text pr="x1" style={{ flexShrink: 0 }}>
        {name}:
      </Text>
      <Text>{text}</Text>
    </Flex>
  )
}
