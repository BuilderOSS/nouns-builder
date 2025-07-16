import { Box } from '@buildeross/zord'
import React from 'react'

interface ErrorProps {
  message: string
}

export const Error = ({ message }: ErrorProps) => (
  <Box mt={'x4'} color={'negative'}>
    {message}
  </Box>
)
