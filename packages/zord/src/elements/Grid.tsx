import { Atoms, atoms } from '../atoms'
import { Box, BoxDefaultElement, BoxProps } from './Box'
import React, { ElementType, ForwardedRef, forwardRef } from 'react'
import type {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithRef,
  PolymorphicPropsWithoutRef,
} from 'react-polymorphic-types'

function gridShorthand(
  template?: GridProps['columns'] | GridProps['rows'],
  auto?: GridProps['autoColumns'] | GridProps['autoRows'],
): [
  React.CSSProperties['gridTemplateColumns'] | React.CSSProperties['gridTemplateRows'],
  Atoms['gridAutoColumns'] | Atoms['gridAutoRows'],
] {
  let gridTemplate
  if (typeof template === 'number') {
    gridTemplate = `repeat(${template}, 1fr)`
  } else if (template === 'auto') {
    gridTemplate = undefined
  } else {
    gridTemplate = template
  }

  const gridAuto = auto === true || template === 'auto' ? 'auto' : auto

  return [gridTemplate, gridAuto]
}

export interface GridProps extends BoxProps {
  gap?: Atoms['gap']
  align?: Atoms['alignItems']
  justify?: Atoms['justifyContent']
  columns?: React.CSSProperties['gridTemplateColumns'] | 'auto'
  rows?: React.CSSProperties['gridTemplateRows'] | 'auto'
  autoRows?: Atoms['gridAutoRows'] | true
  autoColumns?: Atoms['gridAutoColumns'] | true
}

export type GridComponentProps<E extends ElementType> = PolymorphicPropsWithRef<
  GridProps,
  E
>

export function InnerGrid<E extends ElementType>(
  {
    className,
    gap,
    align: alignItems,
    justify: justifyContent,
    columns,
    rows,
    autoRows,
    autoColumns,
    style = {},
    ...props
  }: PolymorphicPropsWithoutRef<GridProps, E>,
  ref?: ForwardedRef<E>,
) {
  const [gridTemplateColumns, gridAutoColumns] = gridShorthand(columns, autoColumns)
  const [gridTemplateRows, gridAutoRows] = gridShorthand(rows, autoRows)

  return (
    <Box
      ref={ref}
      display="grid"
      className={[
        'zord-grid',
        atoms({
          gap,
          alignItems,
          justifyContent,
          gridAutoColumns,
          gridAutoRows,
        }),
        className,
      ]}
      style={{ gridTemplateColumns, gridTemplateRows, ...style }}
      {...(props as any)}
    />
  )
}

export const Grid = forwardRef(InnerGrid) as PolymorphicForwardRefExoticComponent<
  GridProps,
  typeof BoxDefaultElement
>
