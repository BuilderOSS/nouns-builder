import * as Sentry from '@sentry/nextjs'

import { sentryOptions } from './sentry.client.config'

Sentry.init(sentryOptions)
