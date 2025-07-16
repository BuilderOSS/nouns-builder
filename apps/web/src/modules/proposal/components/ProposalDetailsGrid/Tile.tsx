import { Flex, Text, TextProps } from '@buildeross/zord'
import React, { Fragment, ReactNode } from 'react'

import { proposalTileSubtitleVariants } from './Tile.css'

interface ProposalTileProps {
  title: string
  subtitle: string | number
  subtext?: string
  children?: ReactNode | TextProps
  variant?: 'for' | 'against' | 'abstain'
}

export const Tile: React.FC<ProposalTileProps> = (props) => {
  const { title, subtitle, subtext, children, variant } = props

  return (
    <Flex
      p={{ '@initial': 'x4', '@768': 'x6' }}
      direction={{ '@initial': 'row', '@768': 'column' }}
      borderWidth={'normal'}
      borderColor={'border'}
      borderStyle={'solid'}
      borderRadius={'curved'}
      justify={{ '@initial': 'space-between', '@768': 'flex-start' }}
    >
      <Flex w={children ? '100%' : 'auto'} direction={'column'}>
        <Text
          fontSize={16}
          fontWeight={'display'}
          mb={{ '@initial': 'x2', '@768': 'x4' }}
        >
          {title}
        </Text>
        <Text
          className={
            proposalTileSubtitleVariants[
              (variant as keyof typeof proposalTileSubtitleVariants) || 'default'
            ]
          }
        >
          {subtitle}
        </Text>
        {children && <Fragment>{children as ReactNode}</Fragment>}
      </Flex>
      {subtext && (
        <Text color={'tertiary'} pt={'x1'}>
          {subtext}
        </Text>
      )}
    </Flex>
  )
}
