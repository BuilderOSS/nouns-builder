import { atoms, Box, Flex, Icon, Text } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import { BuilderTransaction } from '../stores'
import { TransactionTypeIcon } from './TransactionTypeIcon'

export enum SimulationError {
  SimulationFailed, // Whole simulation has failed
  TransactionFailed, // One or more of the transactions in the transaction bundle has failed
}

interface TransactionCardProps {
  handleEdit?: () => void
  handleRemove?: () => void
  simulationUrl?: string
  simulationError?: SimulationError
  transaction: BuilderTransaction
  disabled?: boolean
  children?: ReactNode
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  handleEdit,
  handleRemove,
  simulationError,
  simulationUrl,
  transaction,
  disabled,
  children,
}) => {
  const showCardAction = (handleEdit && !disabled) || (handleRemove && !disabled)

  const type = transaction.type

  const summary = transaction?.summary
    ? transaction.summary
    : transaction.transactions
        .map(({ functionSignature }) => functionSignature)
        .join(', ')

  return (
    <Box data-testid="review-card">
      <Flex
        gap={'x4'}
        align={'center'}
        justify={'space-between'}
        borderWidth={'normal'}
        borderStyle={'solid'}
        borderColor={simulationError ? 'negative' : 'ghostHover'}
        style={{ borderRadius: '12px' }}
        px={'x4'}
      >
        <Flex align={'center'} gap={'x2'}>
          <TransactionTypeIcon transactionType={type} />
          <Text
            variant={'paragraph-md'}
            style={{ marginBottom: '2px', textOverflow: 'ellipsis' }}
            className={atoms({
              maxWidth: !disabled ? 'x64' : 'auto',
            })}
          >
            {summary}
          </Text>
          {children}
        </Flex>

        {showCardAction && (
          <Flex align={'center'} gap={'x2'} data-testid="actions">
            {handleEdit && (
              <Flex
                as={'button'}
                py={'x2'}
                px={'x4'}
                borderWidth={'none'}
                cursor={'pointer'}
                style={{ borderRadius: '8px' }}
                alignSelf={'flex-end'}
                onClick={handleEdit}
                type={'button'}
                data-testid="edit"
              >
                <Text variant={'label-md'}>Edit</Text>
              </Flex>
            )}
            {handleRemove && (
              <Flex onClick={handleRemove} cursor={'pointer'} data-testid="remove">
                <Icon id={'trash'} />
              </Flex>
            )}
          </Flex>
        )}
      </Flex>

      {simulationError === SimulationError.TransactionFailed && (
        <Box color="negative" mt={'x2'}>
          <Text mb={'x2'}>This transaction will fail to execute.</Text>
          {simulationUrl && (
            <Text mb={'x2'} fontWeight={'display'}>
              <a href={simulationUrl} target="_blank" rel="noreferrer">
                View details
              </a>
            </Text>
          )}
        </Box>
      )}
    </Box>
  )
}
