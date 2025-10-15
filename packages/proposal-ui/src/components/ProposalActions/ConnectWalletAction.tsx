import { useChainStore } from '@buildeross/stores'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Flex, Text } from '@buildeross/zord'

import { proposalActionButtonVariants } from './ProposalActions.css'

export const ConnectWalletAction = () => {
  const { id: chainId } = useChainStore((x) => x.chain)

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
        <ContractButton
          chainId={chainId}
          handleClick={() => {}}
          className={proposalActionButtonVariants['vote']}
          w={{ '@initial': '100%', '@768': 'auto' }}
        >
          Submit Vote
        </ContractButton>
        <Text color={'text3'}>Connect your wallet to vote on proposals</Text>
      </Flex>
    </Flex>
  )
}
