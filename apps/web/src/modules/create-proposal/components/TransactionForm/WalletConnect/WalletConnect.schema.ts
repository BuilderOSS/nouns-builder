import * as Yup from 'yup'

export interface WalletConnectValues {
  wcLink: string
}

const walletConnectSchema = Yup.object().shape({
  wcLink: Yup.string()
    .required('WalletConnect link is required')
    .matches(/^wc:/, 'WalletConnect link must start with "wc:"')
    .min(10, 'WalletConnect link is too short'),
})

export default walletConnectSchema
