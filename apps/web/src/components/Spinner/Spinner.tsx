import { Box, BoxProps } from '@buildeross/zord'

import { uploadingSpinner } from './Spinner.css'

interface SpinnerProps extends BoxProps {}

export const Spinner = ({ ...rest }: SpinnerProps) => (
  <Box className={uploadingSpinner} {...rest} />
)
