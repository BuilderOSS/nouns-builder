import { Box, Flex } from '@buildeross/zord'
import React, { memo } from 'react'

import { useCustomTransactionStore } from '../../../stores/useCustomTransactionStore'
import { transactionFlowHeading } from './CustomTransaction.css'

const FormHeadingBase: React.FC<{
  sections: any[]
}> = ({ sections }) => {
  const { active: activeCustomTransactionSection } = useCustomTransactionStore()

  return (
    <Flex direction={'column'} width={'100%'}>
      <Flex direction={'column'}>
        <Box className={transactionFlowHeading}>Add Transaction</Box>
        <Box>
          Step {activeCustomTransactionSection + 1} of 6:{' '}
          {sections[activeCustomTransactionSection].title}
        </Box>
      </Flex>
    </Flex>
  )
}

export const FormHeading = memo(FormHeadingBase)
