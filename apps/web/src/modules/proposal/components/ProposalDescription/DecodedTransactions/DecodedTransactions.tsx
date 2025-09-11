import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
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
          {Object.keys(decoded.transaction.args).length === 0 ? `)` : null}
        </Flex>

        <Stack pl={'x4'} gap={'x1'}>
          {Object.values(decoded.transaction.args).map((arg, i) => (
            <ArgumentDisplay
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
