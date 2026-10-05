import { useConnectModal } from '@buildeross/ui/ConnectModalProvider'
import { Button, Flex, Text } from '@buildeross/zord'

export const DashConnect = () => {
  const { openConnectModal } = useConnectModal()
  return (
    <Flex direction="column" align="flex-start" justify="flex-start">
      <Text fontSize={18}>You must connect your wallet to view your Dashboard</Text>
      <Button onClick={openConnectModal} mt="x6">
        Connect Wallet
      </Button>
    </Flex>
  )
}
