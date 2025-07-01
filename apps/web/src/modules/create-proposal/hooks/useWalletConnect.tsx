import { WalletKit as Web3Wallet, IWalletKit as Web3WalletType } from '@reown/walletkit'
import { Core } from '@walletconnect/core'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { useCallback, useEffect, useState } from 'react'
import { getAddress, zeroHash } from 'viem'

import { BASE_URL } from 'src/constants/baseUrl'
import { WALLET_CONNECT_PROJECT_ID } from 'src/constants/walletconnect'
import { useDaoStore } from 'src/modules/dao'
import { useChainStore } from 'src/stores/useChainStore'
import { CHAIN_ID } from 'src/typings'

export type WCParams = {
  chainId: CHAIN_ID
  uri: string
}

export type WCClientData = SignClientTypes.Metadata

export type Tx = {
  data: string
  from?: string
  gas?: string
  to: string
  value: string
  operation?: string
}

export type WCPayload = {
  id: number
  jsonrpc: string
  method: string
  params: Array<Tx>
}

const WALLET_METADATA = {
  name: 'Nouns Builder',
  description:
    'Unlock the possibilities of collective creation. Start with a vision. Start a DAO. All onchain.',
  url: BASE_URL,
  icons: [`${BASE_URL}/builder-avatar-circle.png`],
}

const EVMBasedNamespaces = 'eip155'

// see https://docs.walletconnect.com/2.0/specs/sign/error-codes
const UNSUPPORTED_CHAIN_ERROR_CODE = 5100
const INVALID_METHOD_ERROR_CODE = 1001
const USER_REJECTED_REQUEST_CODE = 4001
const USER_DISCONNECTED_CODE = 6000

export type wcConnectType = (params: WCParams) => Promise<boolean>
export type wcDisconnectType = () => Promise<void>

type useWalletConnectType = {
  wcClientData?: WCClientData
  wcConnect: wcConnectType
  wcDisconnect: wcDisconnectType
  txPayload?: WCPayload
  txError?: string
}

const rejectResponse = (id: number, code: number, message: string) => {
  return {
    id,
    jsonrpc: '2.0',
    error: {
      code,
      message,
    },
  }
}

export const useWalletConnect = (): useWalletConnectType => {
  const [web3wallet, setWeb3wallet] = useState<Web3WalletType>()

  const [wcSession, setWcSession] = useState<SessionTypes.Struct>()
  useState<boolean>(false)
  const [txPayload, setTxPayload] = useState<WCPayload>()
  const [error, setError] = useState<string>()

  const chainId = useChainStore((s) => s.chain?.id)
  const treasury = useDaoStore((s) => s.addresses?.treasury)

  useEffect(() => {
    const initializeWalletConnectClient = async () => {
      if (!chainId) return

      const core = new Core({
        projectId: WALLET_CONNECT_PROJECT_ID,
        logger: process.env.VERCEL_ENV === 'production' ? 'error' : 'trace',
      })

      const web3wallet = await Web3Wallet.init({
        core,
        metadata: WALLET_METADATA,
      })

      setWeb3wallet(web3wallet)
    }

    try {
      initializeWalletConnectClient()
    } catch (error) {
      console.error('WalletConnect initialization error: ', error)
      setWeb3wallet(undefined)
    }
  }, [chainId])

  useEffect(() => {
    if (!web3wallet || !chainId || !treasury) return

    web3wallet.on('session_proposal', async (proposal) => {
      try {
        const namespaces = buildApprovedNamespaces({
          proposal: proposal.params,
          supportedNamespaces: {
            eip155: {
              chains: [`${EVMBasedNamespaces}:${Number(chainId)}`],
              methods: ['eth_sendTransaction'],
              events: [
                'chainChanged',
                'accountsChanged',
                'message',
                'disconnect',
                'connect',
              ],
              accounts: [
                `${EVMBasedNamespaces}:${Number(chainId)}:${getAddress(treasury)}`,
              ],
            },
          },
        })
        const wcSession = await web3wallet.approveSession({
          id: proposal.id,
          namespaces,
        })

        setWcSession(wcSession)
        setError(undefined)
      } catch (error) {
        console.error('WalletConnect session_proposal error: ', error)
        setError('Error connecting to dApp.')
        await web3wallet.rejectSession({
          id: proposal.id,
          reason: getSdkError('USER_REJECTED'),
        })
      }
    })

    web3wallet.on('session_delete', async () => {
      setWcSession(undefined)
      setError(undefined)
    })

    web3wallet.on('session_request', async (event) => {
      const { topic, id } = event
      const { request, chainId: transactionChainId } = event.params
      const { method, params } = request

      const isDAOChainId = transactionChainId === `${EVMBasedNamespaces}:${chainId}`

      // we only accept transactions from the Safe chain
      if (!isDAOChainId) {
        const errorMessage = `Transaction rejected: the connected Dapp is not set to the correct chain.`
        setError(errorMessage)
        await web3wallet.respondSessionRequest({
          topic,
          response: rejectResponse(id, UNSUPPORTED_CHAIN_ERROR_CODE, errorMessage),
        })
        return
      }

      try {
        setError(undefined)
        switch (method) {
          case 'eth_sendTransaction': {
            setTxPayload({
              id,
              jsonrpc: '2.0',
              method,
              params,
            })
            await web3wallet.respondSessionRequest({
              topic,
              response: {
                id,
                jsonrpc: '2.0',
                result: zeroHash,
              },
            })
            break
          }
          default: {
            const errorMsg = 'Tx type not supported'
            setError(errorMsg)
            setTxPayload(undefined)
            await web3wallet.respondSessionRequest({
              topic,
              response: rejectResponse(id, INVALID_METHOD_ERROR_CODE, errorMsg),
            })
            break
          }
        }
      } catch (error) {
        const errorMsg = (error as Error)?.message
        setError(errorMsg)
        setTxPayload(undefined)
        const isUserRejection = errorMsg?.includes?.('Transaction was rejected')
        const code = isUserRejection
          ? USER_REJECTED_REQUEST_CODE
          : INVALID_METHOD_ERROR_CODE
        await web3wallet.respondSessionRequest({
          topic,
          response: rejectResponse(id, code, errorMsg),
        })
      }
    })
  }, [chainId, web3wallet, treasury])

  useEffect(() => {
    if (web3wallet && chainId && treasury) {
      const activeSessions = web3wallet.getActiveSessions()
      const compatibleSession = Object.keys(activeSessions)
        .map((topic) => activeSessions[topic])
        .find(
          (session) =>
            session.namespaces[EVMBasedNamespaces].accounts[0] ===
            `${EVMBasedNamespaces}:${chainId}:${getAddress(treasury)}` // Safe Account
        )

      // restore an active previous session
      if (compatibleSession) {
        setWcSession(compatibleSession)
      }
    }
  }, [chainId, treasury, web3wallet])

  const wcConnect = useCallback<wcConnectType>(
    async ({ uri }: WCParams): Promise<boolean> => {
      setError(undefined)
      setWcSession(undefined)
      setTxPayload(undefined)
      try {
        if (web3wallet) {
          // Pairing session starts
          await web3wallet.pair({ uri, activatePairing: true })
          return true
        }
      } catch (error) {
        console.error('WalletConnect pairing error: ', error)
        setError('Error connecting to dApp.')
      }
      return false
    },
    [web3wallet]
  )

  const wcDisconnect = useCallback<wcDisconnectType>(async () => {
    if (wcSession && web3wallet) {
      await web3wallet.disconnectSession({
        topic: wcSession.topic,
        reason: {
          code: USER_DISCONNECTED_CODE,
          message: 'User disconnected. Safe Wallet Session ended by the user',
        },
      })
      setWcSession(undefined)
      setError(undefined)
      setTxPayload(undefined)
    }
  }, [web3wallet, wcSession])

  const wcClientData = wcSession?.peer.metadata

  return {
    wcConnect,
    wcClientData,
    wcDisconnect,
    txPayload,
    txError: error,
  }
}
