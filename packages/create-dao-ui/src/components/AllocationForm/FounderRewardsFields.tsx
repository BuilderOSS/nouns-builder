import { SmartInput } from '@buildeross/ui/Fields'
import { Flex, Heading, Paragraph, Stack } from '@buildeross/zord'
import React from 'react'

interface FounderRewardsFieldsProps {
  founderRewardRecipient: string
  founderRewardBps: number
  setFounderRewardRecipient: (recipient: string) => void
  setFounderRewardBps: (bps: number) => void
  recipientErrorMessage?: string
  clearRewardError?: () => void
}

export const FounderRewardsFields: React.FC<FounderRewardsFieldsProps> = ({
  founderRewardRecipient,
  founderRewardBps,
  setFounderRewardRecipient,
  setFounderRewardBps,
  recipientErrorMessage,
  clearRewardError,
}) => {
  return (
    <Flex position={'relative'} direction={'column'} w={'100%'} mb={'x8'}>
      <Heading size="xs">Auction Rewards</Heading>

      <Paragraph color="text3" mb={'x6'}>
        Configure optional founder rewards from auction proceeds. A portion of each
        auction's highest bid will be set aside for the specified address and can be
        withdrawn later.
      </Paragraph>

      <Stack gap="x4">
        <Flex>
          <Flex style={{ flex: '2 1 0' }}>
            <SmartInput
              inputLabel="Reward recipient address"
              id="founderRewardRecipient"
              value={founderRewardRecipient}
              type="text"
              placeholder="0x... or .eth (optional)"
              disabled={false}
              onChange={(e) => {
                setFounderRewardRecipient((e.target as HTMLInputElement).value)
                clearRewardError?.()
              }}
              onBlur={() => clearRewardError?.()}
              autoSubmit={false}
              isAddress={true}
              helperText="Address eligible to withdraw founder rewards from auctions"
              errorMessage={recipientErrorMessage}
            />
          </Flex>

          <Flex style={{ flex: '1 1 0' }}>
            <SmartInput
              inputLabel="Percentage"
              id="founderRewardBps"
              value={founderRewardBps === 0 ? '' : (founderRewardBps / 100).toString()}
              type="number"
              placeholder="0"
              disabled={false}
              onChange={(e) => {
                const value = (e.target as HTMLInputElement).value
                const bps = value === '' ? 0 : Math.round(parseFloat(value) * 100)
                setFounderRewardBps(Math.min(Math.max(bps, 0), 1000)) // Max 10%
                clearRewardError?.()
              }}
              onBlur={() => clearRewardError?.()}
              perma="%"
              min={0}
              max={10}
              step={0.01}
              autoSubmit={false}
              isAddress={false}
              helperText="Percentage of each auction's highest bid (max 10%)"
            />
          </Flex>
        </Flex>
      </Stack>
    </Flex>
  )
}
