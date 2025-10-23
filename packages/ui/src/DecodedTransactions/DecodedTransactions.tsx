import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { CHAIN_ID, DaoContractAddresses } from '@buildeross/types'
import { atoms, Stack } from '@buildeross/zord'
import React from 'react'

import { TransactionDisplay } from './TransactionDisplay'

interface DecodedTransactionProps {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  decodedTransactions: DecodedTransaction[] | undefined
}

export const DecodedTransactions: React.FC<DecodedTransactionProps> = ({
  chainId,
  addresses,
  decodedTransactions,
}) => {
  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <ol>
        {decodedTransactions?.map((decoded, i) => (
          <li className={atoms({ paddingBottom: 'x4' })} key={`${decoded.target}-${i}`}>
            <TransactionDisplay chainId={chainId} addresses={addresses} {...decoded} />
          </li>
        ))}
      </ol>
    </Stack>
  )
}
