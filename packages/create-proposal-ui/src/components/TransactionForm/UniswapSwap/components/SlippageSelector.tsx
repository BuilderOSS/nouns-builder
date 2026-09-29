import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import type { FormikProps } from 'formik'

import type { SlippagePreset, UniswapSwapFormValues } from '../UniswapSwap.schema'

interface SlippageSelectorProps {
  formik: FormikProps<UniswapSwapFormValues>
  executionDelayText?: string
}

const SLIPPAGE_PRESETS: SlippagePreset[] = [5, 10, 15]

export const SlippageSelector: React.FC<SlippageSelectorProps> = ({
  formik,
  executionDelayText,
}) => {
  const { values, setFieldValue, errors, touched } = formik

  const handlePresetClick = (preset: SlippagePreset) => {
    setFieldValue('slippageType', 'preset')
    setFieldValue('slippagePreset', preset)
    setFieldValue('slippageCustom', undefined)
  }

  const handleCustomClick = () => {
    setFieldValue('slippageType', 'custom')
    setFieldValue('slippagePreset', undefined)
  }

  const getSlippageValue = (): number | null => {
    if (values.slippageType === 'preset' && values.slippagePreset) {
      return values.slippagePreset
    }
    if (values.slippageType === 'custom' && values.slippageCustom) {
      const parsed = parseFloat(values.slippageCustom)
      return isNaN(parsed) ? null : parsed
    }
    return null
  }

  const slippageValue = getSlippageValue()
  const showWarning = slippageValue !== null && slippageValue < 5

  return (
    <Stack gap="x3">
      <Box>
        <Text fontWeight="display" mb="x3">
          Slippage Tolerance
        </Text>
        <Text variant="paragraph-sm" color="text3" mb="x3">
          Maximum price movement allowed. Higher slippage accounts for volatility during
          proposal execution delays.
          {executionDelayText && (
            <>
              {' '}
              This proposal takes <strong>{executionDelayText}</strong> to execute, so
              higher slippage is recommended.
            </>
          )}
        </Text>

        <Flex gap="x2" mb="x3">
          {SLIPPAGE_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={
                values.slippageType === 'preset' && values.slippagePreset === preset
                  ? 'primary'
                  : 'outline'
              }
              size="sm"
              onClick={() => handlePresetClick(preset)}
            >
              {preset}%
            </Button>
          ))}
          <Button
            type="button"
            variant={values.slippageType === 'custom' ? 'primary' : 'outline'}
            size="sm"
            onClick={handleCustomClick}
          >
            Custom
          </Button>
        </Flex>

        {values.slippageType === 'custom' && (
          <SmartInput
            type={FIELD_TYPES.TEXT}
            formik={formik}
            {...formik.getFieldProps('slippageCustom')}
            id="slippageCustom"
            inputLabel=""
            placeholder="Enter %"
            errorMessage={
              touched.slippageCustom ? (errors.slippageCustom as string) : undefined
            }
          />
        )}
      </Box>

      {showWarning && (
        <Box
          p="x3"
          borderRadius="phat"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="warning"
        >
          <Text fontSize="14">
            <strong>⚠️ Low slippage warning:</strong> A slippage tolerance below 5% may
            cause the transaction to fail if prices change during the proposal execution
            delay
            {executionDelayText && (
              <>
                {' '}
                (<strong>{executionDelayText}</strong>)
              </>
            )}
            . Consider using 10-15% for governance proposals.
          </Text>
        </Box>
      )}

      {slippageValue !== null && slippageValue >= 5 && (
        <Box
          p="x3"
          borderRadius="phat"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="positive"
        >
          <Text fontSize="14">
            ✅ Slippage tolerance set to <strong>{slippageValue}%</strong> - suitable for
            governance proposals with execution delays
          </Text>
        </Box>
      )}
    </Stack>
  )
}
