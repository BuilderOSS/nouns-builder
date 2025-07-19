import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Stack, Text, atoms } from '@buildeross/zord'
import React from 'react'

import { useChainStore } from 'src/stores/useChainStore'

import { ArgumentDisplay } from './ArgumentDisplay'

interface DecodedTransactionProps {
  decodedTransactions: DecodedTransaction[] | undefined
}

export const DecodedTransactionDisplay: React.FC<DecodedTransaction> = ({
  ...decoded
}) => {
  const chain = useChainStore((x) => x.chain)

  if (decoded.isNotDecoded) return <>{decoded.transaction.toString()}</>

  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <Stack gap={'x1'}>
        <Box
          color={'secondary'}
          fontWeight={'heading'}
          className={atoms({ textDecoration: 'underline' })}
        >
          <a
            href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${decoded?.target}`}
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
          {!decoded.transaction.args && `)`}
        </Flex>

        <Stack pl={'x4'} gap={'x1'}>
          {!!decoded.transaction.args &&
            Object?.values(decoded.transaction.args).map((arg, i) => (
              <ArgumentDisplay
                key={`${arg.name}-${i}`}
                arg={arg}
                target={decoded.target}
                functionName={decoded.transaction.functionName}
              />
            ))}
        </Stack>

        {!!decoded.transaction.args && `)`}
      </Stack>
    </Stack>
  )
}

export const DecodedTransactions: React.FC<DecodedTransactionProps> = ({
  decodedTransactions,
}) => {
  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <ol>
        {decodedTransactions?.map((decoded, i) => (
          <li className={atoms({ paddingBottom: 'x4' })} key={`${decoded.target}-${i}`}>
            <DecodedTransactionDisplay {...decoded} />
          </li>
        ))}
      </ol>
    </Stack>
  )
}
