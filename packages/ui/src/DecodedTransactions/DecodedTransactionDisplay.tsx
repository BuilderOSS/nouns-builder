import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { CHAIN_ID } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { ArgumentDisplay } from './ArgumentDisplay'

export const DecodedTransactionDisplay: React.FC<
  DecodedTransaction & { chainId: CHAIN_ID }
> = ({ chainId, ...decoded }) => {
  if (decoded.isNotDecoded || !decoded.transaction.args) {
    const calldata = decoded.isNotDecoded
      ? decoded.transaction
      : decoded.transaction.encodedData
    return (
      <Stack gap={'x1'}>
        <Box
          color={'secondary'}
          fontWeight={'heading'}
          className={atoms({ textDecoration: 'underline' })}
        >
          <a
            href={`${ETHERSCAN_BASE_URL[chainId]}/address/${decoded?.target}`}
            target="_blank"
            rel="noreferrer"
          >
            <Text display={{ '@initial': 'flex', '@768': 'none' }}>
              {walletSnippet(decoded?.target)}
            </Text>
            <Text display={{ '@initial': 'none', '@768': 'flex' }}>
              {decoded?.target}
            </Text>
          </a>
        </Box>
        <Flex pl={'x2'}>{calldata}</Flex>
      </Stack>
    )
  }

  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <Stack gap={'x1'}>
        <Box
          color={'secondary'}
          fontWeight={'heading'}
          className={atoms({ textDecoration: 'underline' })}
        >
          <a
            href={`${ETHERSCAN_BASE_URL[chainId]}/address/${decoded?.target}`}
            target="_blank"
            rel="noreferrer"
          >
            <Text display={{ '@initial': 'flex', '@768': 'none' }}>
              {walletSnippet(decoded?.target)}
            </Text>
            <Text display={{ '@initial': 'none', '@768': 'flex' }}>
              {decoded?.target}
            </Text>
          </a>
        </Box>
        <Flex pl={'x2'}>
          {`.${decoded.transaction.functionName}(`}
          {Object.keys(decoded.transaction.args).length === 0 ? `)` : null}
        </Flex>

        <Stack pl={'x4'} gap={'x1'}>
          {Object.values(decoded.transaction.args).map((arg, i) => (
            <ArgumentDisplay
              chainId={chainId}
              key={`${arg.name}-${i}`}
              arg={arg}
              target={decoded.target}
              functionName={decoded.transaction.functionName}
              allArguments={decoded.transaction.args}
            />
          ))}
        </Stack>

        {Object.keys(decoded.transaction.args).length > 0 ? `)` : null}
      </Stack>
    </Stack>
  )
}
