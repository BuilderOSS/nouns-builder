import { Flex, FlexProps, Icon, IconProps } from '../elements'
import {
  baseButton,
  buttonLoading,
  buttonPill,
  buttonPillLg,
  buttonPillMd,
  buttonPillSm,
  buttonSize,
  buttonVariants,
} from './Button.css'
import { iconVariants } from './Icon.css'
import { ElementType, ForwardedRef, forwardRef, useMemo } from 'react'
import {
  PolymorphicForwardRefExoticComponent,
  PolymorphicPropsWithRef,
  PolymorphicPropsWithoutRef,
} from 'react-polymorphic-types'

export interface ButtonProps extends FlexProps {
  disabled?: boolean
  variant?:
    | 'primary'
    | 'secondary'
    | 'positive'
    | 'destructive'
    | 'outline'
    | 'circle'
    | 'circleSolid'
    | 'ghost'
    | 'unset'
  size?: 'xs' | 'sm' | 'md' | 'lg'
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
  ref: ForwardedRef<E>,
) {
  const Element: ElementType = as || ButtonDefaultElement

  const iconElement = useMemo(() => {
    return icon ? <Icon id={icon} size={iconSize} /> : null
  }, [icon, iconSize])

  return (
    <Flex
      ref={ref}
      as={Element}
      role="button"
      disabled={disabled}
      type={type}
      className={[
        variant && `${ZORD_CLASS}${variant ? `-${variant}` : ''}`,
        size && `${ZORD_CLASS}-${size}`,
        pill && `${ZORD_CLASS}-pill`,
        loading && `${ZORD_CLASS}-loading`,
        disabled && `${ZORD_CLASS}-disabled`,
        buttonSize[size],
        buttonVariants[variant],
        baseButton,
        loading && buttonLoading,
        pill && buttonPill,
        pill && size === 'sm' && buttonPillSm,
        pill && size === 'md' && buttonPillMd,
        pill && size === 'lg' && buttonPillLg,
        className,
      ]}
      px={px}
      gap={gap}
      {...props}
    >
      {loading ? (
        <Icon id="Spinner" size={size === 'lg' ? 'lg' : 'md'} />
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
