import { Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

const AdminNav: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Flex
      w={'100%'}
      justify={'flex-start'}
      p={'x6'}
      borderWidth={'normal'}
      borderStyle={'solid'}
      borderColor={'ghostHover'}
      mt={'x3'}
      style={{ borderRadius: 12 }}
      gap={'x2'}
      cursor={'pointer'}
      onClick={onClick}
    >
      <Stack>
        <Text variant="label-lg" mb={'x1'}>
          Configure DAO Settings
        </Text>
        <Text variant="paragraph-md" color={'text3'}>
          Change all the main DAO settings in the Admin Tab
        </Text>
      </Stack>
      <Icon
        id={'external-16'}
        fill={'text4'}
        size={'sm'}
        alignSelf={'center'}
        ml={'auto'}
      />
    </Flex>
  )
}

export default AdminNav
