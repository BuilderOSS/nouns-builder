import { Box, BoxProps } from './Box'
import { input, inputVariants } from './Input.css'
import React, { ElementType, forwardRef } from 'react'
import type {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithRef,
} from 'react-polymorphic-types'

export interface InputProps extends BoxProps {
  size?: keyof (typeof inputVariants)['sizeVariant']
}

export type InputComponentProps<E extends ElementType> = PolymorphicPropsWithRef<
  InputProps,
  E
>

const InnerInput = <E extends ElementType = 'input'>(
  { className, size, as, ...props }: InputComponentProps<E>,
  ref: React.ForwardedRef<HTMLInputElement>,
) => {
  return (
    <Box
      ref={ref}
      as={as || 'input'}
      className={['zord-input', input({ sizeVariant: size }), className]}
      {...(props as any)} // 👈 Cast here to bypass TS prop incompatibility
    />
  )
}

export const Input = forwardRef(InnerInput) as PolymorphicForwardRefExoticComponent<
  InputProps,
  'input'
>
