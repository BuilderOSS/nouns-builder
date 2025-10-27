import { CHAIN_ID } from '@buildeross/types'
import { fetchFromURI } from '@buildeross/utils'
import { Hex, isAddress, isHex } from 'viem'

import { SDK } from '../client'
import { isChainIdSupportedByEAS } from '../helpers'
import { ProposalUpdateFragment } from '../sdk.generated'

export interface PropdateMessage {
  content: string
  labels?: string[]
  milestoneId?: number
  attachments?: string[]
}

export enum MessageType {
  INLINE_TEXT = 0,
  INLINE_JSON,
  URL_TEXT,
  URL_JSON,
}

export interface PropDate {
  id: Hex
  creator: Hex
  proposalId: Hex
  originalMessageId: Hex
  milestoneId: number | null
  message: string
  txid: Hex
  timeCreated: number
}

const getPropdateMessage = async (
  messageType: number,
  message: string
): Promise<PropdateMessage> => {
  try {
    switch (messageType) {
      case MessageType.INLINE_JSON:
        return JSON.parse(message) as PropdateMessage
      case MessageType.URL_JSON: {
        const response = await fetchFromURI(message)
        return JSON.parse(response) as PropdateMessage
      }
      case MessageType.URL_TEXT: {
        const response = await fetchFromURI(message)
        return { content: response } as PropdateMessage
      }
      default:
        return { content: message } as PropdateMessage
    }
  } catch (error) {
    console.error(
      'Error parsing propdate message:',
      error instanceof Error ? error.message : String(error)
    )
    return { content: message } as PropdateMessage
  }
}

export async function getPropDates(
  tokenAddress: string,
  chainId: CHAIN_ID,
  propId: string
): Promise<PropDate[]> {
  // Input validation
  if (!isAddress(tokenAddress)) {
    console.error('Invalid DAO token address')
    return []
  }

  if (!isChainIdSupportedByEAS(chainId)) {
    console.error('Chain ID not supported by EAS')
    return []
  }

  if (!propId || !isHex(propId)) {
    console.error('Invalid proposal ID')
    return []
  }

  try {
    const variables = {
      proposalId: propId.toLowerCase(),
    }

    const { proposalUpdates: updates } = await SDK.connect(chainId).propdates(variables)

    if (!updates || updates.length === 0) {
      return []
    }

    const propdatePromises = updates.map(
      async (update: ProposalUpdateFragment): Promise<PropDate> => {
        const messageType = update.messageType as MessageType
        const message = update.message as string
        const parsedMessage = await getPropdateMessage(messageType, message)
        const propdate: PropDate = {
          id: update.id as Hex,
          creator: update.creator as Hex,
          proposalId: propId.toLowerCase() as Hex,
          originalMessageId: update.originalMessageId as Hex,
          message: parsedMessage.content,
          milestoneId: !Number.isNaN(Number(parsedMessage.milestoneId))
            ? Number(parsedMessage.milestoneId)
            : null,
          timeCreated: update.timestamp,
          txid: update.transactionHash.toLowerCase() as Hex,
        }
        return propdate
      }
    )

    const propdates = await Promise.all(propdatePromises)

    return propdates
      .filter((p: PropDate) => p.proposalId.toLowerCase() === propId.toLowerCase())
      .sort((a: PropDate, b: PropDate) => a.timeCreated - b.timeCreated)
  } catch (error) {
    console.error(
      'Error fetching updates:',
      error instanceof Error ? error.message : String(error)
    )
    return []
  }
}
