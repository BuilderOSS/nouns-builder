import { Atoms, Flex, FlexProps, theme } from '@buildeross/zord'
import React from 'react'

import { icon } from './Icon.css'
import { icons, IconType } from './icons'

type IconProps = FlexProps & {
  id: IconType
  fill?: Atoms['color']
  size?: 'sm' | 'md' | 'lg'
}

export const Icon = ({ id, fill, size = 'md', ...props }: IconProps) => {
  const IconSVG = icons[id]

  return (
    <Flex {...props}>
      <IconSVG fill={theme.colors[fill!]} className={icon({ size })} />
    </Flex>
  )
}
