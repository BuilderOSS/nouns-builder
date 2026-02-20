import { useChainStore } from '@buildeross/stores'
import { DaysHoursMinsSecs, FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import {
  defaultFormAdvancedToggle,
  defaultFormAdvancedWrapper,
} from '@buildeross/ui/styles'
import { isTestnetChain } from '@buildeross/utils/chains'
import { formatDuration } from '@buildeross/utils/formatDuration'
import { isEmpty } from '@buildeross/utils/helpers'
import { Button, Flex, Heading, Icon, Stack } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import { motion } from 'framer-motion'
import React, { BaseSyntheticEvent, useEffect } from 'react'

import { useFormStore } from '../../stores'
import { FormNavButtons } from '../FormNavButtons'
import {
  deployCheckboxHelperText,
  deployCheckboxStyleVariants,
} from '../ReviewAndDeploy/ReviewAndDeploy.css'
import {
  AuctionSettingsFormValues,
  auctionSettingsValidationSchema,
} from './AuctionSettingsForm.schema'
import { FAST_DAO_TIMINGS } from './fastDaoTimings'

interface AuctionSettingsFormProps {
  title: string
}

const animation = {
  init: {
    height: 0,
  },
  open: {
    height: 'auto',
  },
}

// const VOTING_DELAY_AND_PERIOD_AUTHORIZED_USERS = [
//   '0x7498e6e471f31e869f038D8DBffbDFdf650c3F95',
//   '0x2767500a75D90D711b2Ac27b3a032a0dAa40e4B2',
//   '0x3B60e31CFC48a9074CD5bEbb26C9EAa77650a43F',
// ]

export const AuctionSettingsForm: React.FC<AuctionSettingsFormProps> = ({ title }) => {
  const {
    setAuctionSettings,
    auctionSettings,
    setFulfilledSections,
    setActiveSection,
    activeSection,
    enableFastDAO,
    setEnableFastDAO,
  } = useFormStore()
  const chain = useChainStore((x) => x.chain)
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false)

  useEffect(() => {
    if (enableFastDAO && !isTestnetChain(chain.id)) {
      setEnableFastDAO(false)
    }
  }, [chain.id, enableFastDAO, setEnableFastDAO])

  const initialValues: AuctionSettingsFormValues = {
    auctionDuration: {
      seconds: auctionSettings?.auctionDuration?.seconds,
      minutes: auctionSettings?.auctionDuration?.minutes,
      days: auctionSettings?.auctionDuration?.days ?? 1,
      hours: auctionSettings?.auctionDuration?.hours,
    },
    auctionReservePrice: auctionSettings?.auctionReservePrice,
    proposalThreshold:
      auctionSettings?.proposalThreshold === 0
        ? 0
        : (auctionSettings?.proposalThreshold ?? 0.5),
    quorumThreshold:
      auctionSettings?.quorumThreshold === 0
        ? 0
        : (auctionSettings?.quorumThreshold ?? 10),
    votingDelay: {
      seconds: auctionSettings?.votingDelay?.seconds,
      minutes: auctionSettings?.votingDelay?.minutes,
      days: auctionSettings?.votingDelay?.days ?? 1,
      hours: auctionSettings?.votingDelay?.hours,
    },
    votingPeriod: {
      seconds: auctionSettings?.votingPeriod?.seconds,
      minutes: auctionSettings?.votingPeriod?.minutes,
      days: auctionSettings?.votingPeriod?.days ?? 4,
      hours: auctionSettings?.votingPeriod?.hours,
    },
    timelockDelay: {
      seconds: auctionSettings?.timelockDelay?.seconds,
      minutes: auctionSettings?.timelockDelay?.minutes,
      days: auctionSettings?.timelockDelay?.days ?? 2,
      hours: auctionSettings?.timelockDelay?.hours,
    },
  }

  const handleSubmit = (values: AuctionSettingsFormValues) => {
    setAuctionSettings(values)
    setFulfilledSections(title)
    setActiveSection(activeSection + 1)
  }

  const handlePrev = () => {
    setActiveSection(activeSection - 1)
  }

  const handleFastDAOToggle = (formik: {
    setValues: (v: AuctionSettingsFormValues) => void
    values: AuctionSettingsFormValues
  }) => {
    if (!enableFastDAO) {
      formik.setValues({
        ...formik.values,
        auctionDuration: {
          days: 0,
          hours: 0,
          minutes: FAST_DAO_TIMINGS.AUCTION_DURATION.minutes,
          seconds: 0,
        },
        auctionReservePrice: 0,
        votingDelay: {
          days: 0,
          hours: 0,
          minutes: FAST_DAO_TIMINGS.VOTING_DELAY.minutes,
          seconds: 0,
        },
        votingPeriod: {
          days: 0,
          hours: 0,
          minutes: FAST_DAO_TIMINGS.VOTING_PERIOD.minutes,
          seconds: 0,
        },
        timelockDelay: {
          days: 0,
          hours: 0,
          minutes: FAST_DAO_TIMINGS.TIMELOCK_DELAY.minutes,
          seconds: 0,
        },
      })
      setShowAdvanced(true)
      setEnableFastDAO(true)
    } else {
      formik.setValues(initialValues)
      setEnableFastDAO(false)
    }
  }

  return (
    <Formik<AuctionSettingsFormValues>
      initialValues={initialValues}
      validationSchema={auctionSettingsValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validateOnMount={true}
      validateOnBlur={false}
    >
      {(formik) => (
        <Form>
          <Flex direction={'column'} w={'100%'}>
            <Stack>
              <DaysHoursMinsSecs
                {...formik.getFieldProps('auctionDuration')}
                inputLabel={'Auction Duration'}
                helperText="How long each auction will run before it ends. When time expires, the highest bid wins and a new DAO NFT is minted."
                formik={formik}
                id={'auctionDuration'}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errorMessage={
                  formik.touched['auctionDuration'] && formik.errors['auctionDuration']
                    ? formik.errors['auctionDuration']
                    : undefined
                }
                placeholder={['1', '0', '0', '0']}
                disabled={enableFastDAO}
              />

              <SmartInput
                {...formik.getFieldProps('auctionReservePrice')}
                inputLabel={'Auction Reserve Price'}
                type={FIELD_TYPES.NUMBER}
                formik={formik}
                id={'auctionReservePrice'}
                onChange={({ target }: BaseSyntheticEvent) => {
                  formik.setFieldValue('auctionReservePrice', parseFloat(target.value))
                }}
                onBlur={formik.handleBlur}
                helperText="The minimum bid required to start an auction. If no bids meet this price, the auction won't begin."
                errorMessage={
                  formik.touched['auctionReservePrice'] &&
                  formik.errors['auctionReservePrice']
                    ? formik.errors['auctionReservePrice']
                    : undefined
                }
                perma={'ETH'}
                disabled={enableFastDAO}
              />
            </Stack>

            {isTestnetChain(chain.id) && (
              <Flex mt={'x4'} mb={'x4'}>
                <Flex align={'center'} justify={'center'} gap={'x4'}>
                  <Flex
                    align={'center'}
                    justify={'center'}
                    className={
                      deployCheckboxStyleVariants[enableFastDAO ? 'confirmed' : 'default']
                    }
                    onClick={() => handleFastDAOToggle(formik)}
                  >
                    {enableFastDAO && <Icon fill="background1" id="check" />}
                  </Flex>
                  <Flex className={deployCheckboxHelperText}>
                    <strong>Enable Fast DAO (testnet only):</strong> ultra-short timings
                    for testing &mdash;{' '}
                    {formatDuration(FAST_DAO_TIMINGS.AUCTION_DURATION)} auction (0 ETH
                    reserve), {formatDuration(FAST_DAO_TIMINGS.TIMELOCK_DELAY)} timelock,{' '}
                    {formatDuration(FAST_DAO_TIMINGS.VOTING_DELAY)} voting delay,{' '}
                    {formatDuration(FAST_DAO_TIMINGS.VOTING_PERIOD)} voting period.{' '}
                    <strong>Not for production.</strong>
                  </Flex>
                </Flex>
              </Flex>
            )}

            <Button
              align={'center'}
              justify={'center'}
              alignSelf={'center'}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={defaultFormAdvancedToggle}
              gap={'x3'}
              py={'x3'}
              mb={'x8'}
            >
              Advanced Settings
              <Icon id={showAdvanced ? 'chevronUp' : 'chevronDown'} />
            </Button>
            <motion.div
              className={defaultFormAdvancedWrapper}
              variants={animation}
              initial={'init'}
              animate={showAdvanced ? 'open' : 'init'}
            >
              <Heading as={'h3'} mt={'x0'} mb={'x8'} fontSize={40}>
                Governance Settings
              </Heading>
              <SmartInput
                {...formik.getFieldProps('proposalThreshold')}
                inputLabel={'Proposal Threshold'}
                type={FIELD_TYPES.NUMBER}
                formik={formik}
                id={'proposalThreshold'}
                onChange={({ target }: BaseSyntheticEvent) => {
                  formik.setFieldValue('proposalThreshold', parseFloat(target.value))
                }}
                onBlur={formik.handleBlur}
                helperText="The minimum percent of total NFTs required to create a proposal. For example, if set to 0.5% and there are 1,000 NFTs, a member must hold at least 5 NFTs to propose."
                errorMessage={
                  formik.touched['proposalThreshold'] &&
                  formik.errors['proposalThreshold']
                    ? formik.errors['proposalThreshold']
                    : undefined
                }
                perma={'%'}
                step={0.1}
              />
              <SmartInput
                {...formik.getFieldProps('quorumThreshold')}
                inputLabel={'Quorum Threshold'}
                type={FIELD_TYPES.NUMBER}
                formik={formik}
                id={'quorumThreshold'}
                onChange={({ target }: BaseSyntheticEvent) => {
                  formik.setFieldValue('quorumThreshold', parseFloat(target.value))
                }}
                onBlur={formik.handleBlur}
                helperText="The minimum percent of total NFTs that must vote ‘For’ for a proposal to pass. We recommend a starting value of 10%."
                errorMessage={
                  formik.touched['quorumThreshold'] && formik.errors['quorumThreshold']
                    ? formik.errors['quorumThreshold']
                    : undefined
                }
                perma={'%'}
                step={1}
              />
              <DaysHoursMinsSecs
                {...formik.getFieldProps('votingPeriod')}
                inputLabel={'Voting Period'}
                formik={formik}
                id={'votingPeriod'}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errorMessage={
                  formik.touched['votingPeriod'] && formik.errors['votingPeriod']
                    ? formik.errors['votingPeriod']
                    : undefined
                }
                helperText="How long a proposal remains open for voting before it closes and results are tallied."
                placeholder={['4', '0', '0', '0']}
                disabled={enableFastDAO}
              />

              <DaysHoursMinsSecs
                {...formik.getFieldProps('votingDelay')}
                inputLabel={'Voting Delay'}
                formik={formik}
                id={'votingDelay'}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errorMessage={
                  formik.touched['votingDelay'] && formik.errors['votingDelay']
                    ? formik.errors['votingDelay']
                    : undefined
                }
                helperText="The time between when a proposal is created and when voting begins. This gives members a chance to review and discuss the proposal."
                placeholder={['1', '0', '0', '0']}
                disabled={enableFastDAO}
              />

              <DaysHoursMinsSecs
                {...formik.getFieldProps('timelockDelay')}
                inputLabel={'Timelock Delay'}
                formik={formik}
                id={'timelockDelay'}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errorMessage={
                  formik.touched['timelockDelay'] && formik.errors['timelockDelay']
                    ? formik.errors['timelockDelay']
                    : undefined
                }
                helperText="The delay between when a passed proposal is queued and when it can be executed. This provides time for final review, vetoing, or cancellation before execution."
                placeholder={['2', '0', '0', '0']}
                disabled={enableFastDAO}
              />
            </motion.div>

            <FormNavButtons
              hasPrev
              onPrev={handlePrev}
              nextDisabled={!isEmpty(formik.errors) || formik.isSubmitting}
            />
          </Flex>
        </Form>
      )}
    </Formik>
  )
}
