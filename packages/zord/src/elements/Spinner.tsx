import React from 'react'

import { Icon, IconProps } from '../elements/Icon'

export interface SpinnerProps extends IconProps {}

export function Spinner({ ...props }: SpinnerProps) {
  return <Icon id="Spinner" {...props} />
}
