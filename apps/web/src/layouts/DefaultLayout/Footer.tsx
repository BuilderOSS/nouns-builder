import { Box, Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import { footerContent, footerLink, footerWrapper } from './Nav.styles.css'

export const Footer = () => {
  return (
    <Box w="100%" as="footer" className={footerWrapper}>
      <Box className={footerContent} w="100%" m="auto">
        <Box
          m="auto"
          p={{ '@initial': 'x4', '@768': 'x8' }}
          textAlign={{ '@initial': 'center', '@768': 'left' }}
        >
          <Box>
            <Flex
              align="center"
              justify={{
                '@initial': 'center',
                '@1024': 'space-between',
              }}
              direction={{ '@initial': 'column', '@768': 'row' }}
            >
              <Flex align="center" direction={{ '@initial': 'column', '@768': 'row' }}>
                <Text
                  variant="paragraph-sm"
                  color="tertiary"
                  as="a"
                  href="https://builder-docs.vercel.app/"
                  rel="noopener noreferrer"
                  target="_blank"
                  mr={{ '@initial': 'x0', '@768': 'x4', '@1024': 'x6' }}
                  className={footerLink}
                >
                  Documentation
                </Text>

                <Link href="/guidelines" passHref legacyBehavior>
                  <Text
                    variant="paragraph-sm"
                    color="tertiary"
                    as="a"
                    mt={{ '@initial': 'x4', '@768': 'x0' }}
                    className={footerLink}
                  >
                    Proposal Guidelines
                  </Text>
                </Link>
              </Flex>

              <Flex align="center" direction={{ '@initial': 'column', '@768': 'row' }}>
                <Text
                  variant="paragraph-sm"
                  color="tertiary"
                  as="a"
                  href="https://support.zora.co/en/articles/6383373-zora-privacy-policy"
                  rel="noopener noreferrer"
                  target="_blank"
                  mr={{ '@initial': 'x0', '@768': 'x4', '@1024': 'x6' }}
                  mt={{ '@initial': 'x4', '@768': 'x0' }}
                  className={footerLink}
                >
                  Privacy policy
                </Text>

                <Link href="/legal" passHref legacyBehavior>
                  <Text
                    variant="paragraph-sm"
                    color="tertiary"
                    as="a"
                    mt={{ '@initial': 'x4', '@768': 'x0' }}
                    className={footerLink}
                  >
                    Terms of service
                  </Text>
                </Link>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
