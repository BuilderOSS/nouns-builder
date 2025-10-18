import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { CHAIN_ID, DecodedTransactionData } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { ArgumentDisplay } from '../ArgumentDisplay'

export const DecodedDisplay: React.FC<{
  chainId: CHAIN_ID
  transaction: DecodedTransactionData
  target: string
}> = ({ chainId, transaction, target }) => {
  const sortedArgs = React.useMemo(() => {
    const keys = Object.keys(transaction.args)
    const inOrder = (transaction.argOrder as string[]).filter((k) => keys.includes(k))
    const rest = keys.filter((k) => !inOrder.includes(k)).sort()
    return [...inOrder, ...rest]
  }, [transaction.args, transaction.argOrder])

  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <Stack gap={'x1'}>
        <Box
          color={'secondary'}
          fontWeight={'heading'}
          className={atoms({ textDecoration: 'underline' })}
        >
          <a
            href={`${ETHERSCAN_BASE_URL[chainId]}/address/${target}`}
            target="_blank"
            rel="noreferrer"
          >
            <Text display={{ '@initial': 'flex', '@768': 'none' }}>
              {walletSnippet(target)}
            </Text>
            <Text display={{ '@initial': 'none', '@768': 'flex' }}>{target}</Text>
          </a>
        </Box>
        <Flex pl={'x2'}>
          {`.${transaction.functionName}(`}
          {sortedArgs.length === 0 ? `)` : null}
        </Flex>

        <Stack pl={'x4'} gap={'x1'}>
          {sortedArgs.map((argKey, i) => {
            const arg = transaction.args[argKey]

            return (
              <ArgumentDisplay
                chainId={chainId}
                key={`${argKey}-${arg.name}-${i}`}
                arg={arg}
                target={target}
                functionName={transaction.functionName}
                allArguments={transaction.args}
              />
            )
          })}
        </Stack>

        {sortedArgs.length > 0 ? `)` : null}
      </Stack>
    </Stack>
  )
}
