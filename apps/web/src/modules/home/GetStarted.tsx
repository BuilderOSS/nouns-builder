import { useChainStore } from '@buildeross/stores'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { useRouter } from 'next/router'

import { marqueeButton } from './Home.css'

export const GetStarted = () => {
  const chain = useChainStore((x) => x.chain)

  const { push } = useRouter()

  const handleClick = (): void => {
    push('/create')
  }

  return (
    <ContractButton
      chainId={chain.id}
      handleClick={handleClick}
      h="x16"
      fontWeight={'display'}
      borderRadius={'curved'}
      fontSize={28}
      px={'x8'}
      py={'x4'}
      mt={'x8'}
      className={marqueeButton}
      backgroundColor={'onNeutral'}
      cursor={'pointer'}
      color={'onAccent'}
      width={'unset'}
      align={'center'}
      justify={'center'}
    >
      Create your DAO
    </ContractButton>
  )
}
