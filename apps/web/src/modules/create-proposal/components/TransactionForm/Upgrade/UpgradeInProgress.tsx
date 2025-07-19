import { Box, Paragraph, atoms } from '@buildeross/zord'
import Link from 'next/link'

import { Icon } from 'src/components/Icon'
import { VersionType } from 'src/modules/create-proposal/constants'
import { useAvailableUpgrade } from 'src/modules/create-proposal/hooks'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

export interface UpgradeInProgressProps {
  contractVersion: VersionType
}

export const UpgradeInProgress: React.FC<UpgradeInProgressProps> = ({
  contractVersion,
}) => {
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const { activeUpgradeProposalId } = useAvailableUpgrade({
    chainId: chain.id,
    addresses,
    contractVersion,
  })

  return (
    <Box mb={'x10'} data-testid="upgrade-in-progress">
      <Paragraph size="md" color="negative">
        It looks like you currently have an{' '}
        <Link
          href={{
            pathname: '/dao/[network]/[token]/vote/[id]',
            query: {
              network: chain.slug,
              token: addresses?.token,
              id: activeUpgradeProposalId,
            },
          }}
        >
          <Box display={'inline-flex'} className={atoms({ textDecoration: 'underline' })}>
            upgrade proposal{' '}
            <Icon align="center" fill="negative" id="external-16" size="sm" />
          </Box>
        </Link>
        in progress. The upgrade needs to be executed in order to access this proposal
        template.
      </Paragraph>
    </Box>
  )
}
