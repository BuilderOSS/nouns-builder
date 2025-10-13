import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { CHAIN_ID } from '@buildeross/types'
import { atoms, Stack } from '@buildeross/zord'
import React from 'react'

import { DecodedTransactionDisplay } from './DecodedTransactionDisplay'

interface DecodedTransactionProps {
  chainId: CHAIN_ID
  decodedTransactions: DecodedTransaction[] | undefined
}

export const DecodedTransactions: React.FC<DecodedTransactionProps> = ({
  chainId,
  decodedTransactions,
}) => {
  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <ol>
        {decodedTransactions?.map((decoded, i) => (
          <li className={atoms({ paddingBottom: 'x4' })} key={`${decoded.target}-${i}`}>
            <DecodedTransactionDisplay chainId={chainId} {...decoded} />
          </li>
        ))}
      </ol>
    </Stack>
  )
}
