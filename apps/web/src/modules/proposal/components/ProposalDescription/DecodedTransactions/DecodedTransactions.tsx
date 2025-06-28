import { Box, Flex, Stack, Text, atoms } from '@zoralabs/zord'
import React, { Fragment } from 'react'

import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import { DecodedTransaction } from 'src/hooks/useDecodedTransactions'
import { useChainStore } from 'src/stores/useChainStore'
import { walletSnippet } from 'src/utils/helpers'

import { ArgumentDisplay } from './ArgumentDisplay'

interface DecodedTransactionProps {
  decodedTransactions: DecodedTransaction[] | undefined
}

export const DecodedTransactions: React.FC<DecodedTransactionProps> = ({
  decodedTransactions,
}) => {
  const chain = useChainStore((x) => x.chain)

  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word' }}>
      <ol>
        {decodedTransactions?.map((decoded, i) => (
          <Fragment key={`${decoded.target}-${i}`}>
            {decoded.isNotDecoded ? (
              <li className={atoms({ paddingBottom: 'x4' })}>
                {decoded.transaction.toString()}
              </li>
            ) : (
              <li className={atoms({ paddingBottom: 'x4' })}>
                <Stack>
                  <Stack gap={'x1'}>
                    <Box
                      color={'secondary'}
                      fontWeight={'heading'}
                      className={atoms({ textDecoration: 'underline' })}
                    >
                      <a
                        href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${
                          decoded?.target
                        }`}
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
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </Stack>
  )
}
