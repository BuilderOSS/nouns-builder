import { BASE_URL } from '@buildeross/constants/baseUrl'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { atoms, Box, Icon, Paragraph } from '@buildeross/zord'

export interface UpgradeInProgressProps {
  proposalId: string
}

// NOTE: the link to the proposal is hardcoded here until there's a better way to pass proposal links to transaction forms
export const UpgradeInProgress: React.FC<UpgradeInProgressProps> = ({ proposalId }) => {
  const { token } = useDaoStore((s) => s.addresses)
  const chain = useChainStore((s) => s.chain)

  return (
    <Box mb={'x10'} data-testid="upgrade-in-progress">
      <Paragraph size="md" color="negative">
        It looks like you currently have an{' '}
        <Link
          display={'inline-flex'}
          link={{ href: `${BASE_URL}/dao/${token}/${chain}/vote/${proposalId}` }}
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
