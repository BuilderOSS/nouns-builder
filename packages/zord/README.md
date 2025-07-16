# Zord Documentation

## Getting Started

Adding to your project boils down to:

1. Add Zord stylesheet from `@buildeross/zord/index.css`
2. Set up webfonts
3. Add Zord ThemeProvider and theme

### Usage with Next.js

```tsx
// pages/_app.tsx
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import { ThemeProvider, lightTheme } from '@buildeross/zord'
import '@buildeross/zord/index.css'
import type { AppProps } from 'next/app'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={lightTheme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
```

## Themes

Theming with Zord is done by defining an object known as a "_Theme Contract_", a common interface of consistent design tokens defined in a central theme file and then used throughout a site's components.

```ts
export const theme = createThemeContract({
  fonts: {
    heading: '',
    body: '',
    mono: '',
  },
  fontSizing: {
    fontSize: {
      0: '',
      12: '',
      14: '',
      16: '',
      18: '',
      20: '',
      28: '',
      30: '',
      35: '',
      40: '',
      48: '',
      50: '',
      65: '',
      80: '',
      unset: '',
    },
    lineHeight: {
      0: '',
      14: '',
      20: '',
      24: '',
      25: '',
      30: '',
      34: '',
      40: '',
      50: '',
      55: '',
      65: '',
      70: '',
      85: '',
      95: '',
      unset: '',
    },
    fontWeight: {
      display: '',
      heading: '',
      label: '',
      paragraph: '',
    },
  },
  radii: {
    tiny: '',
    small: '',
    normal: '',
    curved: '',
    phat: '',
    round: '',
  },
  size: {
    x0: '',
    x1: '',
    x2: '',
    x3: '',
    x4: '',
    x5: '',
    x6: '',
    x7: '',
    x8: '',
    x9: '',
    x10: '',
    x11: '',
    x12: '',
    x13: '',
    x14: '',
    x15: '',
    x16: '',
    x17: '',
    x18: '',
    x19: '',
    x20: '',
    x21: '',
    x22: '',
    x23: '',
    x24: '',
    x25: '',
    x26: '',
    x27: '',
    x28: '',
    x29: '',
    x30: '',
    x32: '',
    x64: '',
    auto: '',
    '100vw': '',
    '100vh': '',
    '100%': '',
    unset: '',
  },
  space: {
    x0: '',
    x1: '',
    x2: '',
    x3: '',
    x4: '',
    x5: '',
    x6: '',
    x7: '',
    x8: '',
    x9: '',
    x10: '',
    x11: '',
    x12: '',
    x13: '',
    x14: '',
    x15: '',
    x16: '',
    x17: '',
    x18: '',
    x19: '',
    x20: '',
    x21: '',
    x22: '',
    x23: '',
    x24: '',
    x25: '',
    x26: '',
    x27: '',
    x28: '',
    x29: '',
    x30: '',
    x32: '',
    x64: '',
    auto: '',
  },
  ease: {
    in: '',
    out: '',
    inOut: '',
  },
  border: {
    width: {
      none: '',
      thin: '',
      normal: '',
      thick: '',
    },
    style: {
      solid: '',
      dashed: '',
      dotted: '',
    },
  },
  colors: {
    backdrop: '',
    border: '',
    borderOnImage: '',
    background1: '',
    background2: '',
    text1: '',
    text2: '',
    text3: '',
    text4: '',
    icon1: '',
    icon2: '',
    primary: '',
    secondary: '',
    tertiary: '',
    quaternary: '',
    transparent: '',
    accent: '',
    accentHover: '',
    accentActive: '',
    accentDisabled: '',
    onAccent: '',
    onAccentDisabled: '',
    positive: '',
    positiveHover: '',
    positiveActive: '',
    positiveDisabled: '',
    onPositive: '',
    onPositiveDisabled: '',
    warning: '',
    warningHover: '',
    warningActive: '',
    warningDisabled: '',
    onWarning: '',
    onWarningDisabled: '',
    negative: '',
    negativeHover: '',
    negativeActive: '',
    negativeDisabled: '',
    onNegative: '',
    onNegativeDisabled: '',
    ghost: '',
    ghostHover: '',
    ghostActive: '',
    ghostDisabled: '',
    onGhost: '',
    onGhostDisabled: '',
    neutral: '',
    neutralHover: '',
    neutralActive: '',
    neutralDisabled: '',
    onNeutral: '',
    onNeutralDisabled: '',
  },
  shadows: {
    small: '',
    medium: '',
  },
})
```

Multiple implementations of a ThemeContract can exist on a single site, and the themes can be swapped in + out to enable, for example, dark and light theme variations, or themes designed to assist users who are visually impaired.

Each theme maps 1-1 with the ThemeContract:

```ts
import { border, colorTheme, ease, radii, size, space, typography } from './tokens'

export const lightTheme = createTheme(theme, {
  fonts: {
    heading: typography.fonts.body,
    body: typography.fonts.body,
    mono: typography.fonts.mono,
  },
  fontSizing: {
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
    fontWeight: typography.fontWeight,
  },
  colors,
  shadows,
  radii,
  size,
  space,
  ease,
  border,
})
```

Themes are most commonly used to define theme colors, but can also be used to specify typefaces, spacing conventions, borders, animation standards, and more.

Zora's standard theme defines colors, typography, borders + radii, shadows, container sizing, animation easing, and spacing increments:

```ts
export const [baseTheme, vars] = createTheme({
  color: theme.colors,
  fonts: theme.fonts,
  fontSize: theme.fontSizing.fontSize,
  lineHeight: theme.fontSizing.lineHeight,
  fontWeight: theme.fontSizing.fontWeight,
  radii: theme.radii,
  shadows: theme.shadows,
  size: theme.size,
  space: theme.space,
  ease: theme.ease,
  border: theme.border,
})
```

TODO: How can we easily let people customize themes?

- colors
- spacing
- breakpoints

## Styling with Zord

Zord uses a heavily-adapted styling implementation based on the Vanilla Extract styling framework. At Zora, we've found that this system allows us to develop front-end code rapidly using design primitives that can be customized using a large set of pre-defined CSS properties that adhere to Zora's theme specifications. At its core, Zord makes extensive use of Vanilla Extract's [Sprinkles](https://vanilla-extract.style/documentation/packages/sprinkles/) package to statically generate CSS classes that can be re-used without continually adding to an app's CSS footprint. The Zord implementation renames Sprinkles as Atoms.

## Basic styles

```
// Container.css.ts
import { atoms } from '../atoms'
import { style } from '@vanilla-extract/css'

export const container = style({
  width: '100%',
  height: '200px',
  backgroundColor: '#DEDEDE'
})
```

The most familiar way of styling a component is using the style() function in an external CSS file. `style` writes to a .css file on build, and `container` is exported as a className that can be applied elements in markup: `<div className={styles.container}>`

## Atoms

At the heart of Zord are a broad set of atoms, a selection of the most commonly-used CSS properties. Atoms enable a developer to take advantage of the filesize efficiencies gained by pre-defined classes while applying styles to components in a number of ways:

- in a separate stylesheet
- as props
- directly into a className attribute using the atoms() function (handy for applying styles to non-Zord components!)

**_Separate Stylesheets:_**

```
// Box.css.ts
import { atoms } from '../atoms'
import { style } from '@vanilla-extract/css'

export const box = atoms({
  width: '100%',
  height: 'x10'
})
```

```
// Box.tsx
import * as styles from 'Box.css.ts'
<Box className={styles.box} />
```

You can also add atomic styles to style declarations alongside styles that aren't included in the atomic presets:

```
// Box.css.ts
export const box = style([
  {
    boxSizing: 'border-box',
    backgroundImage: url("zora-is-nice.gif")
  },
  atoms({
   width: '100%',
   height: 'x10'
  }),
])
```

So in the above example, the styles defined within `atoms()` will apply the pre-generated static styles, and not add to the size of the stylesheet.

**_Atoms as props:_**

```
// Box.tsx
<Box
  width='100%'
  height='x10'
/>
```

**_In className attributes (handy for adding atomic styles to non-Zord-based components):_**

```
// GenericContainer.tsx
<div className={atoms({
  width: '100%',
  height: 'x10'
})} />
```

## Spacing

You'll notice that the Box component above specifies height as `height='x10'`.

Zora implements a spacing system based on 4px increments:

```
export const space = {
  n2: '-8px',
  n1: '-4px',
  x0: '0px',
  x1: '4px',
  x2: '8px',
  x3: '12px',
  x4: '16px',
  x5: '20px'
  ... (+ many more)
}
```

These spacing increments can be applied to the following atomic properties:

```
padding (p, paddingTop, paddingBottom, paddingLeft, paddingRight, pt, pb, pl, pr, px, py)
margin (m, marginTop, marginBottom, marginLeft, marginRight, mt, mb, ml, mr, m, mx, my)
gap
top
left
bottom
right
inset
```

## Shorthands

Zord has a small set of shorthand convenience properties that may look familiar if you've used other popular styling systems. They can be especially useful for defining multiple properties at once, eg. `py='x4'` sets both paddingTop and paddingBottom to 16px.

```
  shorthands: {
    minW: ['minWidth'],
    minH: ['minHeight'],
    maxW: ['maxWidth'],
    maxH: ['maxWidth'],
    margin: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
    m: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
    mx: ['marginLeft', 'marginRight'],
    my: ['marginTop', 'marginBottom'],
    mt: ['marginTop'],
    mb: ['marginBottom'],
    ml: ['marginLeft'],
    mr: ['marginRight'],
    pos: ['position'],
    padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    p: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    px: ['paddingLeft', 'paddingRight'],
    py: ['paddingTop', 'paddingBottom'],
    pt: ['paddingTop'],
    pb: ['paddingBottom'],
    pl: ['paddingLeft'],
    pr: ['paddingRight'],
    w: ['width'],
    h: ['height'],
    t: ['top'],
    l: ['left'],
    b: ['bottom'],
    r: ['right'],
    size: ['width', 'height'],
  },
```

## Responsive Styling

Media queries are defined using the following breakpoints:

```
const conditions = {
  '@initial': {},
  '@480': { '@media': '(min-width: 480px)' },
  '@576': { '@media': '(min-width: 576px)' },
  '@768': { '@media': '(min-width: 768px)' },
  '@1024': { '@media': '(min-width: 1024px)' },
  '@1440': { '@media': '(min-width: 1440px)' },
} as const
```

There are a few ways of applying responsive styles:

**_In Props_**

```
// Stack.tsx
 <Stack
   px="x4"
   py={{
     '@initial': 'x4',
     '@1024': 'x12',
   }}
   align="center"
 >
```

**_In Stylesheets_**

```
// ComponentName.css.ts
import { atoms, media } from '@buildeross/zord'

export const marginTop = atoms({
  mt: { '@initial': 'x32', '@768': 'x64' },
})

export const paddingX = atoms({
  px: { '@initial': 'x5', '@768': 'x8' },
})

export const filterGridHeader = style([
  {
    background: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(10px)',
    '@media': {
      [media.min1024]: {
        zIndex: HEADER_LAYER,
      },
    },
  },
  atoms({
    position: { '@initial': 'relative', '@768': 'sticky' },
    top: 'x16',
  }),
])

```

Note the different methods used to apply media queries inside the normal `style({})` block vs. inside of the `atoms({})` block.

## Selectors

[Vanilla Extract' Styling API](https://github.com/seek-oss/vanilla-extract#styling-api) requires that special selectors like ':hover' and '&[data-state="checked"]&:hover&:not([disabled])' must be nested inside of a `selectors:{}` object, and there are rules about targeting with which you should familiarize yourself.

```ts
export const link = style([
  {
    outline: 'none',
    textDecoration: 'none',
    selectors: {
      // <-- Nested selectors object
      '&:focus, &:hover': {
        '@media': {
          [media.min768]: {
            backgroundColor: vars.color.background2,
          },
        },
      },
    },
  },
  atoms({
    color: 'primary',
  }),
])
```

## Box Component

The functionality above is all encapsulated into the Box component, a polymorphic component that defaults to a `<div>` element but can take on the form of other elements by specifying an `as`. This allows us to build any kind of component with Box and inherit all of the useful styling behavior for free.

Let's have a look at an example.

```
// UserCard.tsx

export interface UserCardProps extends BoxProps {
  user: User
  as?: React.ElementType
}

export function UserCard({
  user,
  className,
  as,
}: UserCardProps) {
 return (
  <Box as={as} className={['zora-usercard', styles.card, className]}>
   <Heading as="h3" size="lg">{user.name}</Heading>
   <Paragraph size="md">{user.bio}</Paragraph>
  </Box>
 )
}
```

There are a few things going on here.

First, let's have a look at `<Heading>`, a general-purpose component. Heading has a number of size variants. By separating the style implementation from the semantic element used, we have full control over how semantic HTML is applied in different contexts. Here, we implement the heading `as='h3'`, but in other contexts we might want a heading with `size="lg"` to be implemented `as="h1"`.

UserCard accepts `as` props and is wrapped by a `Box` that implements it: `as={as}`. So UserCard can take context-specific semantic HTML based on usage: `<UserCard as="div" user={user} />` in the default case, `<UserCard as="li" user={user} />` for use inside of an `<ul>`, and so on.

One more thing to point out: className takes an array: `className={['zora-usercard', styles.card, className]}`. Under the hood, Box is using _clsx_, a super-lightweight package for constructing className strings conditionally. It's similar to the popular _classNames_ package. Any component inheriting BoxProps from Box can receive styles as an array without the need to explicitly use `clsx()`.

## Text Component

In the `<UserCard>` code block above, we discussed `<Header>` briefly. It's worth going into more detail. Under the hood, `<Header>` is based on a generic `<Text>` component, which inherits its behaviour from `<Box>`. `<Text>` has a large number of variants with custom fontSize, fontWeight, lineHeight. Rather than exposing this large set of variants as a single complex `<Text>` component, Zord creates a number of convenient text components to reflect these presets:

```
<Display>
<Heading>
<Paragraph>
<Eyebrow>
<MenuText>
<Label>
```

These text components can generally receive one or more size props: `xs | sm | md | lg | xl`

## Mixins

-- todo
