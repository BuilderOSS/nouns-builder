import { Flex, Text } from '@buildeross/zord'

export const DisplayPanel = ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  return (
    <Flex
      borderRadius={'phat'}
      borderStyle={'solid'}
      height={'x64'}
      width={'100%'}
      borderWidth={'normal'}
      borderColor={'border'}
      direction={'column'}
      justify={'center'}
      align={'center'}
    >
      <Text fontSize={28} fontWeight={'display'} mb="x4" color={'text3'}>
        {title}
      </Text>
      <Text color={'text3'}>{description}</Text>
    </Flex>
  )
}
