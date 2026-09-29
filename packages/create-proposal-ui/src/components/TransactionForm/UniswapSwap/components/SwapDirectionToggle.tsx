import { Box, Button, Flex, Text } from '@buildeross/zord'
import type { FormikProps } from 'formik'

import type { SwapDirection, UniswapSwapFormValues } from '../UniswapSwap.schema'

interface SwapDirectionToggleProps {
  formik: FormikProps<UniswapSwapFormValues>
}

export const SwapDirectionToggle: React.FC<SwapDirectionToggleProps> = ({ formik }) => {
  const { values, setFieldValue } = formik

  const handleDirectionChange = (direction: SwapDirection) => {
    setFieldValue('swapDirection', direction)
  }

  return (
    <Box>
      <Text fontWeight="display" mb="x3">
        Action
      </Text>
      <Flex gap="x3">
        <Button
          type="button"
          variant={values.swapDirection === 'buy' ? 'primary' : 'ghost'}
          onClick={() => handleDirectionChange('buy')}
          style={{ flex: 1 }}
        >
          <Flex align="center" gap="x2" justify="center">
            <Text>Buy Token</Text>
          </Flex>
        </Button>
        <Button
          type="button"
          variant={values.swapDirection === 'sell' ? 'primary' : 'ghost'}
          onClick={() => handleDirectionChange('sell')}
          style={{ flex: 1 }}
        >
          <Flex align="center" gap="x2" justify="center">
            <Text>Sell Token</Text>
          </Flex>
        </Button>
      </Flex>
      <Text variant="paragraph-sm" color="text3" mt="x2">
        {values.swapDirection === 'buy'
          ? 'Specify exactly how much you want to receive. The required payment will be calculated.'
          : 'Specify exactly how much you want to sell. The expected output will be calculated.'}
      </Text>
    </Box>
  )
}
