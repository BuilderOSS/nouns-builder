'use client'

import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useChainStore } from '@buildeross/stores'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'

import { useCreateSplit } from '../../../hooks/useCreateSplit'
import {
  formatSplitAddress,
  type SplitRecipient,
  validateSplitRecipients,
} from '../../../utils/splits'
import { SplitFlowChart } from './SplitFlowChart'
import {
  allocBarFill,
  allocBarTrack,
  errorText,
  hintText,
  removeBtn,
  row,
  successBox,
  totalRow,
  wrapper,
} from './SplitRecipients.css'

export interface SplitRecipientsProps {
  /** Called with the deployed split address once creation succeeds. */
  onSplitCreated: (address: string) => void
  /** Display mode: 'edit' allows creating/editing split, 'view' shows read-only summary */
  mode?: 'edit' | 'view'
  /** The currently active split address (used in view mode) */
  activeSplitAddress?: string | null
  /** Called when user wants to edit an existing split */
  onEditSplit?: () => void
}

/** What a recipient's raw input resolved to (ENS/basename or a plain address). */
type Resolution = { ethAddress?: Address; isLoading: boolean }

/**
 * Cache key for a recipient's raw input. Keyed by the input rather than the row
 * index so resolutions survive adding, removing, and reordering recipients.
 */
const cacheKey = (input: string) => input.trim().toLowerCase()

/** The row an address error belongs to, or undefined for a list-wide error. */
const addressErrorRow = (field: string): number | undefined => {
  const match = /^recipients\[(\d+)\]\.address$/.exec(field)
  return match ? Number(match[1]) : undefined
}

const EMPTY: SplitRecipient[] = [
  { address: '', percentAllocation: 50 },
  { address: '', percentAllocation: 50 },
]

interface RecipientRowProps {
  index: number
  recipient: SplitRecipient
  canRemove: boolean
  hasAddressError: boolean
  onChange: (index: number, patch: Partial<SplitRecipient>) => void
  onRemove: (index: number) => void
  onResolve: (key: string, resolution: Resolution) => void
}

/**
 * One recipient row. Resolves its own input through `useEnsData` — which accepts
 * an address, an ENS name, or a basename — and reports the resolved address back
 * up so the parent can validate and deploy against real addresses.
 */
const RecipientRow: React.FC<RecipientRowProps> = ({
  index,
  recipient,
  canRemove,
  hasAddressError,
  onChange,
  onRemove,
  onResolve,
}) => {
  const input = recipient.address.trim()
  const { ethAddress, isLoading } = useEnsData(input || undefined)

  useEffect(() => {
    if (!input) return
    onResolve(cacheKey(input), { ethAddress, isLoading })
  }, [input, ethAddress, isLoading, onResolve])

  return (
    <Box className={row}>
      <SmartInput
        id={`split-recipient-address-${index}`}
        type={FIELD_TYPES.TEXT}
        placeholder={'0x… or ENS name'}
        value={recipient.address}
        isAddress
        errorMessage={hasAddressError ? 'Invalid' : undefined}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(index, { address: e.target.value })
        }
      />
      <SmartInput
        id={`split-recipient-allocation-${index}`}
        type={FIELD_TYPES.NUMBER}
        placeholder={'%'}
        value={recipient.percentAllocation === 0 ? '' : recipient.percentAllocation}
        min={0}
        max={100}
        step={0.01}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(index, { percentAllocation: Number(e.target.value) })
        }
      />
      <button
        type={'button'}
        className={removeBtn}
        aria-label={`Remove recipient ${index + 1}`}
        disabled={!canRemove}
        onClick={() => onRemove(index)}
      >
        <Icon id={'cross-16'} size={'sm'} />
      </button>
    </Box>
  )
}

export const SplitRecipients: React.FC<SplitRecipientsProps> = ({
  onSplitCreated,
  mode = 'edit',
  activeSplitAddress,
  onEditSplit,
}) => {
  const chainId = useChainStore((x) => x.chain.id)
  const { createSplit, isPending, error, splitAddress, txHash, reset } = useCreateSplit()
  const [recipients, setRecipients] = useState<SplitRecipient[]>(EMPTY)
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>({})

  const handleResolve = useCallback((key: string, resolution: Resolution) => {
    setResolutions((prev) => {
      const existing = prev[key]
      if (
        existing &&
        existing.ethAddress === resolution.ethAddress &&
        existing.isLoading === resolution.isLoading
      )
        return prev
      return { ...prev, [key]: resolution }
    })
  }, [])

  /** Recipients with every input replaced by the address it resolves to. */
  const resolved = useMemo(
    () =>
      recipients.map((r) => {
        const key = cacheKey(r.address)
        return {
          ...r,
          address: (key && resolutions[key]?.ethAddress) || r.address.trim(),
        }
      }),
    [recipients, resolutions]
  )

  /* A name still in flight isn't an invalid address — hold validation until it lands. */
  const isResolving = useMemo(
    () =>
      recipients.some((r) => {
        const key = cacheKey(r.address)
        if (!key) return false
        const resolution = resolutions[key]
        return !resolution || (resolution.isLoading && !resolution.ethAddress)
      }),
    [recipients, resolutions]
  )

  const errors = useMemo(() => validateSplitRecipients(resolved), [resolved])
  /* An address the user typed that didn't resolve — marked on the row itself. */
  const invalidRows = useMemo(() => {
    if (isResolving) return new Set<number>()
    const rows = new Set<number>()
    errors.forEach(({ field }) => {
      const index = addressErrorRow(field)
      if (index !== undefined && recipients[index]?.address.trim()) rows.add(index)
    })
    return rows
  }, [errors, isResolving, recipients])

  /*
    Everything the rows don't already say: allocation and duplicate problems, plus
    the still-empty rows — those stay visually neutral, but shouldn't leave a
    disabled Create button with no explanation.
  */
  const summaryError = errors.find(({ field }) => {
    const index = addressErrorRow(field)
    return index === undefined || !invalidRows.has(index)
  })

  /*
    The transaction went out but we never saw a CreateSplit log, so a split may
    or may not exist at this point. Deploying again on a guess would burn gas on
    a duplicate, so the user has to look at the transaction and say so.
  */
  const outcomeUnknown = !!error && !!txHash && !splitAddress

  const total = recipients.reduce((s, r) => s + (Number(r.percentAllocation) || 0), 0)

  const update = (i: number, patch: Partial<SplitRecipient>) =>
    setRecipients((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const add = () => setRecipients((rs) => [...rs, { address: '', percentAllocation: 0 }])
  const removeAt = (i: number) => setRecipients((rs) => rs.filter((_, idx) => idx !== i))
  const splitEvenly = () => {
    const each = Math.floor((100 / recipients.length) * 100) / 100
    const remainder = Math.round((100 - each * recipients.length) * 100) / 100
    setRecipients((rs) =>
      rs.map((r, idx) => ({
        ...r,
        percentAllocation: idx === 0 ? each + remainder : each,
      }))
    )
  }

  const handleCreate = async () => {
    try {
      const address = await createSplit({
        recipients: resolved,
        distributorFeePercent: 0,
      })
      if (address) onSplitCreated(address)
    } catch {
      // error surfaced via `error` state
    }
  }

  // View mode: show read-only summary of active split
  if (mode === 'view' && activeSplitAddress) {
    return (
      <Box className={wrapper}>
        <div className={successBox}>
          Split contract deployed at {formatSplitAddress(activeSplitAddress)}
          {recipients.length > 0 && (
            <>
              {' with '}
              {recipients.length} recipient{recipients.length > 1 ? 's' : ''}
            </>
          )}
        </div>

        {recipients.length > 0 && (
          <Box mt={'x4'}>
            <SplitFlowChart recipients={resolved} />
          </Box>
        )}

        <Flex gap={'x2'} mt={'x4'}>
          <Button
            type={'button'}
            variant={'secondary'}
            size={'sm'}
            onClick={() => {
              reset()
              onEditSplit?.()
            }}
          >
            Create a different split
          </Button>
          <Button
            type={'button'}
            variant={'ghost'}
            size={'sm'}
            onClick={() => {
              window.open(
                `${ETHERSCAN_BASE_URL[chainId]}/address/${activeSplitAddress}`,
                '_blank'
              )
            }}
          >
            View on explorer
          </Button>
        </Flex>
      </Box>
    )
  }

  // Edit mode: full creation/editing interface
  return (
    <Box className={wrapper}>
      <Text fontWeight={'label'} mb={'x2'}>
        Split recipients
      </Text>
      <Text variant="paragraph-sm" color={'tertiary'} mb={'x4'}>
        Deploy a 0xSplits contract that forwards mint proceeds and royalties to these
        recipients by percentage. The split address becomes the payout address above.
      </Text>

      <Box mb={'x4'}>
        <SplitFlowChart recipients={resolved} />
      </Box>

      {recipients.map((r, i) => (
        <RecipientRow
          key={i}
          index={i}
          recipient={r}
          canRemove={recipients.length > 2}
          hasAddressError={invalidRows.has(i)}
          onChange={update}
          onRemove={removeAt}
          onResolve={handleResolve}
        />
      ))}

      <Flex gap={'x2'} mt={'x2'}>
        <Button type={'button'} variant={'secondary'} size={'sm'} onClick={add}>
          Add recipient
        </Button>
        <Button type={'button'} variant={'ghost'} size={'sm'} onClick={splitEvenly}>
          Split evenly
        </Button>
      </Flex>

      <Box className={totalRow}>
        <Text color={'tertiary'}>Total allocation</Text>
        <Text color={Math.abs(total - 100) < 0.0001 ? 'positive' : 'negative'}>
          {total.toFixed(2)}%
        </Text>
      </Box>
      <div className={allocBarTrack}>
        <div
          className={allocBarFill}
          style={{
            width: `${Math.min(total, 100)}%`,
            background: Math.abs(total - 100) < 0.0001 ? '#10b981' : '#f5a623',
          }}
        />
      </div>

      {isResolving ? (
        <div className={hintText}>Resolving names…</div>
      ) : (
        summaryError && <div className={errorText}>{summaryError.message}</div>
      )}

      {splitAddress ? (
        <div className={successBox}>
          Split contract deployed at {formatSplitAddress(splitAddress)}
          {recipients.length > 0 && (
            <>
              {' with '}
              {recipients.length} recipient{recipients.length > 1 ? 's' : ''}
            </>
          )}
        </div>
      ) : (
        <ContractButton
          chainId={chainId}
          mt={'x4'}
          width={'100%'}
          loading={isPending}
          disabled={errors.length > 0 || isPending || isResolving || outcomeUnknown}
          handleClick={handleCreate}
        >
          Create split
        </ContractButton>
      )}

      {error && !splitAddress && (
        <>
          <div className={errorText}>{error.message}</div>
          {outcomeUnknown && (
            <div className={hintText}>
              The transaction was already submitted, so a split may have been deployed.{' '}
              <a
                href={`${ETHERSCAN_BASE_URL[chainId]}/tx/${txHash}`}
                target={'_blank'}
                rel={'noreferrer noopener'}
              >
                Check it on the explorer
              </a>{' '}
              before creating another one.
            </div>
          )}
        </>
      )}

      {(splitAddress || outcomeUnknown) && (
        <Button type={'button'} variant={'ghost'} size={'sm'} mt={'x2'} onClick={reset}>
          {splitAddress ? 'Create a different split' : "I've checked — start over"}
        </Button>
      )}
    </Box>
  )
}
