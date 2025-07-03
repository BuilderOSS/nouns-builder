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
  WCClientData,
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
  onTransactionReceived: (wcClientData: WCClientData, payload: WCPayload) => void
}

const WalletConnectForm = ({ formik, onTransactionReceived }: WalletConnectFormProps) => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED)

  const { txPayload, wcClientData, wcConnect, wcDisconnect, txError } = useWalletConnect()

  const wcLink = formik.values.wcLink

  // Handle transaction payload updates
  useEffect(() => {
    if (wcClientData && txPayload) {
      onTransactionReceived(wcClientData, txPayload)
    }
  }, [wcClientData, txPayload, onTransactionReceived])

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

      wcConnect(params).then((success) => {
        if (!success) {
          setConnectionStatus(ConnectionStatus.DISCONNECTED)
        }
      })
    }
  }, [connectionStatus, treasury, chain.id, wcConnect, wcLink])

  const handleDisconnect = useCallback(() => {
    wcDisconnect()
    setConnectionStatus(ConnectionStatus.DISCONNECTED)
    formik.resetForm()
  }, [wcDisconnect, formik])

  useEffect(() => {
    if (connectionStatus === ConnectionStatus.CONNECTING && !!wcClientData) {
      setConnectionStatus(ConnectionStatus.CONNECTED)
    }
  }, [connectionStatus, wcClientData])

  const renderConnectionStatus = useMemo(() => {
    switch (connectionStatus) {
      case ConnectionStatus.DISCONNECTED:
        return (
          <Text fontSize={16} color="text3" textAlign="center" fontWeight="label">
            Add a WalletConnect link to connect to a dApp and preview transactions
          </Text>
        )

      case ConnectionStatus.CONNECTING:
        return (
          <div className={styles.baseContainer}>
            <div className={styles.statusContainer}>
              <Text fontSize={16} color="text3" textAlign="center" fontWeight="label">
                Connecting to {wcClientData?.name ?? 'WalletConnect'}...
              </Text>
            </div>
            <Button variant="outline" onClick={handleDisconnect} mt="x2" size="sm">
              Cancel
            </Button>
          </div>
        )
      case ConnectionStatus.CONNECTED:
        return (
          <div className={styles.baseContainer}>
            <Text fontSize={16} fontWeight="label" textAlign="center">
              Connected to {wcClientData?.name}
            </Text>

            {!txPayload ? (
              <div className={styles.statusContainer}>
                <Text fontSize={14} color="text3" textAlign="center">
                  Keep this connection open. Transaction(s) from the dApp will appear
                  here.
                </Text>
              </div>
            ) : (
              <div className={styles.statusContainer}>
                <Icon
                  id="checkInCircle"
                  size="lg"
                  className={styles.successIcon}
                  color="positive"
                />
                <Text fontSize={14} color="positive" textAlign="center">
                  Transaction Ready to Submit!
                </Text>
              </div>
            )}

            <Button variant="outline" onClick={handleDisconnect} mt="x2" size="sm">
              Disconnect
            </Button>
          </div>
        )
    }
  }, [connectionStatus, wcClientData, txPayload, handleDisconnect])

  return (
    <Box
      data-testid="wallet-connect-form"
      as="fieldset"
      style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
    >
      <Flex as={Form} direction="column" gap="x4">
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
            connectionStatus === ConnectionStatus.CONNECTED
              ? null
              : txError ||
                (formik.touched.wcLink && formik.errors.wcLink
                  ? formik.errors.wcLink
                  : undefined)
          }
        />

        <div className={styles.walletConnectContainer}>
          <div className={styles.walletConnectLogo}>
            {wcClientData?.icons && wcClientData.icons.length > 0 ? (
              <img
                src={wcClientData.icons[0]}
                alt="WalletConnect App Logo"
                style={{ width: 32 }}
              />
            ) : (
              <Icon id="walletConnect" size="lg" />
            )}
          </div>
          <div>{renderConnectionStatus}</div>
        </div>

        {/* Transaction Preview */}
        {txPayload && <TransactionPreview txPayload={txPayload} />}

        <Button
          mt="x8"
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
  const [currentClientData, setCurrentClientData] = useState<WCClientData | null>(null)
  const [currentTxPayload, setCurrentTxPayload] = useState<WCPayload | null>(null)

  // Decode the current transaction for better summary
  const decoded = useDecodedTxPayload(currentTxPayload)

  const initialValues: WalletConnectValues = {
    wcLink: '',
  }

  const handleSubmit = useCallback(
    async (_values: WalletConnectValues, actions: FormikHelpers<WalletConnectValues>) => {
      if (!currentTxPayload || !currentClientData) return

      const tx = currentTxPayload.params[0]
      if (!tx) return

      // Create a summary based on the transaction data
      let summary = 'WalletConnect transaction'
      if (currentTxPayload.method === 'eth_sendTransaction') {
        // Use decoded function name if available, otherwise fall back to basic summary
        if (decoded && !decoded.isNotDecoded) {
          summary = `Call ${decoded.transaction.functionName} on ${walletSnippet(tx.to)} via ${currentClientData.name}`
        } else {
          summary = `Send transaction to ${walletSnippet(tx.to)} via ${currentClientData.name}`
        }
      }

      addTransaction({
        type: TransactionType.WALLET_CONNECT,
        summary,
        transactions: [
          {
            functionSignature: currentTxPayload.method,
            target: tx.to as `0x${string}`,
            value: tx.value ?? '0',
            calldata: tx.data ?? ('0x' as `0x${string}`),
          },
        ],
      })

      actions.resetForm()
      setCurrentTxPayload(null)
    },
    [currentTxPayload, currentClientData, addTransaction, decoded]
  )

  const onTransactionReceived = useCallback(
    (wcClientData: WCClientData, txPayload: WCPayload) => {
      setCurrentClientData(wcClientData)
      setCurrentTxPayload(txPayload)
    },
    []
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
            onTransactionReceived={onTransactionReceived}
          />
        )}
      </Formik>
    </Box>
  )
}
