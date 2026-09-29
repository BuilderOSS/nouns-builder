import { Box, Button, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { debugAuth } from '../utils/debug'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void | Promise<void>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  isResetting: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, isResetting: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isResetting: false }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    debugAuth('Error caught by boundary: %O', { error, errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleReset = async () => {
    if (this.state.isResetting) return

    this.setState({ isResetting: true })

    try {
      await this.props.onReset?.()
      this.setState({ hasError: false, error: null, isResetting: false })
    } catch (error) {
      debugAuth('Error boundary reset failed: %O', error)
      this.setState({ isResetting: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Box
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: 'var(--colors-background1)',
            }}
          >
            <Box
              p="x6"
              borderRadius="phat"
              borderWidth="thin"
              borderStyle="solid"
              borderColor="border"
              backgroundColor="background1"
              style={{
                maxWidth: '560px',
                width: '100%',
                boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
              }}
            >
              <Stack gap="x4" align="center">
                <Box
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--colors-background2)',
                    color: 'var(--colors-text1)',
                    fontSize: '24px',
                    fontWeight: 700,
                  }}
                >
                  !
                </Box>

                <Stack gap="x2" align="center">
                  <Text variant="heading-sm" align="center">
                    Authentication interrupted
                  </Text>
                  <Text variant="paragraph-sm" color="text3" align="center">
                    We hit a problem while restoring your session. Resetting will
                    disconnect the wallet and clear SIWE state.
                  </Text>
                  {this.state.error?.message && (
                    <Text
                      variant="label-xs"
                      color="text3"
                      align="center"
                      style={{ opacity: 0.8 }}
                    >
                      {this.state.error.message}
                    </Text>
                  )}
                </Stack>

                <Button
                  onClick={() => void this.handleReset()}
                  disabled={this.state.isResetting}
                >
                  {this.state.isResetting ? 'Resetting...' : 'Reset session'}
                </Button>
              </Stack>
            </Box>
          </Box>
        )
      )
    }

    return this.props.children
  }
}
