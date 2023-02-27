import { Flex } from '@zoralabs/zord'
import { Icon } from 'src/components/Icon'
import { TransactionType, TRANSACTION_TYPES } from '../constants'

interface TransactionTypeIconProps {
  transactionType: TransactionType
  large?: boolean
}

export const TransactionTypeIcon: React.FC<TransactionTypeIconProps> = ({
  transactionType,
  large,
}) => {
  return (
    <Flex
      align={'center'}
      justify={'center'}
      h={large ? 'x13' : 'x10'}
      w={large ? 'x13' : 'x10'}
      borderRadius={'round'}
      style={{ backgroundColor: TRANSACTION_TYPES[transactionType].iconBackdrop }}
      my={'x4'}
      minH={large ? 'x13' : 'x10'}
      minW={large ? 'x13' : 'x10'}
    >
      <Icon id={TRANSACTION_TYPES[transactionType].icon} fill={'transparent'} />
    </Flex>
  )
}
