import { TransactionType } from '@buildeross/types'
import React, { ReactNode } from 'react'

import { AddArtwork } from './AddArtwork'
import { Airdrop } from './Airdrop'
import { CustomTransaction } from './CustomTransaction'
import { Droposal } from './Droposal'
import { Escrow } from './Escrow'
import { FixRendererBase } from './FixRendererBase'
import { Migration } from './Migration'
import { NominateEscrowDelegate } from './NominateEscrowDelegate'
import { PauseAuctions } from './PauseAuctions'
import { PinTreasuryAsset } from './PinTreasuryAsset'
import { ReplaceArtwork } from './ReplaceArtwork'
import { ResumeAuctions } from './ResumeAuctions'
import { SendErc20 } from './SendErc20'
import { SendEth } from './SendEth'
import { SendNft } from './SendNft'
import { WalletConnect } from './WalletConnect'

interface TransactionFormProps {
  type: TransactionFormType
}

export type TransactionFormType = (typeof TRANSACTION_FORM_OPTIONS)[number]

export const TRANSACTION_FORM_OPTIONS = [
  TransactionType.SEND_ETH,
  TransactionType.SEND_ERC20,
  TransactionType.SEND_NFT,
  TransactionType.WALLET_CONNECT,
  TransactionType.AIRDROP,
  TransactionType.ESCROW,
  TransactionType.ESCROW_DELEGATE,
  TransactionType.PIN_TREASURY_ASSET,
  TransactionType.PAUSE_AUCTIONS,
  TransactionType.FIX_RENDERER_BASE,
  TransactionType.RESUME_AUCTIONS,
  TransactionType.ADD_ARTWORK,
  TransactionType.REPLACE_ARTWORK,
  TransactionType.DROPOSAL,
  TransactionType.MIGRATION,
  TransactionType.CUSTOM,
] as const

export const TransactionForm = ({ type }: TransactionFormProps) => {
  const FORMS: { [key in TransactionFormType]: ReactNode } = {
    [TransactionType.CUSTOM]: <CustomTransaction />,
    [TransactionType.AIRDROP]: <Airdrop />,
    [TransactionType.ESCROW]: <Escrow />,
    [TransactionType.ESCROW_DELEGATE]: <NominateEscrowDelegate />,
    [TransactionType.DROPOSAL]: <Droposal />,
    [TransactionType.SEND_ETH]: <SendEth />,
    [TransactionType.SEND_ERC20]: <SendErc20 />,
    [TransactionType.SEND_NFT]: <SendNft />,
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
