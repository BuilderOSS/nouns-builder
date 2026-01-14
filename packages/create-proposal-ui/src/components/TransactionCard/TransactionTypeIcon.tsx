import { TRANSACTION_TYPES, TransactionType } from '@buildeross/proposal-ui'
import { color, Flex, Icon } from '@buildeross/zord'

interface TransactionTypeIconProps {
  transactionType: TransactionType
  large?: boolean
}

export const TransactionTypeIcon: React.FC<TransactionTypeIconProps> = ({
  transactionType,
  large,
}) => {
  const metadata = TRANSACTION_TYPES[transactionType]
  return (
    <Flex
      align={'center'}
      justify={'center'}
      h={large ? 'x13' : 'x10'}
      w={large ? 'x13' : 'x10'}
      borderRadius={'round'}
      style={{
        backgroundColor: metadata?.iconBackdrop ?? color.ghostHover,
      }}
      my={'x4'}
      minH={large ? 'x13' : 'x10'}
      minW={large ? 'x13' : 'x10'}
    >
      <Icon id={metadata?.icon ?? 'plus'} fill={metadata?.iconFill ?? 'transparent'} />
    </Flex>
  )
}
