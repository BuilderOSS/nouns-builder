import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Stack } from '@buildeross/zord'
import axios from 'axios'
import { useChainStore, useDaoStore } from 'src/stores'
import useSWR from 'swr'
import { useReadContract } from 'wagmi'

import { BridgeTreasuryForm } from './BridgeTreasuryForm'
import { MigrateDAOForm } from './MigrateDAOForm'
import { MigrationTracker } from './MigrationTracker'
import { PauseAuctionsForm } from './PauseAuctionsForm'

export enum DAOMigrationProgress {
  DEFAULT = 0,
  PAUSED = 1,
  DEPLOYED = 2,
}

interface L2MigratedResponse {
  migrated:
    | {
        l2TokenAddress: AddressType
        chainId: CHAIN_ID
      }
    | undefined
}

export const Migration: React.FC = () => {
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
    <PauseAuctionsForm />,
    <MigrateDAOForm />,
    <BridgeTreasuryForm migratedToChainId={migratedRes?.migrated?.chainId} />,
  ]

  return (
    <Stack>
      <MigrationTracker checkpoint={daoProgress} />
      {formComponents[daoProgress]}
    </Stack>
  )
}
