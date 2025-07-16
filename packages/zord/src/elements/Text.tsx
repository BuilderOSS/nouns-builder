import { Atoms, atoms } from '../atoms'
import { Box, BoxDefaultElement, BoxProps } from './Box'
import { text, textVariants } from './Text.css'
import { ElementType, ForwardedRef, forwardRef } from 'react'
import type {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithRef,
  PolymorphicPropsWithoutRef,
} from 'react-polymorphic-types'

export { textVariants }

export interface TextProps extends BoxProps {
  align?: Atoms['textAlign']
  inline?: boolean
  italic?: boolean
  textTransform?: Atoms['textTransform']
  variant?: keyof (typeof textVariants)['variant']
}

export type TextComponentProps<E extends ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<TextProps, E>

export const InnerText = <E extends ElementType = typeof BoxDefaultElement>(
  {
    align,
    className,
    inline,
    italic,
    textTransform,
    variant,
    as,
    ...props
  }: PolymorphicPropsWithoutRef<TextProps, E>,
  ref: ForwardedRef<any>, // or HTMLSpanElement if you want to narrow
) => {
  return (
    <Box
      ref={ref}
      as={as || 'div'}
      display={inline ? 'inline-block' : undefined}
      align={align}
      className={[
        'zord-text',
        variant && `zord-text-${variant}`,
        text({ variant, italic }),
        atoms({ textTransform }),
        className,
      ]}
      {...(props as any)} // casting to bypass spread type conflict
    />
  )
}

export const Text = forwardRef(InnerText) as PolymorphicForwardRefExoticComponent<
  TextProps,
  typeof BoxDefaultElement
>

export interface ParagraphProps extends Omit<TextProps, 'variant'> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export type ParagraphComponentProps<E extends ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<ParagraphProps, E>

export function Paragraph<E extends ElementType = typeof BoxDefaultElement>({
  size = 'md',
  ...props
}: ParagraphComponentProps<E>) {
  return (
    <Text
      {...(props as any)} // casting to bypass spread type conflict
      variant={`paragraph-${size}`}
    />
  )
}

export interface HeadingProps extends Omit<TextProps, 'variant'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export type HeadingComponentProps<E extends ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<HeadingProps, E>

export function Heading<E extends ElementType = typeof BoxDefaultElement>({
  size = 'md',
  ...props
}: HeadingComponentProps<E>) {
  return (
    <Text
      {...(props as any)} // casting to bypass spread type conflict
      variant={`heading-${size}`}
    />
  )
}

export interface DisplayProps extends Omit<TextProps, 'variant'> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export type DisplayComponentProps<E extends ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<DisplayProps, E>

export function Display<E extends ElementType = typeof BoxDefaultElement>({
  size = 'md',
  ...props
}: DisplayComponentProps<E>) {
  return (
    <Text
      {...(props as any)} // casting to bypass spread type conflict
      variant={`display-${size}`}
    />
  )
}

export interface EyebrowProps extends Omit<TextProps, 'variant'> {}

export type EyebrowComponentProps<E extends ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<EyebrowProps, E>

export function Eyebrow<E extends ElementType = typeof BoxDefaultElement>({
  ...props
}: EyebrowComponentProps<E>) {
  return (
    <Text
      {...(props as any)} // casting to bypass spread type conflict
      variant="eyebrow"
    />
  )
}

export interface LabelProps extends Omit<TextProps, 'variant'> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export type LabelComponentProps<E extends ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<LabelProps, E>

export function Label<E extends ElementType = typeof BoxDefaultElement>({
  size = 'md',
  ...props
}: LabelComponentProps<E>) {
  return (
    <Text
      variant={`label-${size}`}
      {...(props as any)} // casting to bypass spread type conflict
    />
  )
}

export interface MenuProps extends TextProps {}

export type MenuTextComponentProps<E extends ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<MenuProps, E>

export function MenuText<E extends ElementType = typeof BoxDefaultElement>({
  ...props
}: MenuTextComponentProps<E>) {
  return <Text variant="menu-lg" {...props} />
}
