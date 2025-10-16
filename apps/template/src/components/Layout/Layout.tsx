import { Box } from '@buildeross/zord'
import React from 'react'

import { Header } from '../Header'
import { layoutContainer, mainContent } from './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box className={layoutContainer}>
      <Header />
      <Box className={mainContent}>{children}</Box>
    </Box>
  )
}
