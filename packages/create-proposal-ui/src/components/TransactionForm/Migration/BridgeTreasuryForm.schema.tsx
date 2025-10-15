import * as yup from 'yup'

export interface BridgeTreasuryValues {
  amount?: number
}

const bridgeTreasuryFormSchema = (treasuryBalance: number) =>
  yup.object({
    amount: yup
      .number()
      .required()
      .max(treasuryBalance, 'Treasury balance is insufficient to send ETH.')
      .test(
        'is-greater-than-0',
        'Must send more than 0 ETH',
        (value) => !!value && value > 0
      ),
  })

export default bridgeTreasuryFormSchema
