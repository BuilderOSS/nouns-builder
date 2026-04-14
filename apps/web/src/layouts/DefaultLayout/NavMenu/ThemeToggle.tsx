import { Box, Flex, Text } from '@buildeross/zord'
import React from 'react'
import { useThemeMode } from 'src/theme/AppThemeProvider'

import { themeToggleButton } from '../Nav.styles.css'

export const ThemeToggle = () => {
  const [isMounted, setIsMounted] = React.useState(false)
  const { mode, toggleMode } = useThemeMode()
  const isDarkMode = mode === 'dark'

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <Box h="x10" w="x10" />
  }

  return (
    <Flex
      as="button"
      type="button"
      align="center"
      justify="center"
      w="x10"
      className={themeToggleButton}
      onClick={toggleMode}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      aria-pressed={isDarkMode}
    >
      <Text fontSize={20} color="text2" aria-hidden="true" style={{ lineHeight: 1 }}>
        {isDarkMode ? '☾' : '☀'}
      </Text>
    </Flex>
  )
}
