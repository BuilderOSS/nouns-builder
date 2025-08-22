import { Box } from '@buildeross/zord'

interface FieldErrorProps {
  message: string
}

export const FieldError = ({ message }: FieldErrorProps) => (
  <Box mt={'x4'} color={'negative'}>
    {message}
  </Box>
)
