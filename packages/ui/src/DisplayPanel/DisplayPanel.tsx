import { Flex, Text } from '@buildeross/zord'

export const DisplayPanel = ({
  title,
  description,
  compact = false,
}: {
  title: string
  description: string
  compact?: boolean
}) => {
  return (
    <Flex
      borderRadius={'phat'}
      borderStyle={'solid'}
      height={compact ? 'x32' : 'x64'}
      width={'100%'}
      borderWidth={'normal'}
      borderColor={'border'}
      direction={'column'}
      justify={'center'}
      align={'center'}
    >
      <Text fontSize={compact ? 20 : 28} fontWeight={'display'} mb="x4" color={'text3'}>
        {title}
      </Text>
      <Text color={'text3'}>{description}</Text>
    </Flex>
  )
}
