import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getPropdateMessage } from '@buildeross/sdk/subgraph'
import useSWR, { type KeyedMutator } from 'swr'

export type PropdateMessageReturnType = {
  parsedContent: string | undefined
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<string>
}

const fetchPropdateMessage = async (
  messageType: number,
  message: string
): Promise<string> => {
  try {
    const parsed = await getPropdateMessage(messageType, message)
    return parsed.content || message
  } catch (error) {
    console.error('Error parsing propdate message:', error)
    return message
  }
}

export const usePropdateMessage = (
  messageType?: number,
  message?: string
): PropdateMessageReturnType => {
  const { data, error, isLoading, mutate } = useSWR(
    messageType !== undefined && message !== undefined
      ? ([SWR_KEYS.PROPDATE_MESSAGE, messageType, message] as const)
      : null,
    async ([, _messageType, _message]) =>
      fetchPropdateMessage(_messageType as number, _message as string),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  )

  return {
    parsedContent: data,
    isLoading,
    error,
    mutate,
  }
}
