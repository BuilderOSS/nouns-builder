import { Button, Flex, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'

export const DashConnect = () => {
  const { openConnectModal } = useConnectModal()
  return (
    <Flex direction="column" align="flex-start" justify="flex-start">
      <Text fontSize={18}>You must connect your wallet to see your DAOs</Text>
      <Button onClick={openConnectModal} mt="x6">
        Connect Wallet
      </Button>
    </Flex>
  )
}
