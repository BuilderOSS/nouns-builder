import {
  EAS_CONTRACT_ADDRESS,
  easAbi,
  TREASURY_ASSET_PIN_SCHEMA_UID,
} from '@buildeross/constants/eas'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { TransactionType } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { Formik } from 'formik'
import { useCallback } from 'react'
import { encodeAbiParameters, encodeFunctionData, getAddress, zeroHash } from 'viem'

import { useTransactionComposer } from '../../shared'
import { pinTreasuryAssetSchema, PinTreasuryAssetValues } from './PinTreasuryAsset.schema'
import { PinTreasuryAssetForm } from './PinTreasuryAssetForm'

export const PinTreasuryAsset: React.FC = () => {
  const { addTransaction, resetTransactionType } = useTransactionComposer()
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()

  const initialValues: PinTreasuryAssetValues = {
    tokenType: 0,
    tokenAddress: '',
    isCollection: true,
    tokenId: '0',
  }

  const handleSubmit = useCallback(
    async (
      values: PinTreasuryAssetValues,
      actions: FormikHelpers<PinTreasuryAssetValues>
    ) => {
      const easContractAddress = EAS_CONTRACT_ADDRESS[chain.id]
      if (!values.tokenAddress || !addresses.token || !easContractAddress) return

      const tokenAddress = getAddress(values.tokenAddress)
      const tokenId = BigInt(values.tokenId || '0')

      // Encode the attestation data according to schema:
      // uint8 tokenType, address token, bool isCollection, uint256 tokenId
      const encodedData = encodeAbiParameters(
        [
          { name: 'tokenType', type: 'uint8' },
          { name: 'token', type: 'address' },
          { name: 'isCollection', type: 'bool' },
          { name: 'tokenId', type: 'uint256' },
        ],
        [values.tokenType, tokenAddress, values.isCollection, tokenId]
      )

      // Encode EAS attest function call
      const calldata = encodeFunctionData({
        abi: easAbi,
        functionName: 'attest',
        args: [
          {
            schema: TREASURY_ASSET_PIN_SCHEMA_UID as `0x${string}`,
            data: {
              recipient: getAddress(addresses.token),
              expirationTime: 0n,
              revocable: true,
              refUID: zeroHash,
              data: encodedData,
              value: 0n,
            },
          },
        ],
      })

      const tokenTypeLabel = ['ERC20', 'ERC721', 'ERC1155'][values.tokenType]
      const summary = values.isCollection
        ? `Pin ${tokenTypeLabel} collection ${walletSnippet(tokenAddress)}...`
        : `Pin ${tokenTypeLabel} token ${walletSnippet(tokenAddress)}... #${values.tokenId}`

      addTransaction({
        type: TransactionType.PIN_TREASURY_ASSET,
        title: 'Pin Treasury Asset',
        summary,
        transactions: [
          {
            functionSignature:
              'attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))',
            target: easContractAddress,
            value: '0',
            calldata,
          },
        ],
      })

      actions.resetForm()
      resetTransactionType()
    },
    [addTransaction, addresses.token, chain.id, resetTransactionType]
  )

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={pinTreasuryAssetSchema()}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => <PinTreasuryAssetForm formik={formik} />}
      </Formik>
    </Box>
  )
}
