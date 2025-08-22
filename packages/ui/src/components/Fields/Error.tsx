import { Box } from '@buildeross/zord'

interface ErrorProps {
  message: string
}

export const Error = ({ message }: ErrorProps) => (
  <Box mt={'x4'} color={'negative'}>
    {message}
  </Box>
)
