import clsx from 'clsx'
import { filter, get, mapValues, values } from 'lodash-es'

import * as styles from './mixins.css'

export type Mixins = typeof styles

export type MixinsProp<M = Mixins> = {
  [P in keyof M]: Partial<keyof M[P]> | undefined | true
}

export function mixins(mixinsProp: Partial<MixinsProp>) {
  return clsx(
    filter(
      values(
        mapValues(
          mixinsProp,
          (value, key) =>
            value && (value === true ? get(styles, [key]) : get(styles, [key, value]))
        )
      )
    )
  )
}
