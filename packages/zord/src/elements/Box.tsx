import { Atoms, atoms } from '../atoms'
import { MixinsProp, mixins } from '../mixins'
import * as styles from './Box.css'
import clsx, { ClassValue } from 'clsx'
import type { CSSProperties, ElementType, ReactNode } from 'react'
import React, { forwardRef } from 'react'
import type {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithRef,
  PolymorphicPropsWithoutRef,
} from 'react-polymorphic-types'

export interface BoxProps {
  className?: ClassValue
  children?: ReactNode
  style?: CSSProperties
  aspectRatio?: React.CSSProperties['aspectRatio'] | number
  center?: MixinsProp['center']
  display?: Atoms['display']
  flex?: Atoms['flex']
  flexShrink?: Atoms['flexShrink']
  alignSelf?: Atoms['alignSelf']
  justifySelf?: Atoms['justifySelf']
  color?: Atoms['color']
  cursor?: Atoms['cursor']
  borderColor?: Atoms['borderColor']
  borderStyle?: Atoms['borderStyle']
  borderWidth?: Atoms['borderWidth']
  backgroundColor?: Atoms['backgroundColor']
  borderRadius?: Atoms['borderRadius']
  fontFamily?: Atoms['fontFamily']
  fontSize?: Atoms['fontSize']
  fontWeight?: Atoms['fontWeight']
  lineHeight?: Atoms['lineHeight']
  objectFit?: Atoms['objectFit']
  position?: Atoms['position']
  pos?: Atoms['pos']
  p?: Atoms['p']
  px?: Atoms['px']
  py?: Atoms['py']
  pt?: Atoms['pt']
  pr?: Atoms['pr']
  pb?: Atoms['pb']
  pl?: Atoms['pl']
  m?: Atoms['m']
  mx?: Atoms['mx']
  my?: Atoms['my']
  mt?: Atoms['mt']
  mr?: Atoms['mr']
  mb?: Atoms['mb']
  ml?: Atoms['ml']
  top?: Atoms['top']
  right?: Atoms['right']
  bottom?: Atoms['bottom']
  left?: Atoms['left']
  w?: Atoms['width']
  h?: Atoms['height']
  width?: Atoms['width']
  height?: Atoms['height']
  textAlign?: Atoms['textAlign']
  minW?: Atoms['minW']
  minH?: Atoms['minH']
  maxW?: Atoms['maxW']
  maxH?: Atoms['maxH']
  listStyle?: Atoms['listStyle']
  inset?: Atoms['inset']
  overflow?: Atoms['overflow']
  overflowX?: Atoms['overflowX']
  overflowY?: Atoms['overflowY']
  pointerEvents?: Atoms['pointerEvents']
  wordBreak?: Atoms['wordBreak']
  id?: string
}

export const BoxDefaultElement = 'div'

export type BoxComponentProps<E extends ElementType = typeof BoxDefaultElement> =
  PolymorphicPropsWithRef<BoxProps, E>

export function InnerBox<E extends ElementType = typeof BoxDefaultElement>(
  {
    as,
    className,
    style,
    aspectRatio,
    center,
    display,
    flex,
    flexShrink,
    alignSelf,
    justifySelf,
    color,
    cursor,
    borderColor,
    borderRadius,
    borderStyle,
    borderWidth,
    backgroundColor,
    fontFamily,
    listStyle,
    fontSize,
    fontWeight,
    objectFit,
    position,
    pos,
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    top,
    right,
    bottom,
    left,
    w,
    h,
    width,
    height,
    textAlign,
    minW,
    minH,
    maxW,
    maxH,
    inset,
    overflow,
    overflowX,
    overflowY,
    pointerEvents,
    wordBreak,
    ...props
  }: PolymorphicPropsWithoutRef<BoxProps, E>,
  ref: React.ForwardedRef<E>,
) {
  const Element: ElementType = as || BoxDefaultElement

  return (
    <Element
      ref={ref}
      style={{
        aspectRatio: typeof aspectRatio === 'number' ? `${aspectRatio}` : aspectRatio,
        ...style,
      }}
      className={clsx(
        `zord-box`,
        styles.box,
        mixins({ center }),
        atoms({
          display,
          flex,
          flexShrink,
          alignSelf,
          justifySelf,
          color,
          cursor,
          borderColor,
          borderRadius,
          borderStyle,
          borderWidth,
          backgroundColor,
          fontFamily,
          fontSize,
          fontWeight,
          objectFit,
          position,
          pos,
          p,
          px,
          py,
          pt,
          pr,
          pb,
          pl,
          m,
          mx,
          my,
          mt,
          mr,
          mb,
          ml,
          top,
          right,
          bottom,
          left,
          w,
          h,
          width,
          height,
          textAlign,
          minW,
          minH,
          maxW,
          maxH,
          inset,
          overflow,
          overflowX,
          overflowY,
          pointerEvents,
          listStyle,
          wordBreak,
        }),
        className,
      )}
      {...props}
    />
  )
}

export const Box = forwardRef(InnerBox) as PolymorphicForwardRefExoticComponent<
  BoxProps,
  typeof BoxDefaultElement
>
