import { Box, BoxProps } from '../elements/Box'
import { loadingSpinner } from './Spinner.css'

export interface SpinnerProps extends BoxProps {
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner = ({ size = 'md', ...rest }: SpinnerProps) => (
  <Box className={loadingSpinner({ size })} {...rest} />
)
