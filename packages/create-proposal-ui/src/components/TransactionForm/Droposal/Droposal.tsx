import { PUBLIC_ZORA_NFT_CREATOR } from '@buildeross/constants/addresses'
import { zoraNFTCreatorAbi } from '@buildeross/sdk/contract'
import { useChainStore, useProposalStore } from '@buildeross/stores'
import { AddressType, TransactionType } from '@buildeross/types'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Stack } from '@buildeross/zord'
import { FormikHelpers } from 'formik'
import { encodeFunctionData, isAddress, parseEther } from 'viem'

import { type FormComponent } from '../types'
import { DroposalForm } from './DroposalForm'
import { DroposalFormValues } from './DroposalForm.schema'

const UINT_64_MAX = BigInt('18446744073709551615')
const UINT_32_MAX = BigInt('4294967295')
const HASH_ZERO =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`

export const Droposal: FormComponent = ({ resetTransactionType }) => {
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const chain = useChainStore((x) => x.chain)

  const handleDroposalTransaction = async (
    values: DroposalFormValues,
    actions: FormikHelpers<DroposalFormValues>
  ) => {
    if (!chain) return
    const {
      name,
      symbol,
      maxSupply: editionSize,
      royaltyPercentage,
      fundsRecipient,
      defaultAdmin,
      pricePerMint: publicSalePrice,
      maxPerAddress: maxSalePurchasePerAddress,
      publicSaleStart,
      publicSaleEnd,
      description,
      mediaUrl,
      mediaType,
      coverUrl,
    } = values

    const royaltyBPS = royaltyPercentage * 100
    const salesConfig = {
      publicSalePrice: parseEther((publicSalePrice || 0).toString()),
      maxSalePurchasePerAddress: maxSalePurchasePerAddress
        ? maxSalePurchasePerAddress
        : Number(UINT_32_MAX),
      publicSaleStart: BigInt(Math.floor(new Date(publicSaleStart).getTime() / 1000)),
      publicSaleEnd: BigInt(Math.floor(new Date(publicSaleEnd).getTime() / 1000)),
      presaleStart: BigInt(0), // presaleStart
      presaleEnd: BigInt(0), // presaleEnd
      presaleMerkleRoot: HASH_ZERO, // presaleMerkleRoot
    }
    const animationUri = mediaType?.startsWith('image') ? '' : mediaUrl
    const imageUri = mediaType?.startsWith('image') ? mediaUrl : coverUrl

    const recipient = await getEnsAddress(fundsRecipient)
    const admin = await getEnsAddress(defaultAdmin)

    // Validate that the resolved values are actually valid addresses
    if (!recipient || !isAddress(recipient, { strict: false })) {
      console.error('Failed to resolve valid funds recipient address')
      return
    }
    if (!admin || !isAddress(admin, { strict: false })) {
      console.error('Failed to resolve valid admin address')
      return
    }

    const createEdition = {
      target: PUBLIC_ZORA_NFT_CREATOR[chain.id] as AddressType,
      functionSignature: 'createEdition()',
      calldata: encodeFunctionData({
        abi: zoraNFTCreatorAbi,
        functionName: 'createEdition',
        args: [
          name,
          symbol,
          BigInt(editionSize) || UINT_64_MAX,
          royaltyBPS,
          recipient as AddressType,
          admin as AddressType,
          salesConfig,
          description,
          animationUri,
          imageUri,
        ],
      }),
      value: '0',
    }

    addTransaction({
      type: TransactionType.DROPOSAL,
      summary: 'Create a droposal',
      transactions: [createEdition],
    })

    actions.resetForm()

    resetTransactionType()
  }

  return (
    <Stack>
      <DroposalForm onSubmit={handleDroposalTransaction} />
    </Stack>
  )
}
