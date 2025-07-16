import { Button, Flex, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import { proposalActionButtonVariants } from 'src/styles/Proposals.css'

export const ConnectWalletAction = () => {
  const { openConnectModal } = useConnectModal()
  return (
    <Flex
      direction={{ '@initial': 'column', '@768': 'row' }}
      w={'100%'}
      gap={{ '@initial': 'x3', '@768': 'x0' }}
      align={'center'}
      p={{ '@initial': 'x4', '@768': 'x6' }}
      borderStyle={'solid'}
      borderWidth={'normal'}
      borderRadius={'curved'}
      borderColor={'border'}
    >
      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        align={'center'}
        gap={'x3'}
        textAlign={{ '@initial': 'center', '@768': 'left' }}
      >
        <Button
          onClick={openConnectModal}
          className={proposalActionButtonVariants['vote']}
          w={{ '@initial': '100%', '@768': 'auto' }}
        >
          Submit Vote
        </Button>
        <Text color={'text3'}>Connect your wallet to vote on proposals</Text>
      </Flex>
    </Flex>
  )
}
