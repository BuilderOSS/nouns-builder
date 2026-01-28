import {
  convertIpfsCidV0ToByte32,
  ESCROW_REQUIRE_VERIFICATION,
  ESCROW_RESOLVER_TYPE,
  getEscrowFactory,
  getWrappedTokenAddress,
  NATIVE_TOKEN_ADDRESS,
  SMART_INVOICE_ARBITRATION_PROVIDER,
} from '@buildeross/utils/escrow'
import { Address, encodeAbiParameters } from 'viem'

import { EscrowFormValues } from './EscrowForm.schema'

export function encodeEscrowData(
  values: EscrowFormValues,
  treasuryAddress: Address,
  ipfsCID: string,
  chainId: string | number
) {
  const wrappedTokenAddress = getWrappedTokenAddress(chainId)
  const selectedTokenAddress = values.tokenAddress as Address
  const tokenAddress =
    selectedTokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
      ? wrappedTokenAddress
      : selectedTokenAddress

  const terminationTime = new Date(values.safetyValveDate).getTime() / 1000
  const ipfsBytesCid = convertIpfsCidV0ToByte32(ipfsCID)
  const factory = getEscrowFactory(chainId)

  // encode abi parameters to create escrowData
  const encodedParams = encodeAbiParameters(
    [
      'address',
      'uint8',
      'address',
      'address',
      'uint256',
      'bytes32',
      'address',
      'bool',
      'address',
      'address',
      'address',
    ].map((v) => ({ type: v })),
    [
      values.clientAddress,
      ESCROW_RESOLVER_TYPE,
      SMART_INVOICE_ARBITRATION_PROVIDER,
      tokenAddress,
      terminationTime,
      ipfsBytesCid,
      wrappedTokenAddress,
      ESCROW_REQUIRE_VERIFICATION,
      factory,
      values.recipientAddress,
      treasuryAddress,
    ]
  )

  return encodedParams
}
