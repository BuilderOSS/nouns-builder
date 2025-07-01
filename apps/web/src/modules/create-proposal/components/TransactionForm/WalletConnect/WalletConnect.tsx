import { Box, Button, Flex, Text } from '@zoralabs/zord'
import { Form, Formik } from 'formik'
import type { FormikHelpers, FormikProps } from 'formik'
import { useCallback, useEffect, useMemo, useState } from 'react'

import SmartInput from 'src/components/Fields/SmartInput'
import { TEXT } from 'src/components/Fields/types'
import { Icon } from 'src/components/Icon'
import { useDecodedTransactionSingle } from 'src/hooks/useDecodedTransactions'
import {
  TransactionType,
  WCParams,
  WCPayload,
  useProposalStore,
  useWalletConnect,
} from 'src/modules/create-proposal'
import { useDaoStore } from 'src/modules/dao'
import { DecodedTransactionDisplay } from 'src/modules/proposal/components/ProposalDescription/DecodedTransactions/DecodedTransactions'
import { useChainStore } from 'src/stores/useChainStore'
import { CHAIN_ID } from 'src/typings'
import { walletSnippet } from 'src/utils/helpers'

import * as styles from './WalletConnect.css'
import walletConnectSchema, { WalletConnectValues } from './WalletConnect.schema'

enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
}

interface WalletConnectFormProps {
  formik: FormikProps<WalletConnectValues>
  onTransactionReceived: (payload: WCPayload) => void
}

const WalletConnectForm = ({ formik, onTransactionReceived }: WalletConnectFormProps) => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED)

  // WalletConnect V1 hook
  const { txPayload, wcClientData, wcConnect, wcDisconnect, txError } = useWalletConnect()

  const wcLink = formik.values.wcLink

  // Handle transaction payload updates
  useEffect(() => {
    if (txPayload) {
      onTransactionReceived(txPayload)
    }
  }, [txPayload, onTransactionReceived])

  useEffect(() => {
    if (
      treasury &&
      chain.id &&
      wcLink?.startsWith('wc:') &&
      connectionStatus === ConnectionStatus.DISCONNECTED
    ) {
      const params: WCParams = {
        chainId: chain.id as CHAIN_ID,
        uri: wcLink,
      }
      setConnectionStatus(ConnectionStatus.CONNECTING)

      wcConnect(params)
    }
  }, [connectionStatus, treasury, chain.id, wcConnect, wcLink])

  const handleDisconnect = useCallback(() => {
    wcDisconnect()
    setConnectionStatus(ConnectionStatus.DISCONNECTED)
    formik.resetForm()
  }, [wcDisconnect, formik])

  const handleContinue = useCallback(() => {
    setConnectionStatus(ConnectionStatus.CONNECTED)
  }, [])

  const renderConnectionStatus = useMemo(() => {
    switch (connectionStatus) {
      case ConnectionStatus.DISCONNECTED:
        return (
          <Text fontSize={16} color="text3" textAlign="center" fontWeight="label">
            Add a WalletConnect link to connect to a dApp and preview transactions
          </Text>
        )

      case ConnectionStatus.CONNECTING:
        if (!wcClientData) {
          return (
            <div className={styles.baseContainer}>
              <div className={styles.loadingContainer}>
                <Text fontSize={14} color="text3" textAlign="center" fontWeight="label">
                  Connecting to WalletConnect...
                </Text>
              </div>
              <Button variant="ghost" onClick={handleDisconnect} mt="x4">
                Cancel
              </Button>
            </div>
          )
        } else {
          return (
            <div className={styles.baseContainer}>
              <Text
                fontSize={14}
                color="text3"
                textAlign="center"
                mb="x4"
                fontWeight="label"
              >
                Connecting to {wcClientData.name}...
              </Text>
              <div className={styles.buttonsContainer}>
                <Button onClick={handleContinue}>Continue</Button>
                <Button variant="ghost" onClick={handleDisconnect}>
                  Cancel
                </Button>
              </div>
            </div>
          )
        }

      case ConnectionStatus.CONNECTED:
        return (
          <div className={styles.baseContainer}>
            <Text fontSize={16} fontWeight="label" textAlign="center">
              {wcClientData?.name}
            </Text>
            <Text fontSize={14} color="positive" textAlign="center" mb="x2">
              CONNECTED
            </Text>
            <Text
              fontSize={12}
              color="text3"
              textAlign="center"
              mb="x4"
              fontWeight="label"
            >
              Keep this connection open. Transactions from the dApp will appear here as
              proposals.
            </Text>

            {!txPayload ? (
              <div className={styles.loadingContainer}>
                <Text fontSize={14} color="text3" textAlign="center">
                  Waiting for transaction from dApp...
                </Text>
              </div>
            ) : (
              <div className={styles.baseContainer}>
                <Icon id="checkInCircle" size="lg" className={styles.successIcon} />
                <Text fontSize={14} color="positive" textAlign="center">
                  Transaction Ready to Submit!
                </Text>
              </div>
            )}

            <Button variant="ghost" onClick={handleDisconnect} mt="x4">
              Disconnect
            </Button>
          </div>
        )
    }
  }, [connectionStatus, wcClientData, txPayload, handleContinue, handleDisconnect])

  return (
    <Box
      data-testid="wallet-connect-form"
      as="fieldset"
      disabled={formik.isValidating}
      style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
    >
      <Flex as={Form} direction="column">
        <SmartInput
          type={TEXT}
          formik={formik}
          {...formik.getFieldProps('wcLink')}
          id="wcLink"
          inputLabel="WalletConnect Link"
          placeholder="wc:..."
          helperText="Paste a WalletConnect URI from a dApp to connect and create proposals"
          disabled={connectionStatus === ConnectionStatus.CONNECTED}
          errorMessage={
            txError ||
            (formik.touched.wcLink && formik.errors.wcLink
              ? formik.errors.wcLink
              : undefined)
          }
        />

        <div className={styles.walletConnectContainer}>
          <div className={styles.walletConnectLogo}>
            {wcClientData?.icons && wcClientData.icons.length > 0 ? (
              <img src={wcClientData.icons[0]} alt="WalletConnect App Logo" />
            ) : (
              <Icon id="walletConnect" size="lg" />
            )}
          </div>
          <div>{renderConnectionStatus}</div>
        </div>

        {/* Transaction Preview */}
        {txPayload && <TransactionPreview txPayload={txPayload} />}

        <Button
          mt="x6"
          variant="outline"
          borderRadius="curved"
          type="submit"
          disabled={!txPayload || connectionStatus !== ConnectionStatus.CONNECTED}
        >
          Add Transaction to Queue
        </Button>
      </Flex>
    </Box>
  )
}

const useDecodedTxPayload = (txPayload: WCPayload | null) => {
  const target = txPayload?.params[0].to ?? ''
  const calldata = txPayload?.params[0].data ?? '0x'
  const value = txPayload?.params[0].value ?? '0'

  return useDecodedTransactionSingle(target, calldata, value)
}

const TransactionPreview = ({ txPayload }: { txPayload: WCPayload }) => {
  const decoded = useDecodedTxPayload(txPayload)

  if (!decoded) return null

  return (
    <Box className={styles.transactionPreview}>
      <Box fontSize={20} mb={{ '@initial': 'x4', '@768': 'x5' }} fontWeight={'display'}>
        Transaction Preview
      </Box>
      <DecodedTransactionDisplay {...decoded} />
    </Box>
  )
}

export const WalletConnect = () => {
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const [currentTxPayload, setCurrentTxPayload] = useState<WCPayload | null>(null)

  // Decode the current transaction for better summary
  const decoded = useDecodedTxPayload(currentTxPayload)

  const initialValues: WalletConnectValues = {
    wcLink: '',
  }

  const handleSubmit = useCallback(
    async (_values: WalletConnectValues, actions: FormikHelpers<WalletConnectValues>) => {
      if (!currentTxPayload) return

      const tx = currentTxPayload.params[0]
      if (!tx) return

      // Create a summary based on the transaction data
      let summary = 'WalletConnect transaction'
      if (currentTxPayload.method === 'personal_sign') {
        summary = 'Sign message via WalletConnect'
      } else if (currentTxPayload.method.includes('signTypedData')) {
        summary = 'Sign typed data via WalletConnect'
      } else if (currentTxPayload.method === 'eth_sendTransaction') {
        // Use decoded function name if available, otherwise fall back to basic summary
        if (decoded && !decoded.isNotDecoded) {
          summary = `Call ${decoded.transaction.functionName} on ${walletSnippet(tx.to)}`
        } else {
          summary = `Send transaction to ${walletSnippet(tx.to)}`
        }
      }

      addTransaction({
        type: TransactionType.WALLET_CONNECT,
        summary,
        transactions: [
          {
            functionSignature: currentTxPayload.method,
            target: tx.to as `0x${string}`,
            value: tx.value || '0',
            calldata: tx.data || '0x',
          },
        ],
      })

      actions.resetForm()
      setCurrentTxPayload(null)
    },
    [currentTxPayload, addTransaction, decoded]
  )

  return (
    <Box w="100%">
      <Formik
        initialValues={initialValues}
        validationSchema={walletConnectSchema}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => (
          <WalletConnectForm
            formik={formik}
            onTransactionReceived={setCurrentTxPayload}
          />
        )}
      </Formik>
    </Box>
  )
}
