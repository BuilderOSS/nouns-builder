import { Icon, IconProps } from '../elements/Icon'
import React from 'react'

export interface SpinnerProps extends IconProps {}

export function Spinner({ ...props }: SpinnerProps) {
  return <Icon id="Spinner" {...props} />
}
