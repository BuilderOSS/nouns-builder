import { Box, Flex } from '@buildeross/zord'

export const MigrationTracker: React.FC<{ checkpoint: number }> = ({ checkpoint }) => {
  const sections = ['Pause Auctions', 'Deploy to L2', 'Bridge Treasury']
  return (
    <Box w={'100%'} mb="x4">
      <Flex direction={'column'}>
        {sections.map((section, i) => (
          <Flex direction={'row'} align={'center'} mb={'x1'}>
            <Flex
              align={'center'}
              justify={'center'}
              borderStyle={'solid'}
              borderColor={checkpoint > i ? 'positive' : 'text1'}
              backgroundColor={checkpoint > i ? 'positive' : 'transparent'}
              borderRadius={'round'}
              borderWidth={'normal'}
              height={'x4'}
              width={'x4'}
            />
            <Box ml="x4" fontWeight={checkpoint <= i ? 'label' : 'paragraph'}>
              {section}
            </Box>
          </Flex>
        ))}
      </Flex>
      <Box
        w={'100%'}
        mt="x4"
        h={'x0'}
        borderColor="text2"
        borderStyle="solid"
        borderWidth="thin"
      />
    </Box>
  )
}
