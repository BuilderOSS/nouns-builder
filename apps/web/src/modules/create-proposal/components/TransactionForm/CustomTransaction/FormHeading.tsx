import { Box, Flex } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { memo } from 'react'

import { useCustomTransactionStore } from '../../../stores/useCustomTransactionStore'
import { transactionFlowHeading, transactionFlowWrapper } from './CustomTransaction.css'

const NoMemoisedFormHeading: React.FC<{
  sections: any[]
}> = ({ sections }) => {
  const [isOpen] = React.useState(false)
  const { active: activeCustomTransactionSection } = useCustomTransactionStore()

  return (
    <Flex direction={'column'} width={'100%'}>
      <motion.div
        className={transactionFlowWrapper}
        initial="initial"
        animate={isOpen ? 'animate' : 'initial'}
      >
        <Flex direction={'column'}>
          <Box className={transactionFlowHeading}>Add Transaction</Box>
          <Box>
            Step {activeCustomTransactionSection + 1} of 6:{' '}
            {sections[activeCustomTransactionSection].title}
          </Box>
        </Flex>
      </motion.div>
    </Flex>
  )
}

export const FormHeading = memo(NoMemoisedFormHeading)
