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
    <Stack
      as="ol"
      style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}
      gap="x4"
    >
      {decodedTransactions?.map((decoded, i) => (
        <li
          className={atoms({
            borderColor: 'border',
            borderStyle: 'solid',
            borderWidth: 'normal',
            borderRadius: 'curved',
          })}
          key={`${decoded.target}-${i}`}
        >
          <TransactionDisplay chainId={chainId} addresses={addresses} {...decoded} />
        </li>
      ))}
    </Stack>
  )
}
