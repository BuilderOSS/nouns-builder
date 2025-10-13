import { Button, Flex, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import { DaoFeed } from './DaoFeed'
import { DashPage } from './DashboardLayout'

export const DashConnect = () => {
  const { openConnectModal } = useConnectModal()
  return (
    <DashPage>
      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        align={{ '@initial': 'flex-start', '@768': 'center' }}
        justify={{ '@initial': 'flex-start', '@768': 'space-between' }}
      >
        <Text fontSize={18}>You must connect your wallet to see your DAOs</Text>
        <Button onClick={openConnectModal} mt={{ '@initial': 'x6', '@768': 'x0' }}>
          Connect Wallet
        </Button>
      </Flex>
      <DaoFeed isDashboard />
    </DashPage>
  )
}
