import { Flex } from '@buildeross/zord'
import React from 'react'

// TODO: Implement ZoraDropActions component with appropriate buttons
// - Add "View Drop" button linking to the drop page
// - Add "Mint" button to open mint modal/flow
// - Add ShareButton for sharing the drop
// - Consider presale/public sale states for conditional rendering

interface ZoraDropActionsProps {
  dropId: string
}

export const ZoraDropActions: React.FC<ZoraDropActionsProps> = () => {
  return <Flex gap="x2" align="center" wrap="wrap"></Flex>
}
