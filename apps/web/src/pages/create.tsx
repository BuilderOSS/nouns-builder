import { useIsGnosisSafe } from '@buildeross/hooks/useIsGnosisSafe'
import { Box, Flex, Text } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { useAccount } from 'wagmi'

import { Meta } from 'src/components/Meta'
import { getCreateDaoLayout } from 'src/layouts/CreateDaoLayout'
import {
  AllocationForm,
  Artwork,
  AuctionSettingsForm,
  CreateFormSection,
  CreateNavigation,
  FormHandler,
  GeneralForm,
  ReviewAndDeploy,
  VetoForm,
  useFormStore,
} from 'src/modules/create-dao'
import { createWrapperHalf, formWrapper, pageGrid } from 'src/styles/styles.css'

import { NextPageWithLayout } from './_app'

const CreatePage: NextPageWithLayout = () => {
  const { activeSection } = useFormStore()
  const { address, chain } = useAccount()

  const { isGnosisSafe } = useIsGnosisSafe(address, chain?.id)

  /*

    Initialize Form Sections
      - order of returned array defines order of sections
      - multiple forms per section supported
  */

  const sections: CreateFormSection[] = React.useMemo(() => {
    const createDao: CreateFormSection = {
      title: 'General',
      heading: 'General Settings',
      form: <GeneralForm key={'general-info'} title={'General'} />,
    }

    const auctionSettings: CreateFormSection = {
      title: 'Auction',
      heading: 'Auction Settings',
      form: <AuctionSettingsForm key={'auction-settings'} title={'Auction'} />,
    }

    const vetoSettings: CreateFormSection = {
      title: 'Veto',
      heading: 'Veto Power',
      subHeading:
        'Veto power is useful for addressing security concerns in the early days of your DAO, though as your membership grows, consider revisiting this functionality through a decentralized community vote.',
      form: <VetoForm key={'veto-power'} title={'Veto'} />,
    }

    const founderAllocations: CreateFormSection = {
      title: 'Allocation',
      heading: 'Allocation',
      form: <AllocationForm key={'token-allocations'} title={'Allocation'} />,
    }

    const setUpArtwork: CreateFormSection = {
      title: 'Artwork',
      heading: 'Artwork Setup',
      form: <Artwork key={'set-up-artwork'} title={'Artwork'} />,
    }

    const reviewAndDeploy: CreateFormSection = {
      title: 'Deploy',
      subHeading: '[Confirm your contract settings before deploying your DAO]',
      form: <ReviewAndDeploy key={'review-and-deploy'} title={'Deploy'} />,
    }

    return [
      createDao,
      auctionSettings,
      vetoSettings,
      founderAllocations,
      setUpArtwork,
      reviewAndDeploy,
    ]
  }, [])

  return (
    <>
      <Meta title={'Create a DAO'} path={'/create'} />

      <Box position="relative" className={pageGrid}>
        <Flex className={createWrapperHalf['left']}>
          <Flex
            position={'absolute'}
            left={'x0'}
            top={'x0'}
            width={'100%'}
            height={'100%'}
            style={{
              background:
                'linear-gradient(179.98deg, rgba(0, 0, 0, 0.5) -0.98%, rgba(0, 0, 0, 0) 47.4%, rgba(0, 0, 0, 0.6) 99.98%)',
            }}
          />
          {!!address && !isGnosisSafe && <CreateNavigation sections={sections} />}
        </Flex>
        <Flex
          className={createWrapperHalf['right']}
          p={'x20'}
          placeItems={'center'}
          justify={'center'}
        >
          <Flex direction={'column'} className={formWrapper}>
            {!address ? (
              <Flex direction={'column'} mt={'x6'}>
                <Text mb={'x4'} style={{ fontSize: '24px', fontWeight: 700 }}>
                  Wallet Not Connected
                </Text>

                <Text color="text2">Please connect your wallet to create your DAO.</Text>
              </Flex>
            ) : (
              <>
                {isGnosisSafe ? (
                  <Flex direction={'column'} mt={'x6'}>
                    <Text mb={'x4'} style={{ fontSize: '24px', fontWeight: 700 }}>
                      DAO Creation Unavailable
                    </Text>

                    <Text color="text2" style={{ fontWeight: 700 }} mb={'x2'}>
                      Please use a different wallet to create your DAO.
                    </Text>
                    <Text color="text2">
                      Gnosis Safe doesn’t support the multi-transaction flow required for
                      DAO creation, which can lead to incomplete setups.
                    </Text>
                  </Flex>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={sections[activeSection]?.title}
                      variants={{
                        exit: {
                          y: 10,
                          opacity: 0,
                        },
                        closed: {
                          y: 10,
                          opacity: 0,
                        },
                        open: {
                          y: 0,
                          opacity: 1,
                          transition: {
                            when: 'afterChildren',
                          },
                        },
                      }}
                      initial="closed"
                      animate="open"
                      exit="exit"
                    >
                      <FormHandler
                        sectionIndex={activeSection}
                        form={sections[activeSection]?.form}
                        title={sections[activeSection]?.title}
                        heading={sections[activeSection]?.heading}
                        subHeading={sections[activeSection]?.subHeading}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}
          </Flex>
        </Flex>
      </Box>
    </>
  )
}

CreatePage.getLayout = getCreateDaoLayout

export default CreatePage
