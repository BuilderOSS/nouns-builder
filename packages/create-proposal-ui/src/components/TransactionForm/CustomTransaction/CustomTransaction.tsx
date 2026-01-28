import { useProposalStore } from '@buildeross/stores'
import { AddressType, TransactionType } from '@buildeross/types'
import { Flex } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { ReactNode } from 'react'

import { useCustomTransactionStore } from '../../../stores/useCustomTransactionStore'
import { customTransactionWrapper, transactionFormWrapper } from './CustomTransaction.css'
import { FormHeading } from './FormHeading'
import { ABI, Address, Arguments, Function, Summary, Value } from './forms'

export const CustomTransaction: React.FC = () => {
  const { addTransaction } = useProposalStore()

  const {
    active: activeCustomTransactionSection,
    customTransaction,
    reset,
  } = useCustomTransactionStore()

  const sections: Array<{ title: string; form: ReactNode }> = React.useMemo(() => {
    const address = {
      title: 'Address',
      form: <Address key={'address'} />,
    }

    const abi = {
      title: 'ABI Interface',
      form: <ABI key={'abi'} />,
    }

    const fn = {
      title: 'Function',
      form: <Function key={'function'} />,
    }

    const args = {
      title: 'Arguments',
      form: <Arguments key={'arguments'} />,
    }

    const value = {
      title: 'Value',
      form: <Value key={'arguments'} />,
    }

    const summary = {
      title: 'Summary',
      form: <Summary key={'summary'} />,
    }

    return [address, abi, fn, args, value, summary]
  }, [])

  const currentTransaction = React.useMemo(() => {
    if (!customTransaction?.calldata) return

    if (customTransaction?.function?.name === 'sendEth(address)') {
      return {
        type: TransactionType.SEND_TOKENS,
        transactions: [
          {
            functionSignature: 'sendEth(address)',
            target: customTransaction?.address as AddressType,
            calldata: customTransaction?.calldata,
            value: customTransaction?.value,
          },
        ],
      }
    }

    if (customTransaction?.function?.name === 'call(address,calldata)') {
      return {
        type: TransactionType.CUSTOM,
        transactions: [
          {
            functionSignature: 'call(address,calldata)',
            target: customTransaction?.address as AddressType,
            calldata: customTransaction?.calldata,
            value: customTransaction?.value,
          },
        ],
      }
    }

    if (customTransaction?.contract) {
      return {
        type: TransactionType.CUSTOM,
        transactions: [
          {
            functionSignature: customTransaction.function.name,
            target: customTransaction?.address as AddressType,
            calldata: customTransaction?.calldata,
            value: customTransaction?.value,
          },
        ],
      }
    }
  }, [customTransaction])

  React.useEffect(() => {
    if (!currentTransaction) return

    addTransaction(currentTransaction)
    reset()
  }, [currentTransaction, addTransaction, reset])

  return (
    <Flex
      pb={'x6'}
      direction={'column'}
      borderWidth={'normal'}
      borderStyle={'solid'}
      borderColor={'ghostHover'}
      style={{ borderRadius: '12px' }}
    >
      <Flex
        position={'relative'}
        direction={'column'}
        width={'100%'}
        p={'x16'}
        className={customTransactionWrapper}
      >
        <FormHeading sections={sections} />
        <Flex direction={'column'} className={transactionFormWrapper}>
          <motion.div
            key={sections[activeCustomTransactionSection].title}
            variants={{
              closed: {
                y: 10,
                opacity: 0,
              },
              open: {
                y: 0,
                opacity: 1,
              },
            }}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {sections[activeCustomTransactionSection].form}
          </motion.div>
        </Flex>
      </Flex>
    </Flex>
  )
}
