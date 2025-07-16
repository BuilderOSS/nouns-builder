import { Atoms, atoms } from '../atoms'
import { Box, BoxDefaultElement, BoxProps } from './Box'
import { flexChildren } from './Flex.css'
import clsx from 'clsx'
import React, { forwardRef } from 'react'
import type {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithRef,
  PolymorphicPropsWithoutRef,
} from 'react-polymorphic-types'

export interface FlexProps extends BoxProps {
  alignSelf?: Atoms['alignSelf']
  gap?: Atoms['gap']
  wrap?: Atoms['flexWrap'] | boolean
  direction?: Atoms['flexDirection']
  align?: Atoms['alignItems']
  justify?: Atoms['justifyContent']
  placeItems?: Atoms['placeItems']
  flexChildren?: boolean
}

export type FlexComponentProps<E extends React.ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<FlexProps, E>

function InnerFlex<E extends React.ElementType = typeof BoxDefaultElement>(
  {
    alignSelf,
    className,
    gap,
    wrap,
    direction: flexDirection,
    align: alignItems,
    justify: justifyContent,
    placeItems,
    flexChildren: flexChildrenProp,
    ...props
  }: PolymorphicPropsWithoutRef<FlexProps, E>,
  ref?: React.ForwardedRef<E>,
) {
  const flexWrap = wrap === true ? 'wrap' : wrap === false ? 'nowrap' : wrap
  return (
    <Box
      ref={ref}
      display="flex"
      className={clsx(
        atoms({
          alignSelf,
          gap,
          flexDirection,
          flexWrap,
          alignItems,
          justifyContent,
          placeItems,
        }),
        flexChildrenProp && flexChildren,
        className,
      )}
      {...(props as any)}
    />
  )
}

export const Flex = forwardRef(InnerFlex) as PolymorphicForwardRefExoticComponent<
  FlexProps,
  typeof BoxDefaultElement
>
