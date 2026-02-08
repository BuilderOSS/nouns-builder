import { getFetchableUrls } from '@buildeross/ipfs-service'
import { useChainStore } from '@buildeross/stores'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Button, Icon, Stack, Text } from '@buildeross/zord'
import { Milestone as MilestoneMetadata } from '@smartinvoicexyz/types'
import { formatUnits, Hex } from 'viem'

interface MilestoneItemProps {
  milestone: MilestoneMetadata
  index: number
  invoiceAddress: Hex | undefined
  currentMilestone: number
  milestoneAmounts: readonly bigint[] | undefined
  tokenMetadata:
    | {
        decimals: number
        symbol: string | undefined
      }
    | undefined
  isClientConnected: boolean
  isClientTreasury: boolean
  hasThreshold: boolean
  isReleasing: boolean
  handleReleaseMilestoneDirect: (index: number) => void
  handleReleaseMilestoneAsProposal: (index: number) => void
}

export const MilestoneItem = ({
  milestone,
  index,
  invoiceAddress,
  currentMilestone,
  milestoneAmounts,
  tokenMetadata,
  isClientConnected,
  isClientTreasury,
  hasThreshold,
  isReleasing,
  handleReleaseMilestoneDirect,
  handleReleaseMilestoneAsProposal,
}: MilestoneItemProps) => {
  const { chain } = useChainStore()

  const isReleased = currentMilestone > index
  const isNext = currentMilestone === index
  const amount = milestoneAmounts?.[index] ?? 0n
  const decimals = tokenMetadata?.decimals ?? 18
  const amountDisplay = tokenMetadata?.symbol
    ? `${formatCryptoVal(formatUnits(amount, decimals))} ${tokenMetadata.symbol}`
    : amount.toString()

  const renderReleaseButton = () => {
    if (isReleased) {
      return (
        <Button variant="secondary" disabled>
          <Icon id="checkInCircle" />
          Milestone Released
        </Button>
      )
    }

    if (isClientConnected || isClientTreasury) {
      return (
        <Stack direction="column" gap="x1">
          <Text variant="label-xs" color="tertiary">
            {isNext
              ? 'Release funds for the next milestone'
              : `Release funds for all milestones up to Milestone ${index + 1}`}
          </Text>
          <ContractButton
            chainId={chain.id}
            variant="primary"
            handleClick={() =>
              isClientConnected
                ? handleReleaseMilestoneDirect(index)
                : handleReleaseMilestoneAsProposal(index)
            }
            disabled={isClientConnected ? isReleasing : !hasThreshold}
            loading={isReleasing}
            fontSize={isClientConnected ? 16 : 12}
          >
            {isClientConnected
              ? `Release Milestone #${index + 1}`
              : `Create Proposal to Release Milestone #${index + 1}`}
          </ContractButton>
          {!hasThreshold && !isClientConnected && (
            <Text variant="label-xs" color="negative">
              You do not have enough votes to create a proposal
            </Text>
          )}
        </Stack>
      )
    }

    return null
  }

  const amountPart = tokenMetadata?.symbol ? `: ${amountDisplay}` : ''

  const title = <Text>{`${index + 1}. ${milestone.title}${amountPart}`}</Text>

  const description = (
    <Stack gap="x5">
      <Stack direction="row" align="center" justify="space-between">
        <Text variant="label-xs" color="tertiary" mr="x2">
          {`Amount: ${amountDisplay}`}
        </Text>
        {milestone?.endDate ? (
          <Text variant="label-xs" color="tertiary">
            {`Due by: ${new Date(Number(milestone.endDate) * 1000).toLocaleDateString()}`}
          </Text>
        ) : null}
      </Stack>

      <Text>{milestone.description || 'No Description'}</Text>

      <Stack>
        {milestone.documents?.map((doc) => {
          if (!doc.src) return null

          const href = doc.type === 'ipfs' ? getFetchableUrls(doc.src)?.[0] : doc.src

          if (!href) return null

          return (
            <a key={doc.src} href={href} target="_blank" rel="noreferrer noopener">
              {doc.src}
            </a>
          )
        })}
      </Stack>

      {!!invoiceAddress && renderReleaseButton()}
    </Stack>
  )

  return <AccordionItem title={title} description={description} />
}
