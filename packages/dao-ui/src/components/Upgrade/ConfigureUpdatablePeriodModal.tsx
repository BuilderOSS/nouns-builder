import { AnimatedModal } from '@buildeross/ui'
import { DaysHoursMinsSecs } from '@buildeross/ui/Fields'
import { Box, Button, Flex, Heading, Text } from '@buildeross/zord'
import React from 'react'

interface ConfigureUpdatablePeriodModalProps {
  open: boolean
  close: () => void
  updatablePeriod: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  onUpdatablePeriodChange: (field: string, value: number) => void
  exceedsVotingPeriod: boolean
  hasThreshold: boolean
  onContinue: () => void
  votingPeriodSeconds?: bigint
  updatablePeriodSeconds: number
  daoName?: string
}

const PR_URL = 'https://github.com/BuilderOSS/nouns-protocol/pull/5'

export const ConfigureUpdatablePeriodModal: React.FC<
  ConfigureUpdatablePeriodModalProps
> = ({
  open,
  close,
  updatablePeriod,
  onUpdatablePeriodChange,
  exceedsVotingPeriod,
  hasThreshold,
  onContinue,
  votingPeriodSeconds,
  updatablePeriodSeconds,
  daoName,
}) => {
  const [acceptedDisclaimer, setAcceptedDisclaimer] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState('')

  // Calculate expected confirmation text
  const expectedText = daoName ? `Upgrade ${daoName}` : 'Upgrade to v3.0.0'
  const isTextMatch = confirmText === expectedText

  // Reset disclaimer and confirm text when modal opens
  React.useEffect(() => {
    if (open) {
      setAcceptedDisclaimer(false)
      setConfirmText('')
    }
  }, [open])

  return (
    <AnimatedModal open={open} close={close} size="medium">
      <Flex direction="column" p="x6" gap="x6">
        <Heading size="sm">Configure v3.0.0 Upgrade</Heading>

        {/* Disclaimer Section - Moved to top */}
        <Box
          borderRadius="phat"
          borderWidth="normal"
          borderColor="warning"
          backgroundColor="warningSecondary"
          p="x4"
        >
          <Flex direction="column" gap="x3">
            <Text fontSize="14" color="text1" fontWeight="label">
              ⚠️ Important: This upgrade is unaudited
            </Text>

            <Flex align="flex-start" gap="x2">
              <Box
                as="input"
                type="checkbox"
                id="disclaimer-checkbox"
                checked={acceptedDisclaimer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAcceptedDisclaimer(e.target.checked)
                }
                mt="x1"
                style={{
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  flexShrink: 0,
                }}
              />
              <Box as="label" htmlFor="disclaimer-checkbox" style={{ cursor: 'pointer' }}>
                <Text fontSize="14" color="text1">
                  I understand this upgrade is unaudited (
                  <Box
                    as="a"
                    href={PR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    PR #5
                  </Box>
                  ) and take full responsibility for any risks.
                </Text>
              </Box>
            </Flex>

            <Box ml="x6">
              <Box
                as="a"
                href={PR_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline' }}
              >
                <Text fontSize="14">Review Code Changes →</Text>
              </Box>
            </Box>

            {/* Text confirmation input */}
            <Box mt="x3">
              <Text fontSize="14" color="text1" mb="x2">
                Type{' '}
                <Text as="span" fontWeight="label">
                  {expectedText}
                </Text>{' '}
                to confirm:
              </Text>
              <Box
                as="input"
                type="text"
                value={confirmText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmText(e.target.value)
                }
                placeholder={expectedText}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: `1px solid ${isTextMatch ? '#10b981' : '#e5e7eb'}`,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  outline: 'none',
                }}
              />
              {confirmText && !isTextMatch && (
                <Text fontSize="12" color="negative" mt="x1">
                  Text must match exactly (case-sensitive)
                </Text>
              )}
              {isTextMatch && (
                <Text fontSize="12" color="positive" mt="x1">
                  ✓ Confirmed
                </Text>
              )}
            </Box>
          </Flex>
        </Box>

        {/* Configuration Section */}
        <Box>
          <Text fontSize="14" color="text1" fontWeight="label" mb="x3">
            Configure Updatable Period
          </Text>

          <Text color="text3" fontSize="14" mb="x4">
            Set the period during which proposers can edit their proposals after creation.
            After this period ends, proposals can no longer be edited and voting begins.
          </Text>

          <DaysHoursMinsSecs
            id="updatablePeriod"
            value={updatablePeriod}
            inputLabel="Proposal Updatable Period"
            onChange={() => {}}
            formik={
              {
                setFieldValue: (id: string, value: number) => {
                  const field = id.split('.')[1]
                  onUpdatablePeriodChange(field, value)
                },
              } as any
            }
            placeholder={['1', '0', '0', '0']}
            errorMessage={
              exceedsVotingPeriod
                ? `Updatable period (${(updatablePeriodSeconds / 86400).toFixed(
                    2
                  )} days) cannot exceed voting period (${(
                    Number(votingPeriodSeconds) / 86400
                  ).toFixed(2)} days)`
                : undefined
            }
          />

          <Text color="text3" fontSize="14" mt="x2">
            Must not exceed the voting period.
          </Text>
        </Box>

        <Flex gap="x4" justify="flex-end">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            onClick={onContinue}
            disabled={
              !hasThreshold || exceedsVotingPeriod || !acceptedDisclaimer || !isTextMatch
            }
          >
            Continue with Upgrade
          </Button>
        </Flex>
      </Flex>
    </AnimatedModal>
  )
}
