import { ElementType, ForwardedRef, forwardRef, useMemo } from 'react'
import {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithoutRef,
  PolymorphicPropsWithRef,
} from 'react-polymorphic-types'

import { Flex, FlexProps, Icon, IconProps, Spinner } from '../elements'
import {
  baseButton,
  buttonLoading,
  buttonPill,
  buttonPillSize,
  buttonSize,
  buttonVariants,
  responsiveButtonPillSize,
  responsiveButtonSize,
} from './Button.css'
import { iconVariants } from './Icon.css'

type ResponsiveProp<T> = T | { [key: string]: T }

// Helper to map responsive size to pre-generated style
function getResponsiveSizeKey(size: { [key: string]: string }): string | null {
  const initial = size['@initial']
  const at768 = size['@768']

  if (initial && at768) {
    return `${initial}-${at768}`
  }
  return null
}

export interface ButtonProps extends FlexProps {
  disabled?: boolean
  variant?:
    | 'primary'
    | 'secondary'
    | 'secondaryAccent'
    | 'positive'
    | 'destructive'
    | 'outline'
    | 'circle'
    | 'circleSolid'
    | 'ghost'
    | 'unset'
  size?: ResponsiveProp<'xs' | 'sm' | 'md' | 'lg'>
  icon?: IconProps['id']
  iconAlign?: 'left' | 'right'
  type?: 'submit' | 'reset' | 'button'
  iconSize?: keyof (typeof iconVariants)['size']
  loading?: boolean
  pill?: boolean
}

export const ButtonDefaultElement = 'button'

export type ButtonComponentProps<E extends ElementType = typeof ButtonDefaultElement> =
  PolymorphicPropsWithRef<ButtonProps, E>

const ZORD_CLASS = 'zord-button'

export function InnerButton<E extends ElementType = typeof ButtonDefaultElement>(
  {
    as,
    disabled = false,
    className,
    children,
    icon,
    gap = 'x4',
    px = 'x6',
    iconSize = 'md',
    iconAlign = 'left',
    loading,
    pill,
    variant = 'primary',
    size = 'md',
    type = 'button',
    ...props
  }: PolymorphicPropsWithoutRef<ButtonProps, E>,
  ref: ForwardedRef<E>
) {
  const Element: ElementType = as || ButtonDefaultElement

  const iconElement = useMemo(() => {
    return icon ? <Icon id={icon} size={iconSize} /> : null
  }, [icon, iconSize])

  // Apply button size styles
  const buttonSizeStyle = useMemo(() => {
    if (typeof size === 'string') {
      return buttonSize[size]
    }
    // For responsive sizes, use pre-generated responsive styles
    const key = getResponsiveSizeKey(size)
    return key && responsiveButtonSize[key as keyof typeof responsiveButtonSize]
      ? responsiveButtonSize[key as keyof typeof responsiveButtonSize]
      : buttonSize.md
  }, [size])

  // Get the effective size for class names (use @initial value if responsive, otherwise use string value)
  const effectiveSize = typeof size === 'string' ? size : size['@initial'] || 'md'

  const pillSizeStyle = useMemo(() => {
    if (!pill) return undefined
    if (typeof size === 'string') {
      return buttonPillSize[size]
    }
    // For responsive sizes, use pre-generated responsive pill styles
    const key = getResponsiveSizeKey(size)
    return key && responsiveButtonPillSize[key as keyof typeof responsiveButtonPillSize]
      ? responsiveButtonPillSize[key as keyof typeof responsiveButtonPillSize]
      : undefined
  }, [pill, size])

  return (
    <Flex
      ref={ref}
      as={Element}
      role="button"
      disabled={disabled}
      type={type}
      className={[
        variant && `${ZORD_CLASS}${variant ? `-${variant}` : ''}`,
        effectiveSize && `${ZORD_CLASS}-${effectiveSize}`,
        pill && `${ZORD_CLASS}-pill`,
        loading && `${ZORD_CLASS}-loading`,
        disabled && `${ZORD_CLASS}-disabled`,
        buttonSizeStyle,
        buttonVariants[variant],
        baseButton,
        loading && buttonLoading,
        pill && buttonPill,
        pillSizeStyle,
        className,
      ]}
      px={px}
      gap={gap}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {iconAlign === 'left' && iconElement}

          {children}

          {iconAlign === 'right' && iconElement}
        </>
      )}
    </Flex>
  )
}

export const Button = forwardRef(InnerButton) as PolymorphicForwardRefExoticComponent<
  ButtonProps,
  typeof ButtonDefaultElement
>
