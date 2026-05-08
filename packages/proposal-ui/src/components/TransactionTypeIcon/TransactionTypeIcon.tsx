import { TransactionType } from '@buildeross/types'
import { color, Flex, Icon } from '@buildeross/zord'

import { TRANSACTION_TYPES } from '../../constants'

interface TransactionTypeIconProps {
  transactionType: TransactionType
  large?: boolean
  withVerticalMargin?: boolean
}

export const TransactionTypeIcon: React.FC<TransactionTypeIconProps> = ({
  transactionType,
  large,
  withVerticalMargin = false,
}) => {
  const metadata = TRANSACTION_TYPES[transactionType]
  const defaultFill = metadata?.iconFill ?? 'icon1'

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
      my={withVerticalMargin ? 'x4' : undefined}
      minH={large ? 'x13' : 'x10'}
      minW={large ? 'x13' : 'x10'}
      flexShrink={0}
    >
      <Icon id={metadata?.icon ?? 'code'} fill={defaultFill} />
    </Flex>
  )
}
