import { TransactionType } from '@buildeross/types'
import { ReactNode } from 'react'

import { AddArtwork } from './AddArtwork'
import { CustomTransaction } from './CustomTransaction'
import { Droposal } from './Droposal'
import { FixRendererBase } from './FixRendererBase'
import { Migration } from './Migration'
import { MilestonePayments } from './MilestonePayments'
import { MintGovernanceTokens } from './MintGovernanceTokens'
import { NominateEscrowDelegate } from './NominateEscrowDelegate'
import { PauseAuctions } from './PauseAuctions'
import { PinTreasuryAsset } from './PinTreasuryAsset'
import { ReplaceArtwork } from './ReplaceArtwork'
import { ResumeAuctions } from './ResumeAuctions'
import { SendNft } from './SendNft'
import { SendTokens } from './SendTokens'
import { StreamTokens } from './StreamTokens'
import { WalletConnect } from './WalletConnect'

interface TransactionFormProps {
  type: TransactionFormType
}

export type TransactionFormType = (typeof TRANSACTION_FORM_OPTIONS)[number]

export const TRANSACTION_FORM_OPTIONS = [
  TransactionType.SEND_TOKENS,
  TransactionType.SEND_NFT,
  TransactionType.STREAM_TOKENS,
  TransactionType.MILESTONE_PAYMENTS,
  TransactionType.MINT_GOVERNANCE_TOKENS,
  TransactionType.WALLET_CONNECT,
  TransactionType.NOMINATE_DELEGATE,
  TransactionType.PIN_TREASURY_ASSET,
  TransactionType.CUSTOM,
  TransactionType.DROPOSAL,
  TransactionType.PAUSE_AUCTIONS,
  TransactionType.FIX_RENDERER_BASE,
  TransactionType.RESUME_AUCTIONS,
  TransactionType.ADD_ARTWORK,
  TransactionType.REPLACE_ARTWORK,
  TransactionType.MIGRATION,
] as const

export const TransactionForm = ({ type }: TransactionFormProps) => {
  const FORMS: { [key in TransactionFormType]: ReactNode } = {
    [TransactionType.CUSTOM]: <CustomTransaction />,
    [TransactionType.MINT_GOVERNANCE_TOKENS]: <MintGovernanceTokens />,
    [TransactionType.DROPOSAL]: <Droposal />,
    [TransactionType.SEND_NFT]: <SendNft />,
    [TransactionType.SEND_TOKENS]: <SendTokens />,
    [TransactionType.STREAM_TOKENS]: <StreamTokens />,
    [TransactionType.MILESTONE_PAYMENTS]: <MilestonePayments />,
    [TransactionType.NOMINATE_DELEGATE]: <NominateEscrowDelegate />,
    [TransactionType.WALLET_CONNECT]: <WalletConnect />,
    [TransactionType.PIN_TREASURY_ASSET]: <PinTreasuryAsset />,
    [TransactionType.PAUSE_AUCTIONS]: <PauseAuctions />,
    [TransactionType.FIX_RENDERER_BASE]: <FixRendererBase />,
    [TransactionType.RESUME_AUCTIONS]: <ResumeAuctions />,
    [TransactionType.ADD_ARTWORK]: <AddArtwork />,
    [TransactionType.REPLACE_ARTWORK]: <ReplaceArtwork />,
    [TransactionType.MIGRATION]: <Migration />,
  }

  return <>{FORMS[type]}</>
}
