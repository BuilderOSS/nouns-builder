import { TransactionType } from '@buildeross/types'

import { AddArtwork } from './AddArtwork'
import { ContentCoin } from './ContentCoin'
import { CreatorCoin } from './CreatorCoin'
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
import { FormComponent, requireResetForm } from './types'
import { WalletConnect } from './WalletConnect'

interface TransactionFormProps {
  transactionType: TransactionFormType
  resetTransactionType: () => void
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
  TransactionType.CREATOR_COIN,
  TransactionType.CONTENT_COIN,
  TransactionType.DROPOSAL,
  TransactionType.PAUSE_AUCTIONS,
  TransactionType.FIX_RENDERER_BASE,
  TransactionType.RESUME_AUCTIONS,
  TransactionType.ADD_ARTWORK,
  TransactionType.REPLACE_ARTWORK,
  TransactionType.MIGRATION,
] as const

const FORMS: Record<TransactionFormType, FormComponent> = {
  [TransactionType.CUSTOM]: requireResetForm(CustomTransaction),
  [TransactionType.MINT_GOVERNANCE_TOKENS]: requireResetForm(MintGovernanceTokens),
  [TransactionType.DROPOSAL]: requireResetForm(Droposal),
  [TransactionType.SEND_NFT]: requireResetForm(SendNft),
  [TransactionType.SEND_TOKENS]: requireResetForm(SendTokens),
  [TransactionType.STREAM_TOKENS]: requireResetForm(StreamTokens),
  [TransactionType.MILESTONE_PAYMENTS]: requireResetForm(MilestonePayments),
  [TransactionType.NOMINATE_DELEGATE]: requireResetForm(NominateEscrowDelegate),
  [TransactionType.WALLET_CONNECT]: requireResetForm(WalletConnect),
  [TransactionType.PIN_TREASURY_ASSET]: requireResetForm(PinTreasuryAsset),
  [TransactionType.PAUSE_AUCTIONS]: requireResetForm(PauseAuctions),
  [TransactionType.FIX_RENDERER_BASE]: requireResetForm(FixRendererBase),
  [TransactionType.RESUME_AUCTIONS]: requireResetForm(ResumeAuctions),
  [TransactionType.ADD_ARTWORK]: requireResetForm(AddArtwork),
  [TransactionType.REPLACE_ARTWORK]: requireResetForm(ReplaceArtwork),
  [TransactionType.MIGRATION]: requireResetForm(Migration),
  [TransactionType.CREATOR_COIN]: requireResetForm(CreatorCoin),
  [TransactionType.CONTENT_COIN]: requireResetForm(ContentCoin),
} as const satisfies Record<TransactionFormType, FormComponent>

export const TransactionForm = ({
  transactionType,
  resetTransactionType,
}: TransactionFormProps) => {
  const Component: FormComponent = FORMS[transactionType]

  return <Component resetTransactionType={resetTransactionType} />
}
