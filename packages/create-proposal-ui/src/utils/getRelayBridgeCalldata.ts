import { AddressType } from '@buildeross/types'

export interface RelayBridgeCalldata {
  to: AddressType
  data: `0x${string}`
  value: bigint
  fees?: {
    gas: { amountFormatted: string }
    relayer: { amountFormatted: string }
  }
}

const TESTNET_CHAIN_IDS = [11155111, 84532, 11155420, 999999999, 31337]

export async function getRelayBridgeCalldata({
  originChainId,
  destinationChainId,
  amount,
  targetTreasury,
}: {
  originChainId: number
  destinationChainId: number
  amount: bigint
  targetTreasury: AddressType
}): Promise<RelayBridgeCalldata> {
  const isTestnet = TESTNET_CHAIN_IDS.includes(originChainId)
  const apiUrl = isTestnet ? 'https://api.testnets.relay.link' : 'https://api.relay.link'

  const response = await fetch(`${apiUrl}/quote/v2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: targetTreasury.toLowerCase(),
      originChainId,
      destinationChainId,
      originCurrency: '0x0000000000000000000000000000000000000000',
      destinationCurrency: '0x0000000000000000000000000000000000000000',
      amount: amount.toString(),
      tradeType: 'EXACT_INPUT',
    }),
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error ?? `Relay quote failed: ${response.status}`)
  }

  const step = body?.steps?.[0]
  const item = step?.items?.[0]
  const data = item?.data

  if (!data?.to || !data?.data || data?.value === undefined || data?.value === null) {
    throw new Error('No bridge calldata in Relay response')
  }

  return {
    to: data.to as AddressType,
    data: data.data as `0x${string}`,
    value: BigInt(data.value),
    fees: body.fees,
  }
}
