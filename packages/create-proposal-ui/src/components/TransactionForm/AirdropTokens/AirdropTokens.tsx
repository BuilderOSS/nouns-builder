import { useEscrowDelegate } from '@buildeross/hooks/useEscrowDelegate'
import { uploadJson } from '@buildeross/ipfs-service/upload'
import { erc20Abi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { TransactionType } from '@buildeross/types'
import { DatePicker, FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { getProvider } from '@buildeross/utils/provider'
import {
  encodeCreateMerkleInstant,
  encodeCreateMerkleLL,
  factoryMerkleInstantAbi,
  factoryMerkleLLAbi,
  getSablierAirdropFactories,
  getSablierContracts,
  getWrappedTokenAddress,
  isNativeEth,
  weth9Abi,
} from '@buildeross/utils/sablier'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import type { FormikHelpers, FormikProps } from 'formik'
import { FieldArray, Form, Formik, useFormikContext } from 'formik'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Address,
  encodeFunctionData,
  formatUnits,
  getAddress,
  isAddress,
  parseUnits,
} from 'viem'

import { CsvRecord, CsvUpload, TokenSelectionForm } from '../../shared'
import airdropTokensSchema, {
  AirdropRecipientFormValues,
  AirdropTokensValues,
} from './AirdropTokens.schema'
import { AirdropTokensDetailsDisplay } from './AirdropTokensDetailsDisplay'

const DECIMAL_REGEX = /^(\d+\.?\d*|\.\d+)$/
const MAX_RECIPIENTS = 100
const ZERO_PERCENT = 0n
const WRAPPED_NATIVE_DISPLAY_SYMBOL = 'WETH'

type ResolvedRecipient = {
  address: Address
  amount: bigint
}

const daysToSeconds = (days: number): number => Math.floor(days * 24 * 60 * 60)

const dateStringToUnix = (dateValue: string): number =>
  Math.floor(new Date(dateValue).getTime() / 1000)

const SyncAdminAddressFromEscrowDelegate = ({
  escrowDelegate,
  treasuryAddress,
}: {
  escrowDelegate?: string | null
  treasuryAddress?: string | null
}) => {
  const formik = useFormikContext<AirdropTokensValues>()

  useEffect(() => {
    const preferred = escrowDelegate || treasuryAddress || ''
    if (!preferred) return

    const current = String(formik.values.adminAddress || '')
    const touched = Boolean(formik.touched.adminAddress)

    const manuallyEdited =
      current.length > 0 &&
      current !== String(treasuryAddress || '') &&
      current !== String(escrowDelegate || '')

    if (!touched && !manuallyEdited && current !== preferred) {
      formik.setFieldValue('adminAddress', preferred, false)
    }
  }, [escrowDelegate, treasuryAddress, formik])

  return null
}

export const AirdropTokens: React.FC = () => {
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const resetTransactionType = useProposalStore((state) => state.resetTransactionType)
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  const [csvError, setCsvError] = useState<string>('')
  const [ipfsStatus, setIpfsStatus] = useState<string>('')

  const factories = useMemo(() => getSablierAirdropFactories(chain.id), [chain.id])
  const lockup = useMemo(() => getSablierContracts(chain.id).lockup, [chain.id])

  const { escrowDelegate } = useEscrowDelegate({
    chainId: chain.id,
    tokenAddress: addresses.token,
    treasuryAddress: addresses.treasury,
  })

  const initialValues: AirdropTokensValues = useMemo(
    () => ({
      airdropType: 'instant',
      campaignName: '',
      adminAddress: addresses.treasury || '',
      campaignStartDate: '',
      expirationDate: '',
      vestingStartDate: '',
      totalDurationDays: 365,
      cliffDurationDays: 0,
      cancelable: true,
      transferable: false,
      tokenAddress: undefined,
      tokenMetadata: undefined,
      recipients: [{ recipientAddress: '', amount: '' }],
    }),
    [addresses.treasury]
  )

  const handleCsvParsed = useCallback(
    (records: CsvRecord[], formik: FormikProps<AirdropTokensValues>) => {
      setCsvError('')
      const recipients = records.map((record) => ({
        recipientAddress: record.address,
        amount: record.amount,
      }))
      formik.setFieldValue('recipients', recipients)
    },
    []
  )

  const handleCsvError = useCallback((error: string) => {
    setCsvError(error)
  }, [])

  const handleAddRecipient = useCallback(
    (push: (obj: AirdropRecipientFormValues) => void) => {
      push({ recipientAddress: '', amount: '' })
    },
    []
  )

  const resolveRecipients = async (
    values: AirdropTokensValues,
    actions: FormikHelpers<AirdropTokensValues>,
    tokenDecimals: number
  ): Promise<ResolvedRecipient[] | null> => {
    const resolvedRecipients: ResolvedRecipient[] = []

    for (let i = 0; i < values.recipients.length; i++) {
      const recipient = values.recipients[i]

      let resolvedAddress: string
      try {
        const resolved = await getEnsAddress(
          recipient.recipientAddress,
          getProvider(chain.id)
        )
        if (!resolved || !isAddress(resolved, { strict: false })) {
          actions.setErrors({
            recipients: `Recipient #${i + 1}: Could not resolve address. Please enter a valid address or ENS name.`,
          } as any)
          return null
        }
        resolvedAddress = resolved
      } catch (error) {
        console.error(`Error resolving recipient address for recipient #${i + 1}:`, error)
        actions.setErrors({
          recipients: `Recipient #${i + 1}: Failed to resolve address. Please check your network connection and try again.`,
        } as any)
        return null
      }

      let normalizedRecipient: Address
      try {
        normalizedRecipient = getAddress(resolvedAddress) as Address
      } catch (error) {
        console.error(`Invalid recipient address for recipient #${i + 1}:`, error)
        actions.setErrors({
          recipients: `Recipient #${i + 1}: Invalid address format.`,
        } as any)
        return null
      }

      let amount: bigint
      try {
        amount = parseUnits(recipient.amount, tokenDecimals)
      } catch (error) {
        console.error(`Error parsing amount for recipient #${i + 1}:`, error)
        actions.setErrors({
          recipients: `Recipient #${i + 1}: Invalid amount format.`,
        } as any)
        return null
      }

      resolvedRecipients.push({ address: normalizedRecipient, amount })
    }

    return resolvedRecipients
  }

  const handleSubmit = async (
    values: AirdropTokensValues,
    actions: FormikHelpers<AirdropTokensValues>
  ) => {
    if (!values.tokenMetadata || !values.recipients.length || !addresses.treasury) return

    const factoryAddress =
      values.airdropType === 'instant'
        ? factories.factoryMerkleInstant
        : factories.factoryMerkleLL

    if (!factoryAddress) {
      actions.setStatus('Sablier airdrop factory is not deployed on this network.')
      return
    }

    if (values.airdropType === 'll' && !lockup) {
      actions.setStatus('Sablier lockup contract is not deployed on this network.')
      return
    }

    setIpfsStatus('')

    const isEth = isNativeEth(values.tokenMetadata.address)
    const tokenDecimals = values.tokenMetadata.decimals
    const tokenSymbol = values.tokenMetadata.symbol
    const displaySymbol = isEth ? WRAPPED_NATIVE_DISPLAY_SYMBOL : tokenSymbol
    const wrappedTokenAddress = isEth ? getWrappedTokenAddress(chain.id) : null

    if (isEth && !wrappedTokenAddress) {
      actions.setStatus('Wrapped token not configured for this chain.')
      return
    }

    let normalizedAdminAddress: Address
    try {
      const resolved = await getEnsAddress(values.adminAddress, getProvider(chain.id))
      if (!resolved || !isAddress(resolved, { strict: false })) {
        actions.setFieldError('adminAddress', 'Could not resolve a valid admin address.')
        return
      }
      normalizedAdminAddress = getAddress(resolved) as Address
    } catch (error) {
      console.error('Error resolving admin address:', error)
      actions.setFieldError('adminAddress', 'Failed to resolve admin address.')
      return
    }

    const resolvedRecipients = await resolveRecipients(values, actions, tokenDecimals)
    if (!resolvedRecipients) return

    const uniqueRecipients = new Set(
      resolvedRecipients.map((r) => r.address.toLowerCase())
    )
    if (uniqueRecipients.size !== resolvedRecipients.length) {
      actions.setStatus('Duplicate recipient addresses are not allowed.')
      return
    }

    const totalAmount = resolvedRecipients.reduce((sum, r) => sum + r.amount, 0n)
    const recipientCount = BigInt(resolvedRecipients.length)

    let root: `0x${string}`
    let cid: string

    try {
      setIpfsStatus('Generating merkle tree...')

      const leafTuples = resolvedRecipients.map((recipient, index) => [
        index.toString(),
        recipient.address,
        recipient.amount.toString(),
      ])

      const tree = StandardMerkleTree.of(leafTuples, ['uint256', 'address', 'uint256'])
      root = tree.root as `0x${string}`

      const ipfsPayload = {
        merkle_tree: JSON.stringify(tree.dump()),
        number_of_recipients: resolvedRecipients.length,
        recipients: resolvedRecipients.map((recipient) => ({
          address: recipient.address,
          amount: recipient.amount.toString(),
        })),
        root,
        total_amount: totalAmount.toString(),
      }

      setIpfsStatus('Uploading merkle tree to IPFS...')
      const uploadResult = await uploadJson(ipfsPayload)
      cid = uploadResult.cid
      setIpfsStatus(`Uploaded merkle tree: ${cid}`)
    } catch (error: any) {
      console.error('Merkle/IPFS processing failed:', error)
      actions.setStatus(
        `Failed to prepare merkle tree: ${error?.message || 'unknown error'}`
      )
      return
    }

    const campaignStartTime = dateStringToUnix(values.campaignStartDate)
    const expiration = dateStringToUnix(values.expirationDate)

    const tokenAddressForFactory = (
      isEth ? wrappedTokenAddress : values.tokenMetadata.address
    ) as Address

    const transactions = []

    if (isEth) {
      transactions.push({
        target: wrappedTokenAddress as Address,
        functionSignature: 'deposit()',
        calldata: encodeFunctionData({ abi: weth9Abi, functionName: 'deposit' }),
        value: totalAmount.toString(),
      })
    }

    let merkleCampaignAddress: Address
    const publicClient = getProvider(chain.id)

    try {
      if (values.airdropType === 'instant') {
        const instantParams = {
          campaignName: values.campaignName,
          campaignStartTime,
          expiration,
          initialAdmin: normalizedAdminAddress,
          ipfsCID: cid,
          merkleRoot: root,
          token: tokenAddressForFactory,
        }

        merkleCampaignAddress = (await publicClient.readContract({
          address: factoryAddress,
          abi: factoryMerkleInstantAbi,
          functionName: 'computeMerkleInstant',
          args: [addresses.treasury, instantParams],
        })) as Address

        const calldata = encodeCreateMerkleInstant(
          instantParams,
          totalAmount,
          recipientCount
        )

        transactions.push({
          target: factoryAddress,
          functionSignature:
            'createMerkleInstant((string,uint40,uint40,address,string,bytes32,address),uint256,uint256)',
          calldata,
          value: '0',
        })
      } else {
        const vestingStartTime = dateStringToUnix(values.vestingStartDate || '')
        const totalDuration = daysToSeconds(values.totalDurationDays || 0)
        const cliffDuration = daysToSeconds(values.cliffDurationDays || 0)

        const llParams = {
          campaignName: values.campaignName,
          campaignStartTime,
          cancelable: values.cancelable,
          cliffDuration,
          cliffUnlockPercentage: ZERO_PERCENT,
          expiration,
          initialAdmin: normalizedAdminAddress,
          ipfsCID: cid,
          lockup: lockup as Address,
          merkleRoot: root,
          shape: 'linear',
          startUnlockPercentage: ZERO_PERCENT,
          token: tokenAddressForFactory,
          totalDuration,
          transferable: values.transferable,
          vestingStartTime,
        }

        merkleCampaignAddress = (await publicClient.readContract({
          address: factoryAddress,
          abi: factoryMerkleLLAbi,
          functionName: 'computeMerkleLL',
          args: [addresses.treasury, llParams],
        })) as Address

        const calldata = encodeCreateMerkleLL(llParams, totalAmount, recipientCount)

        transactions.push({
          target: factoryAddress,
          functionSignature:
            'createMerkleLL((string,uint40,bool,uint40,uint256,uint40,address,string,address,bytes32,string,uint256,address,uint40,bool,uint40),uint256,uint256)',
          calldata,
          value: '0',
        })
      }

      transactions.push({
        target: tokenAddressForFactory,
        functionSignature: 'transfer(address,uint256)',
        calldata: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [merkleCampaignAddress, totalAmount],
        }),
        value: '0',
      })
    } catch (error: any) {
      console.error('Failed to encode airdrop transaction:', error)
      actions.setStatus(
        error?.message || 'Failed to build deterministic campaign deployment transaction.'
      )
      return
    }

    const formattedTotal = formatCryptoVal(formatUnits(totalAmount, tokenDecimals))
    const summary =
      values.airdropType === 'instant'
        ? `Create Instant airdrop of ${formattedTotal} ${displaySymbol} to ${resolvedRecipients.length} recipients`
        : `Create LL airdrop of ${formattedTotal} ${displaySymbol} to ${resolvedRecipients.length} recipients`

    addTransaction({
      type: TransactionType.AIRDROP_TOKENS,
      title: 'Airdrop Tokens',
      summary,
      transactions,
    })

    actions.resetForm()
    setCsvError('')
    setIpfsStatus('')
    resetTransactionType()
  }

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        enableReinitialize={false}
        validationSchema={airdropTokensSchema()}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => {
          const decimals = formik.values.tokenMetadata?.decimals ?? 18
          const rawSymbol = formik.values.tokenMetadata?.symbol ?? ''
          const isEth =
            !!formik.values.tokenMetadata?.address &&
            isNativeEth(formik.values.tokenMetadata.address)
          const symbol = isEth ? WRAPPED_NATIVE_DISPLAY_SYMBOL : rawSymbol
          const balance = formik.values.tokenMetadata?.balance ?? 0n
          const isValid = formik.values.tokenMetadata?.isValid ?? false

          const totalInUnits = formik.values.recipients
            .map((recipient) => {
              if (!recipient.amount || !DECIMAL_REGEX.test(recipient.amount)) return 0n
              const num = parseFloat(recipient.amount)
              if (isNaN(num) || num <= 0) return 0n
              try {
                return parseUnits(recipient.amount, decimals)
              } catch {
                return 0n
              }
            })
            .reduce((acc, x) => acc + x, 0n)

          const totalAmountString = isValid
            ? `${formatCryptoVal(formatUnits(totalInUnits, decimals))} ${symbol}`
            : undefined

          const balanceError =
            isValid && balance < totalInUnits
              ? `Total amount exceeds treasury balance of ${formatCryptoVal(formatUnits(balance, decimals))} ${symbol}.`
              : undefined

          const factorySupported =
            formik.values.airdropType === 'instant'
              ? !!factories.factoryMerkleInstant
              : !!factories.factoryMerkleLL && !!lockup

          const allErrors = balanceError
            ? {
                ...formik.errors,
                totalAmount: balanceError,
              }
            : formik.errors

          return (
            <Box
              data-testid="airdrop-tokens-form"
              as={'fieldset'}
              disabled={formik.isValidating || formik.isSubmitting}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Form>
                <SyncAdminAddressFromEscrowDelegate
                  escrowDelegate={escrowDelegate}
                  treasuryAddress={addresses.treasury}
                />
                <Stack gap={'x5'}>
                  <AirdropTokensDetailsDisplay
                    totalAmountWithSymbol={totalAmountString}
                    recipientCount={formik.values.recipients.length}
                    ipfsStatus={ipfsStatus}
                  />

                  <Text variant="paragraph-sm" color="text3">
                    Create Sablier airdrop campaigns from treasury funds using a merkle
                    tree and IPFS metadata.
                  </Text>

                  <Box>
                    <Text variant="label-sm" mb="x2">
                      Airdrop Type
                    </Text>
                    <Flex gap="x4" align="center">
                      <label
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <input
                          type="radio"
                          name="airdropType"
                          value="instant"
                          checked={formik.values.airdropType === 'instant'}
                          onChange={() => formik.setFieldValue('airdropType', 'instant')}
                        />
                        <Text>Instant</Text>
                      </label>
                      <label
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <input
                          type="radio"
                          name="airdropType"
                          value="ll"
                          checked={formik.values.airdropType === 'll'}
                          onChange={() => formik.setFieldValue('airdropType', 'll')}
                        />
                        <Text>LL (Linear Vesting)</Text>
                      </label>
                    </Flex>
                    <Text variant="paragraph-sm" color="text3" mt="x2">
                      Instant sends claimable tokens immediately. LL creates a linear
                      vesting stream when users claim.
                    </Text>
                  </Box>

                  <SmartInput
                    type={FIELD_TYPES.TEXT}
                    formik={formik}
                    {...formik.getFieldProps('campaignName')}
                    id="campaignName"
                    inputLabel="Campaign Name"
                    placeholder="Builders Airdrop"
                    errorMessage={
                      formik.touched.campaignName && formik.errors.campaignName
                        ? formik.errors.campaignName
                        : undefined
                    }
                    helperText="Displayed as the campaign name in Sablier and proposal details."
                  />

                  <TokenSelectionForm />
                  {formik.values.tokenMetadata?.isValid ? (
                    <>
                      <SmartInput
                        type={FIELD_TYPES.TEXT}
                        formik={formik}
                        {...formik.getFieldProps('adminAddress')}
                        id="adminAddress"
                        inputLabel="Admin / Delegate"
                        placeholder="0x... or ENS name"
                        isAddress={true}
                        helperText="This wallet will control the airdrop campaign. It can cancel streams (if enabled), claw back after expiration, and manage campaign settings."
                        errorMessage={
                          formik.touched.adminAddress && formik.errors.adminAddress
                            ? formik.errors.adminAddress
                            : undefined
                        }
                      />

                      <DatePicker
                        {...formik.getFieldProps('campaignStartDate')}
                        placeholder={'yyyy-mm-dd'}
                        inputLabel={'Campaign Start Date'}
                        formik={formik}
                        id={'campaignStartDate'}
                        autoSubmit={false}
                        dateFormat="Y-m-d"
                        errorMessage={
                          formik.touched.campaignStartDate &&
                          formik.errors.campaignStartDate
                            ? formik.errors.campaignStartDate
                            : undefined
                        }
                        helperText="Claims are blocked until this date."
                      />

                      <DatePicker
                        {...formik.getFieldProps('expirationDate')}
                        placeholder={'yyyy-mm-dd'}
                        inputLabel={'Expiration Date'}
                        formik={formik}
                        id={'expirationDate'}
                        autoSubmit={false}
                        dateFormat="Y-m-d"
                        errorMessage={
                          formik.touched.expirationDate && formik.errors.expirationDate
                            ? formik.errors.expirationDate
                            : undefined
                        }
                        helperText="Claims stop after this date; admin can claw back remaining funds."
                      />

                      {formik.values.airdropType === 'll' && (
                        <Stack gap={'x4'}>
                          <DatePicker
                            {...formik.getFieldProps('vestingStartDate')}
                            placeholder={'yyyy-mm-dd'}
                            inputLabel={'Vesting Start Date'}
                            formik={formik}
                            id={'vestingStartDate'}
                            autoSubmit={false}
                            dateFormat="Y-m-d"
                            errorMessage={
                              formik.touched.vestingStartDate &&
                              formik.errors.vestingStartDate
                                ? formik.errors.vestingStartDate
                                : undefined
                            }
                            helperText="Vesting schedule anchor for LL streams. Claiming later can unlock accrued portions immediately."
                          />

                          <SmartInput
                            type={FIELD_TYPES.NUMBER}
                            formik={formik}
                            {...formik.getFieldProps('totalDurationDays')}
                            id="totalDurationDays"
                            inputLabel="Vesting Duration (days)"
                            placeholder="365"
                            min={1}
                            step={1}
                            errorMessage={
                              formik.touched.totalDurationDays &&
                              formik.errors.totalDurationDays
                                ? String(formik.errors.totalDurationDays)
                                : undefined
                            }
                            helperText="Total length of the vesting stream, counted from vesting start date."
                          />

                          <SmartInput
                            type={FIELD_TYPES.NUMBER}
                            formik={formik}
                            {...formik.getFieldProps('cliffDurationDays')}
                            id="cliffDurationDays"
                            inputLabel="Cliff Duration (days)"
                            placeholder="0"
                            min={0}
                            step={1}
                            errorMessage={
                              formik.touched.cliffDurationDays &&
                              formik.errors.cliffDurationDays
                                ? String(formik.errors.cliffDurationDays)
                                : undefined
                            }
                            helperText="No vesting unlocks before the cliff. Use 0 for immediate linear vesting."
                          />

                          <Text variant="label-sm" mb="x1">
                            Stream Options
                          </Text>

                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formik.values.cancelable}
                              onChange={(e) =>
                                formik.setFieldValue('cancelable', e.target.checked)
                              }
                            />
                            <Box>
                              <Text fontWeight="label">Cancelable</Text>
                              <Text variant="paragraph-sm" color="text3">
                                Allow admin to cancel streams and recover remaining
                                unvested tokens
                              </Text>
                            </Box>
                          </label>

                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formik.values.transferable}
                              onChange={(e) =>
                                formik.setFieldValue('transferable', e.target.checked)
                              }
                            />
                            <Box>
                              <Text fontWeight="label">Transferable</Text>
                              <Text variant="paragraph-sm" color="text3">
                                Allow recipients to transfer their vested stream NFT
                              </Text>
                            </Box>
                          </label>
                        </Stack>
                      )}

                      <Box mt={'x5'}>
                        <CsvUpload
                          onCsvParsed={(records) => handleCsvParsed(records, formik)}
                          onError={handleCsvError}
                          disabled={formik.isValidating || formik.isSubmitting}
                          templateFilename="sablier_airdrop.csv"
                          templateContent="address,amount&#10;0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e,42.5&#10;0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe,85.25"
                          maxRecords={MAX_RECIPIENTS}
                          validateAmount={(amount, rowIndex) => {
                            if (!amount) return `Row ${rowIndex + 1}: Missing amount`
                            if (!DECIMAL_REGEX.test(amount)) {
                              return `Row ${rowIndex + 1}: Invalid amount format (use decimal, no scientific notation)`
                            }
                            const num = parseFloat(amount)
                            if (isNaN(num) || num <= 0) {
                              return `Row ${rowIndex + 1}: Amount must be greater than 0`
                            }
                            return null
                          }}
                        />

                        {csvError && (
                          <Box
                            mt="x3"
                            p="x3"
                            backgroundColor="negative"
                            borderRadius="curved"
                          >
                            <Text
                              color="onNegative"
                              fontSize="14"
                              style={{ whiteSpace: 'pre-line' }}
                            >
                              {csvError}
                            </Text>
                          </Box>
                        )}

                        <FieldArray name="recipients">
                          {({ push, remove }) => (
                            <>
                              <Box mt="x6">
                                <Flex justify="space-between" align="center" mb="x4">
                                  <Text fontWeight="display">Recipients</Text>
                                  <Text fontSize="14" color="text3">
                                    {formik.values.recipients.length} recipient
                                    {formik.values.recipients.length === 1
                                      ? ''
                                      : 's'} • {totalAmountString || '0'}
                                  </Text>
                                </Flex>

                                <Flex direction="column" gap="x4">
                                  {formik.values.recipients.map((_recipient, index) => {
                                    const getFieldError = (
                                      fieldName: keyof AirdropRecipientFormValues
                                    ): string | undefined => {
                                      const recipientError =
                                        formik.errors.recipients?.[index]
                                      if (
                                        !recipientError ||
                                        typeof recipientError === 'string'
                                      ) {
                                        return undefined
                                      }
                                      const error = (recipientError as any)[fieldName]
                                      return error ? String(error) : undefined
                                    }

                                    return (
                                      <Box
                                        key={index}
                                        p="x4"
                                        borderRadius="curved"
                                        borderStyle="solid"
                                        borderWidth="thin"
                                        borderColor="border"
                                        backgroundColor="background1"
                                      >
                                        <Flex align="center" gap="x3">
                                          <Box flex="2" style={{ marginBottom: '-32px' }}>
                                            <SmartInput
                                              type={FIELD_TYPES.TEXT}
                                              formik={formik}
                                              {...formik.getFieldProps(
                                                `recipients.${index}.recipientAddress`
                                              )}
                                              id={`recipients.${index}.recipientAddress`}
                                              inputLabel={
                                                index === 0 ? 'Recipient Address' : ''
                                              }
                                              placeholder={'0x... or ENS name'}
                                              isAddress={true}
                                              errorMessage={
                                                formik.touched.recipients?.[index]
                                                  ?.recipientAddress
                                                  ? getFieldError('recipientAddress')
                                                  : undefined
                                              }
                                            />
                                          </Box>

                                          <Box flex="1" style={{ marginBottom: '-32px' }}>
                                            <SmartInput
                                              id={`recipients.${index}.amount`}
                                              inputLabel={index === 0 ? 'Amount' : ''}
                                              type={FIELD_TYPES.TEXT}
                                              formik={formik}
                                              {...formik.getFieldProps(
                                                `recipients.${index}.amount`
                                              )}
                                              placeholder={'0'}
                                              errorMessage={
                                                formik.touched.recipients?.[index]?.amount
                                                  ? getFieldError('amount')
                                                  : undefined
                                              }
                                            />
                                          </Box>

                                          {formik.values.recipients.length > 1 && (
                                            <Flex
                                              h="100%"
                                              align="center"
                                              justify="center"
                                            >
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => remove(index)}
                                                disabled={
                                                  formik.isValidating ||
                                                  formik.isSubmitting
                                                }
                                                style={{
                                                  alignSelf:
                                                    index === 0 ? 'flex-end' : 'center',
                                                  paddingRight: '4px',
                                                  paddingLeft: '4px',
                                                  minWidth: '32px',
                                                  marginTop: index === 0 ? '32px' : '0',
                                                }}
                                              >
                                                <Icon id="cross" />
                                              </Button>
                                            </Flex>
                                          )}
                                        </Flex>
                                      </Box>
                                    )
                                  })}

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddRecipient(push)}
                                    disabled={
                                      formik.isValidating ||
                                      formik.isSubmitting ||
                                      formik.values.recipients.length >= MAX_RECIPIENTS
                                    }
                                    style={{ alignSelf: 'flex-start' }}
                                  >
                                    <Icon id="plus" />
                                    Add Recipient
                                  </Button>
                                </Flex>
                              </Box>
                            </>
                          )}
                        </FieldArray>
                      </Box>
                    </>
                  ) : (
                    <Text variant="paragraph-sm" color="text3">
                      Select a token to continue configuring this airdrop.
                    </Text>
                  )}

                  {formik.values.tokenMetadata?.isValid && (
                    <>
                      {!factorySupported && (
                        <Text color="negative">
                          - This network does not currently support the selected Sablier
                          airdrop type.
                        </Text>
                      )}

                      {!!formik.status && (
                        <Text color="negative">- {String(formik.status)}</Text>
                      )}

                      <Button
                        mt={'x9'}
                        variant={'outline'}
                        borderRadius={'curved'}
                        type="submit"
                        disabled={
                          formik.isSubmitting ||
                          !formik.values.tokenMetadata?.isValid ||
                          formik.values.recipients.length === 0 ||
                          !!balanceError ||
                          !!csvError ||
                          !factorySupported ||
                          Object.keys(allErrors).length > 0
                        }
                      >
                        {formik.isSubmitting
                          ? 'Adding Transaction to Queue...'
                          : 'Add Transaction to Queue'}
                      </Button>

                      {!formik.isValidating && Object.keys(allErrors).length > 0 && (
                        <Stack mt="x2" gap="x1">
                          {Object.entries(allErrors).flatMap(([key, error]) => {
                            if (typeof error === 'string') {
                              return [
                                <Text key={key} color="negative" textAlign="left">
                                  - {error}
                                </Text>,
                              ]
                            }

                            if (key === 'recipients' && Array.isArray(error)) {
                              return error.flatMap((recipientError, index) => {
                                if (
                                  typeof recipientError === 'object' &&
                                  recipientError !== null
                                ) {
                                  return Object.entries(recipientError).map(
                                    ([field, msg]) => (
                                      <Text
                                        key={`recipient-${index}-${field}`}
                                        color="negative"
                                        textAlign="left"
                                      >
                                        - Recipient {index + 1} {field}: {String(msg)}
                                      </Text>
                                    )
                                  )
                                }
                                return []
                              })
                            }

                            return []
                          })}
                        </Stack>
                      )}
                    </>
                  )}

                  {formik.values.recipients.length === 1 &&
                    formik.values.recipients[0].recipientAddress &&
                    totalAmountString && (
                      <Text variant="paragraph-sm" color="text3">
                        Preview: {totalAmountString} to{' '}
                        {walletSnippet(formik.values.recipients[0].recipientAddress)}
                      </Text>
                    )}
                </Stack>
              </Form>
            </Box>
          )
        }}
      </Formik>
    </Box>
  )
}
