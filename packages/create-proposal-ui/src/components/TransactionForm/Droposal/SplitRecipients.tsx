'use client'

import { Box, Button, Flex, Input, Text } from '@buildeross/zord'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

import { useCreateSplit } from '../../../hooks/useCreateSplit'
import {
  formatSplitAddress,
  type SplitRecipient,
  validateSplitRecipients,
} from '../../../utils/splits'
import {
  errorText,
  removeBtn,
  row,
  successBox,
  totalRow,
  wrapper,
} from './SplitRecipients.css'

export interface SplitRecipientsProps {
  /** Called with the deployed split address once creation succeeds. */
  onSplitCreated: (address: string) => void
}

const EMPTY: SplitRecipient[] = [
  { address: '', percentAllocation: 50 },
  { address: '', percentAllocation: 50 },
]

export const SplitRecipients: React.FC<SplitRecipientsProps> = ({ onSplitCreated }) => {
  const { isConnected } = useAccount()
  const { createSplit, isPending, error, splitAddress, reset } = useCreateSplit()
  const [recipients, setRecipients] = useState<SplitRecipient[]>(EMPTY)

  const errors = validateSplitRecipients(recipients)
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
      const address = await createSplit({ recipients, distributorFeePercent: 0 })
      if (address) onSplitCreated(address)
    } catch {
      // error surfaced via `error` state
    }
  }

  return (
    <Box className={wrapper}>
      <Text fontWeight={'label'} mb={'x2'}>
        Split recipients
      </Text>
      <Text variant="paragraph-sm" color={'tertiary'} mb={'x4'}>
        Deploy a 0xSplits contract that forwards mint proceeds and royalties to these
        recipients by percentage. The split address becomes the payout address above.
      </Text>

      {recipients.map((r, i) => (
        <Box key={i} className={row}>
          <Input
            placeholder={'0x... recipient address'}
            value={r.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update(i, { address: e.target.value })
            }
          />
          <Input
            type={'number'}
            placeholder={'%'}
            value={r.percentAllocation === 0 ? '' : String(r.percentAllocation)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update(i, { percentAllocation: Number(e.target.value) })
            }
          />
          <button
            type={'button'}
            className={removeBtn}
            aria-label={`Remove recipient ${i + 1}`}
            disabled={recipients.length <= 2}
            onClick={() => removeAt(i)}
          >
            ×
          </button>
        </Box>
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

      {errors.length > 0 && <div className={errorText}>{errors[0].message}</div>}

      {splitAddress ? (
        <div className={successBox}>
          ✓ Split deployed at {formatSplitAddress(splitAddress)} — set as the payout
          address above.
        </div>
      ) : (
        <Button
          type={'button'}
          mt={'x4'}
          width={'100%'}
          loading={isPending}
          disabled={!isConnected || errors.length > 0 || isPending}
          onClick={handleCreate}
        >
          {isConnected ? 'Create split' : 'Connect wallet to create split'}
        </Button>
      )}

      {error && !splitAddress && <div className={errorText}>{error.message}</div>}

      {splitAddress && (
        <Button type={'button'} variant={'ghost'} size={'sm'} mt={'x2'} onClick={reset}>
          Create a different split
        </Button>
      )}
    </Box>
  )
}
