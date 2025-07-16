import { Flex, FlexProps } from '../elements/Flex'
import * as iconComponents from '../icons'
import { icon, iconVariants } from './Icon.css'
import React, { useMemo } from 'react'

export type IconType = keyof typeof iconComponents

export const icons = Object.keys(iconComponents) as IconType[]
export interface IconProps extends FlexProps {
  id?: IconType
  flip?: boolean
  size?: keyof (typeof iconVariants)['size']
}

export function Icon({ id, size, flip, ...props }: IconProps) {
  const IconComponent = useMemo(() => {
    if (id && id in iconComponents) return iconComponents[id]
    return () => null
  }, [id])

  const iconClass = useMemo(() => {
    return {
      size: size && `zord-icon-${size}`,
      unique: `zord-icon-${id?.toLowerCase()}`,
    }
  }, [id, size])

  return (
    <Flex
      {...props}
      className={['zord-icon', iconClass.size, iconClass.unique, props.className]}
    >
      <IconComponent
        fill="currentColor"
        className={icon({ rotate: id === 'Spinner', size, flip })}
      />
    </Flex>
  )
}
