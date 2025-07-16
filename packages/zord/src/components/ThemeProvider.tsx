import { Box, BoxProps } from '../elements'
import { BoxDefaultElement } from '../elements/Box'
import {
  baseTheme as defaultBaseTheme,
  root as defaultRoot,
  lightTheme,
} from '../theme.css'
import clsx, { ClassValue } from 'clsx'
import React, { ElementType, forwardRef } from 'react'
import {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithoutRef,
} from 'react-polymorphic-types'

export interface ThemeProviderProps extends BoxProps {
  theme?: ClassValue
  baseTheme?: ClassValue
  root?: ClassValue
}

export function themeClass(
  {
    theme,
    baseTheme = defaultBaseTheme,
    root = defaultRoot,
  }: { theme: ClassValue; baseTheme?: ClassValue; root?: ClassValue },
  className?: ClassValue,
) {
  return clsx(root, baseTheme, theme, className)
}

function InnerThemeProvider<E extends ElementType = typeof BoxDefaultElement>(
  {
    theme = lightTheme,
    baseTheme = defaultBaseTheme,
    root = defaultRoot,
    className,
    ...props
  }: PolymorphicPropsWithoutRef<ThemeProviderProps, E>,
  ref: React.ForwardedRef<E>,
) {
  return (
    <Box
      {...(props as any)}
      ref={ref}
      className={themeClass({ theme, baseTheme, root }, className)}
    />
  )
}

export const ThemeProvider = forwardRef(
  InnerThemeProvider,
) as PolymorphicForwardRefExoticComponent<ThemeProviderProps, typeof BoxDefaultElement>
