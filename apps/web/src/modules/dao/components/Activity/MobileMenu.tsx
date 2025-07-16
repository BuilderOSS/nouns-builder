import { Button, PopUp, Stack, Text } from '@buildeross/zord'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export const MobileMenu = ({ children }: Props) => {
  return (
    <PopUp
      padding="x0"
      placement="bottom"
      trigger={
        <Button px="x3" style={{ backgroundColor: '#FFF', color: '#000' }}>
          {/* For screen reader */}
          <Text h="x0" w="x0" color="transparent">
            Expand proposals menu
          </Text>
          {/* ellipsis */}
          <Text variant="heading-xs">&#x2022;&#x2022;&#x2022;</Text>
        </Button>
      }
    >
      <Stack gap="x0" p="x4" style={{ width: 150 }}>
        {children}
      </Stack>
    </PopUp>
  )
}
