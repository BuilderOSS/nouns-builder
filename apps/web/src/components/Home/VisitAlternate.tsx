import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import { atoms, Flex, Icon, Text } from '@buildeross/zord'

const VisitAlternate = () => {
  return (
    <a
      href={PUBLIC_IS_TESTNET ? 'https://nouns.build/' : 'https://testnet.nouns.build/'}
      target="_blank"
      rel="noreferrer noopener"
    >
      <Flex align={'center'} mt={{ '@initial': 'x3', '@768': 'x6' }} color="text1">
        <Text
          fontSize={{ '@initial': 14, '@768': 18 }}
          fontWeight={'paragraph'}
          className={atoms({ textDecoration: 'underline' })}
        >
          {PUBLIC_IS_TESTNET ? 'Visit Mainnet' : 'Visit Testnet'}
        </Text>
        <Icon fill="text1" size="sm" ml="x1" id="external-16" />
      </Flex>
    </a>
  )
}

export default VisitAlternate
