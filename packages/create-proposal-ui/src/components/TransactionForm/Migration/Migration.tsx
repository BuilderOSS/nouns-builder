import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType, L2MigratedResponse } from '@buildeross/types'
import { Stack } from '@buildeross/zord'
import axios from 'axios'
import useSWR from 'swr'
import { useReadContract } from 'wagmi'

import { type FormComponent } from '../types'
import { BridgeTreasuryForm } from './BridgeTreasuryForm'
import { MigrateDAOForm } from './MigrateDAOForm'
import { MigrationTracker } from './MigrationTracker'
import { PauseAuctionsForm } from './PauseAuctionsForm'

export enum DAOMigrationProgress {
  DEFAULT = 0,
  PAUSED = 1,
  DEPLOYED = 2,
}

export const Migration: FormComponent = ({ resetTransactionType }) => {
  const chain = useChainStore((x) => x.chain)
  const {
    addresses: { treasury, auction },
  } = useDaoStore()

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: auction as AddressType,
    functionName: 'paused',
    chainId: chain.id,
  })

  const { data: migratedRes } = useSWR(
    treasury ? ([SWR_KEYS.DAO_MIGRATED, treasury] as const) : null,
    ([, _treasury]) =>
      axios
        .get<L2MigratedResponse>(`${BASE_URL}/api/migrated?l1Treasury=${_treasury}`)
        .then((x) => x.data)
  )

  const deployed = !!migratedRes?.migrated

  let daoProgress = DAOMigrationProgress.DEPLOYED
  if (!paused) daoProgress = DAOMigrationProgress.DEFAULT
  else if (!deployed) daoProgress = DAOMigrationProgress.PAUSED

  const formComponents = [
    <PauseAuctionsForm
      key="pause-auctions-form"
      resetTransactionType={resetTransactionType}
    />,
    <MigrateDAOForm key="migrate-dao-form" resetTransactionType={resetTransactionType} />,
    <BridgeTreasuryForm
      migratedToChainId={migratedRes?.migrated?.chainId}
      key="bridge-treasury-form"
      resetTransactionType={resetTransactionType}
    />,
  ]

  return (
    <Stack>
      <MigrationTracker checkpoint={daoProgress} />
      {formComponents[daoProgress]}
    </Stack>
  )
}
