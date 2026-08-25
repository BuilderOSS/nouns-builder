import { Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'

import * as styles from './TransactionDiff.css'

type DiffBadgeProps = {
  type: 'added' | 'removed' | 'changed'
}

export const DiffBadge: React.FC<DiffBadgeProps> = ({ type }) => {
  const config = {
    added: {
      icon: 'plus' as const,
      text: 'Added',
      className: styles.diffBadgeAdded,
    },
    removed: {
      icon: 'minus' as const,
      text: 'Removed',
      className: styles.diffBadgeRemoved,
    },
    changed: {
      icon: 'swap' as const,
      text: 'Changed',
      className: styles.diffBadgeChanged,
    },
  }[type]

  return (
    <Flex align="center" gap="x1" className={`${styles.diffBadge} ${config.className}`}>
      <Icon id={config.icon} size="sm" />
      <Text>{config.text}</Text>
    </Flex>
  )
}
