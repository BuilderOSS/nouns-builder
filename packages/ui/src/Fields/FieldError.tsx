import { Box } from '@buildeross/zord'

interface FieldErrorProps {
  message: string
}

const FieldError = ({ message }: FieldErrorProps) => (
  <Box mt={'x4'} color={'negative'}>
    {message}
  </Box>
)

export default FieldError
