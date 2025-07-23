# @buildeross/zord

Modern design system and component library for BuilderOSS applications, built with Vanilla Extract for type-safe styling, atomic design principles, and comprehensive theming support.

## Installation

```bash
pnpm install @buildeross/zord
```

## Features

- **Type-Safe Styling**: Built with Vanilla Extract for compile-time CSS generation
- **Atomic Design**: Pre-defined utility classes (atoms) for consistent styling
- **Theming System**: Comprehensive theme contracts with light/dark mode support
- **Polymorphic Components**: Flexible components that can render as different HTML elements
- **Responsive Design**: Built-in responsive utilities with mobile-first approach
- **Accessibility**: Components built with accessibility best practices
- **Tree Shaking**: Only import the components and styles you need
- **Design Tokens**: Consistent spacing, typography, colors, and more

## Quick Start

### 1. Add Styles and Fonts

```tsx
// pages/_app.tsx or app/layout.tsx
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@buildeross/zord/index.css'
```

### 2. Wrap Your App with ThemeProvider

```tsx
import { ThemeProvider, lightTheme } from '@buildeross/zord'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={lightTheme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
```

### 3. Start Using Components

```tsx
import { Box, Text, Button, Stack, Flex } from '@buildeross/zord'

function MyComponent() {
  return (
    <Box p="x6" backgroundColor="background1" borderRadius="normal">
      <Stack gap="x4">
        <Text size="lg" weight="heading">Welcome to Zord</Text>
        <Text color="text2">A modern design system</Text>
        <Button variant="primary">Get Started</Button>
      </Stack>
    </Box>
  )
}
```

## Core Components

### Box - The Foundation

Box is the foundational component that all other components are built on. It's polymorphic and accepts all atomic styling props.

```tsx
import { Box } from '@buildeross/zord'

// Basic usage
<Box p="x4" backgroundColor="background1" borderRadius="normal">
  Content goes here
</Box>

// Polymorphic - render as different elements
<Box as="section" p="x8">Section content</Box>
<Box as="article" mb="x6">Article content</Box>

// With responsive styles
<Box 
  p={{ '@initial': 'x4', '@768': 'x8' }}
  width={{ '@initial': '100%', '@1024': '50%' }}
>
  Responsive content
</Box>
```

### Layout Components

#### Stack - Vertical Layout

```tsx
import { Stack } from '@buildeross/zord'

<Stack gap="x4" align="center">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</Stack>
```

#### Flex - Flexible Layout

```tsx
import { Flex } from '@buildeross/zord'

<Flex justify="space-between" align="center" gap="x3">
  <Text>Left content</Text>
  <Button>Right action</Button>
</Flex>
```

#### Grid - Grid Layout

```tsx
import { Grid } from '@buildeross/zord'

<Grid columns={{ '@initial': 1, '@768': 2, '@1024': 3 }} gap="x6">
  <Box>Grid item 1</Box>
  <Box>Grid item 2</Box>
  <Box>Grid item 3</Box>
</Grid>
```

### Typography Components

#### Text - General Text

```tsx
import { Text } from '@buildeross/zord'

<Text size="lg" weight="heading" color="text1">
  Main heading
</Text>

<Text size="md" color="text2" lineHeight="1.5">
  Body text content
</Text>
```

#### Specialized Text Components

```tsx
import { Heading, Paragraph, Label, Eyebrow } from '@buildeross/zord'

<Heading size="xl">Page Title</Heading>
<Eyebrow>Category</Eyebrow>
<Paragraph size="md">Body content goes here</Paragraph>
<Label size="sm">Form label</Label>
```

### Interactive Components

#### Button

```tsx
import { Button } from '@buildeross/zord'

<Button variant="primary" size="md">
  Primary Action
</Button>

<Button variant="secondary" size="sm" disabled>
  Secondary Action
</Button>

<Button variant="ghost" size="lg">
  Ghost Button
</Button>
```

#### Input Components

```tsx
import { Input, InputField, Select } from '@buildeross/zord'

<Input 
  placeholder="Enter text"
  variant="default"
  size="md"
/>

<InputField
  label="Email Address"
  placeholder="you@example.com"
  type="email"
  required
/>

<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  placeholder="Select an option"
/>
```

### Utility Components

#### Icon

```tsx
import { Icon, ChevronDown, Spinner } from '@buildeross/zord'

<Icon size="md" color="text1">
  <ChevronDown />
</Icon>

<Spinner size="lg" />
```

#### PopUp (Tooltip/Dropdown)

```tsx
import { PopUp } from '@buildeross/zord'

<PopUp
  trigger={<Button>Hover me</Button>}
  content="This is a tooltip"
  placement="top"
/>
```

## Theming System

### Theme Contract

Zord uses a theme contract system that ensures consistency across all themes:

```tsx
export const theme = createThemeContract({
  colors: {
    background1: '',
    background2: '',
    text1: '',
    text2: '',
    primary: '',
    secondary: '',
    // ... more colors
  },
  space: {
    x0: '',
    x1: '',
    x2: '',
    // ... spacing scale
  },
  fonts: {
    body: '',
    heading: '',
    mono: '',
  },
  // ... more design tokens
})
```

### Using Themes

```tsx
import { ThemeProvider, lightTheme, darkTheme } from '@buildeross/zord'

// Light theme
<ThemeProvider theme={lightTheme}>
  <App />
</ThemeProvider>

// Dark theme
<ThemeProvider theme={darkTheme}>
  <App />
</ThemeProvider>

// Custom theme
const customTheme = createTheme(theme, {
  colors: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    // ... custom colors
  }
})

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### Theme Switching

```tsx
import { useState } from 'react'
import { ThemeProvider, lightTheme, darkTheme } from '@buildeross/zord'

function App() {
  const [isDark, setIsDark] = useState(false)
  const theme = isDark ? darkTheme : lightTheme

  return (
    <ThemeProvider theme={theme}>
      <Button onClick={() => setIsDark(!isDark)}>
        Switch to {isDark ? 'Light' : 'Dark'} Theme
      </Button>
      {/* Rest of your app */}
    </ThemeProvider>
  )
}
```

## Atomic Styling (Atoms)

Zord's atomic system allows you to apply styles directly as props or use the atoms function for custom styling.

### Using Atoms as Props

```tsx
<Box
  p="x6"                    // padding
  m="x4"                    // margin
  backgroundColor="primary" // background color
  borderRadius="normal"     // border radius
  width="100%"             // width
  height="x20"             // height
/>
```

### Responsive Atoms

```tsx
<Box
  p={{
    '@initial': 'x4',  // mobile
    '@768': 'x6',      // tablet
    '@1024': 'x8'      // desktop
  }}
  width={{
    '@initial': '100%',
    '@1024': '50%'
  }}
/>
```

### Using Atoms in Stylesheets

```tsx
// Component.css.ts
import { atoms, style } from '@buildeross/zord'

export const customBox = style([
  {
    // Custom CSS properties
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  atoms({
    // Atomic properties
    p: 'x6',
    backgroundColor: 'background1',
    borderRadius: 'normal'
  })
])

// Component.tsx
<Box className={customBox}>Content</Box>
```

## Spacing System

Zord uses a consistent 4px-based spacing system:

```tsx
// Spacing tokens
x0: 0px
x1: 4px
x2: 8px
x3: 12px
x4: 16px
x5: 20px
x6: 24px
// ... continues up to x64

// Usage in components
<Box p="x4" m="x2">       // 16px padding, 8px margin
<Stack gap="x6">          // 24px gap between items
<Flex px="x8" py="x4">    // 32px horizontal, 16px vertical padding
```

## Responsive Design

Zord uses a mobile-first responsive approach with these breakpoints:

```tsx
const breakpoints = {
  '@initial': 0,      // mobile first
  '@480': '480px',    // small mobile
  '@576': '576px',    // large mobile
  '@768': '768px',    // tablet
  '@1024': '1024px',  // desktop
  '@1440': '1440px'   // large desktop
}
```

### Responsive Usage

```tsx
// In components
<Box
  width={{ '@initial': '100%', '@768': '50%', '@1024': '33.333%' }}
  p={{ '@initial': 'x4', '@768': 'x6', '@1024': 'x8' }}
>
  Responsive content
</Box>

// In stylesheets
export const responsiveStyle = atoms({
  display: { '@initial': 'block', '@768': 'flex' },
  flexDirection: { '@768': 'row', '@1024': 'column' }
})
```

## Advanced Styling

### Mixins

Zord includes helpful mixins for common patterns:

```tsx
import { mixins } from '@buildeross/zord'

// Center content
<Box className={mixins({ center: true })}>
  Centered content
</Box>

// In stylesheets
export const centeredBox = style([
  mixins({ center: true }),
  atoms({ p: 'x6' })
])
```

### Selectors and Pseudo-Classes

```tsx
// Component.css.ts
import { style } from '@buildeross/zord'

export const interactiveBox = style({
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)'
    },
    '&:focus': {
      outline: '2px solid blue',
      outlineOffset: '2px'
    }
  }
})
```

### Custom CSS Properties

```tsx
// For styles not covered by atoms
const customStyle = style({
  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
  backdropFilter: 'blur(10px)',
  clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)'
})

<Box className={customStyle}>
  Custom styled content
</Box>
```

## Color System

Zord provides a comprehensive color system with semantic naming:

```tsx
// Background colors
backgroundColor="background1"  // Primary background
backgroundColor="background2"  // Secondary background

// Text colors
color="text1"     // Primary text
color="text2"     // Secondary text
color="text3"     // Tertiary text

// Semantic colors
color="primary"   // Brand primary
color="secondary" // Brand secondary
color="accent"    // Accent color
color="positive"  // Success/positive
color="negative"  // Error/negative
color="warning"   // Warning/caution

// Interactive states
backgroundColor="primaryHover"    // Hover states
backgroundColor="primaryActive"   // Active states
backgroundColor="primaryDisabled" // Disabled states
```

## Typography Scale

Consistent typography with semantic sizing:

```tsx
// Font sizes
fontSize="12"    // 12px
fontSize="14"    // 14px
fontSize="16"    // 16px (base)
fontSize="18"    // 18px
fontSize="20"    // 20px
// ... up to fontSize="80"

// Semantic text components
<Heading size="xl">Main Title</Heading>     // Large heading
<Heading size="lg">Section Title</Heading>  // Medium heading
<Heading size="md">Subsection</Heading>     // Small heading

<Paragraph size="lg">Lead paragraph</Paragraph>
<Paragraph size="md">Body text</Paragraph>
<Paragraph size="sm">Small text</Paragraph>

<Label size="md">Form labels</Label>
<Eyebrow size="sm">Category labels</Eyebrow>
```

## Best Practices

### Component Composition

```tsx
// Good: Compose components for reusability
function UserCard({ user }) {
  return (
    <Box p="x6" backgroundColor="background1" borderRadius="normal">
      <Stack gap="x4">
        <Flex align="center" gap="x3">
          <Box size="x12" borderRadius="round" backgroundColor="background2" />
          <Stack gap="x1">
            <Text weight="heading">{user.name}</Text>
            <Text size="sm" color="text2">{user.email}</Text>
          </Stack>
        </Flex>
        <Text color="text2">{user.bio}</Text>
      </Stack>
    </Box>
  )
}
```

### Semantic HTML

```tsx
// Use appropriate semantic elements
<Box as="main" p="x8">
  <Box as="section" mb="x12">
    <Heading as="h1" size="xl">Page Title</Heading>
  </Box>
  
  <Box as="article">
    <Heading as="h2" size="lg">Article Title</Heading>
    <Paragraph>Article content...</Paragraph>
  </Box>
</Box>
```

### Accessibility

```tsx
// Include proper accessibility attributes
<Button
  aria-label="Close dialog"
  onClick={handleClose}
>
  <Icon><CloseIcon /></Icon>
</Button>

<Input
  aria-describedby="email-help"
  placeholder="Enter email"
/>
<Text id="email-help" size="sm" color="text2">
  We'll never share your email
</Text>
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Development build with watch
pnpm dev

# Build icons from SVGs
pnpm build-icons

# Run linting
pnpm lint
```

### Scripts

- `pnpm build` - Build the package for production
- `pnpm dev` - Build in watch mode for development
- `pnpm build-icons` - Generate React components from SVG icons
- `pnpm dev:types` - Generate TypeScript declarations
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm clean` - Remove build artifacts and dependencies

## Dependencies

### Runtime Dependencies
- `@vanilla-extract/css` - CSS-in-TypeScript styling
- `@vanilla-extract/recipes` - Component variants
- `@vanilla-extract/sprinkles` - Atomic CSS utilities
- `@popperjs/core` - Positioning for tooltips and dropdowns
- `react-popper` - React wrapper for Popper.js
- `clsx` - Conditional className utility
- `react-polymorphic-types` - TypeScript utilities for polymorphic components

### Peer Dependencies
- `react` ^19.1.0
- `react-dom` ^19.1.0

### Development Dependencies
- `@svgr/cli` - SVG to React component conversion
- Vanilla Extract build plugins
- TypeScript and ESLint configurations

## Design Tokens

### Colors
- Semantic color system with light/dark theme support
- Consistent naming conventions
- Interactive state variants (hover, active, disabled)

### Spacing
- 4px-based spacing scale (x0 to x64)
- Consistent margins, padding, and gaps
- Responsive spacing support

### Typography
- Inter font family by default
- Consistent font sizes and line heights
- Semantic text components

### Borders & Radii
- Consistent border styles and widths
- Border radius scale (tiny, small, normal, curved, phat, round)

### Shadows
- Subtle shadow system
- Consistent elevation levels

## Browser Support

Zord supports modern browsers with CSS Grid and CSS Custom Properties support:

- Chrome 88+
- Firefox 87+
- Safari 14+
- Edge 88+

## Migration Guide

### From CSS Modules

```tsx
// Before (CSS Modules)
import styles from './Component.module.css'
<div className={styles.container}>Content</div>

// After (Zord)
import { Box } from '@buildeross/zord'
<Box p="x6" backgroundColor="background1">Content</Box>
```

### From Styled Components

```tsx
// Before (Styled Components)
const Container = styled.div`
  padding: 24px;
  background-color: white;
  border-radius: 8px;
`

// After (Zord)
import { Box } from '@buildeross/zord'
<Box p="x6" backgroundColor="background1" borderRadius="normal">
  Content
</Box>
```

## Performance

- **Zero Runtime**: All styles are generated at build time
- **Atomic CSS**: Minimal CSS bundle size through reusable atomic classes
- **Tree Shaking**: Only import components and styles you use
- **Static Extraction**: CSS is extracted to separate files for optimal loading

## License

MIT License - see LICENSE file for details.