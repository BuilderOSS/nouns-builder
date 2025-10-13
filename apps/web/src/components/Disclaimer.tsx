import { DisclaimerComponent } from '@rainbow-me/rainbowkit'

export const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting a wallet, you acknowledge and agree to the Nouns Builder{' '}
    <Link href={'/legal'}>Terms of Service</Link> and{' '}
    <Link href="https://support.zora.co/en/articles/6383373-zora-privacy-policy">
      Privacy Policy
    </Link>
  </Text>
)
