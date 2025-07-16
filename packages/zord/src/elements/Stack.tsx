import { Flex, FlexProps } from '../elements/Flex'
import { BoxDefaultElement } from './Box'
import React, { ElementType, forwardRef } from 'react'
import type {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithRef,
} from 'react-polymorphic-types'

export interface StackProps extends FlexProps {}

export type StackComponentProps<E extends ElementType> = PolymorphicPropsWithRef<
  StackProps,
  E
>

export function InnerStack<E extends ElementType = typeof BoxDefaultElement>(
  props: StackComponentProps<E>,
  ref?: React.ForwardedRef<E>,
) {
  return (
    <Flex
      ref={ref}
      direction="column"
      className={['zord-stack', props.className]}
      {...props}
    />
  )
}

export const Stack = forwardRef(InnerStack) as PolymorphicForwardRefExoticComponent<
  StackProps,
  typeof BoxDefaultElement
>
