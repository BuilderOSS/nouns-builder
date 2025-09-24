# @buildeross/analytics

Shared analytics components for BuilderOSS Next.js applications, providing easy integration with Google Analytics, Segment, and Vercel Analytics.

## Installation

```bash
pnpm install @buildeross/analytics
```

## Features

- **Google Analytics**: GA4 tracking integration using Next.js Script optimization
- **Segment Analytics**: Client-side analytics with Segment's JavaScript SDK
- **Vercel Analytics**: Web vitals and performance tracking for Vercel deployments
- **TypeScript Support**: Full TypeScript definitions included
- **Next.js Optimized**: Uses Next.js Script component for optimal loading

## Usage

### Basic Setup

Import and use analytics components in your Next.js application root:

```tsx
import { GoogleAnalytics, SegmentAnalytics, VercelAnalytics } from '@buildeross/analytics'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <GoogleAnalytics id="GA_MEASUREMENT_ID" />
      <SegmentAnalytics id="SEGMENT_WRITE_KEY" />
      <VercelAnalytics />
      <Component {...pageProps} />
    </>
  )
}
```

### Individual Components

#### Google Analytics

```tsx
import { GoogleAnalytics } from '@buildeross/analytics'
;<GoogleAnalytics id="GA_MEASUREMENT_ID" />
```

#### Segment Analytics

```tsx
import { SegmentAnalytics } from '@buildeross/analytics'
;<SegmentAnalytics id="SEGMENT_WRITE_KEY" />
```

#### Vercel Analytics

```tsx
import { VercelAnalytics } from '@buildeross/analytics'
;<VercelAnalytics />
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### Scripts

- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint and type checking

## Dependencies

### Peer Dependencies

- `next`: ^15.3.2
- `react`: ^19.1.0

### Runtime Dependencies

- `@vercel/analytics`: ^0.1.5

## API Reference

### GoogleAnalytics

| Prop | Type     | Required | Description                                         |
| ---- | -------- | -------- | --------------------------------------------------- |
| `id` | `string` | Yes      | Google Analytics Measurement ID (GA_MEASUREMENT_ID) |

### SegmentAnalytics

| Prop | Type     | Required | Description       |
| ---- | -------- | -------- | ----------------- |
| `id` | `string` | Yes      | Segment Write Key |

### VercelAnalytics

No props required. Automatically tracks web vitals when deployed on Vercel.

## License

MIT License - see LICENSE file for details.
