import { Box, Flex, Heading } from '@buildeross/zord'
import React from 'react'

import { adminSection } from '../../styles/Section.css'

export const MerkleReserveMinterForm: React.FC = () => {
  return (
    <Flex direction="column" p="x6" className={adminSection}>
      <Heading size="md" mb="x4">
        Merkle Reserve Minter
      </Heading>
      <Box color="text3">
        This form will allow you to configure the Merkle Reserve Minter settings for your
        DAO. Configure mint start/end times, price per token, and merkle root for
        allowlist-based minting.
      </Box>
      <Box mt="x4" color="text4" fontSize="14">
        Coming soon...
      </Box>
    </Flex>
  )
}
