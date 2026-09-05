import { useAuthStore, useDaoStore } from '@buildeross/stores'
import { DropdownSelect } from '@buildeross/ui/DropdownSelect'
import { DatePicker, FIELD_TYPES, SmartInput, TextArea } from '@buildeross/ui/Fields'
import { SingleMediaUpload } from '@buildeross/ui/SingleMediaUpload'
import { defaultHelperTextStyle } from '@buildeross/ui/styles'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import { Form, Formik, FormikHelpers } from 'formik'
import { useCallback, useState } from 'react'

import { defaultInputLabelStyle } from './Droposal.css'
import droposalFormSchema, { DroposalFormValues } from './DroposalForm.schema'
import { DroposalPreview } from './DroposalPreview'
import {
  advancedChevron,
  advancedChevronOpen,
  advancedToggle,
  eyebrow,
  grid2,
  section,
  sectionHead,
  sectionHint,
} from './DroposalSections.css'
import { SplitRecipients } from './SplitRecipients'
import { SplitToggle } from './SplitToggle'

const Section: React.FC<{
  label: string
  hint?: string
  children: React.ReactNode
}> = ({ label, hint, children }) => (
  <Box className={section}>
    <Box className={sectionHead}>
      <span className={eyebrow}>{label}</span>
      {hint && <span className={sectionHint}>{hint}</span>}
    </Box>
    <Flex direction={'column'}>{children}</Flex>
  </Box>
)

export interface DroposalFormProps {
  onSubmit?: (
    values: DroposalFormValues,
    actions: FormikHelpers<DroposalFormValues>
  ) => Promise<void> | void
  disabled?: boolean
}

export type EditionType = 'fixed' | 'open'

const editionSizeOptions = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Open edition', value: 'open' },
]

type SplitState = 'none' | 'creating' | 'active'

const droposalFieldLabels: Partial<Record<keyof DroposalFormValues, string>> = {
  name: 'Name',
  symbol: 'Symbol',
  description: 'Description',
  mediaUrl: 'Media',
  coverUrl: 'Cover',
  pricePerMint: 'Price',
  maxPerAddress: 'Mint limit per address',
  maxSupply: 'Edition size',
  royaltyPercentage: 'Royalty',
  fundsRecipient: 'Payout address',
  defaultAdmin: 'Default admin address',
  publicSaleStart: 'Start time',
  publicSaleEnd: 'End time',
}

export const DroposalForm: React.FC<DroposalFormProps> = ({ onSubmit, disabled }) => {
  const [editionType, setEditionType] = useState<EditionType>('open')
  const [isIPFSUploading, setIsIPFSUploading] = useState(false)
  const [splitState, setSplitState] = useState<SplitState>('none')
  const [activeSplitAddress, setActiveSplitAddress] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { address: user } = useAuthStore()
  const { treasury } = useDaoStore((x) => x.addresses)

  const initialValues: DroposalFormValues = {
    name: '',
    symbol: '',
    description: '',
    mediaUrl: '',
    coverUrl: '',
    fundsRecipient: treasury || '',
    defaultAdmin: user || '',
    publicSaleStart: '',
    publicSaleEnd: '',
    royaltyPercentage: 5,
    pricePerMint: 0,
    maxSupply: 0,
  }

  const handleSubmit = useCallback(
    (values: DroposalFormValues, actions: FormikHelpers<DroposalFormValues>) => {
      onSubmit?.(values, actions)
      // Reset split state after submission
      setSplitState('none')
      setActiveSplitAddress(null)
    },
    [onSubmit]
  )

  return (
    <Box w="100%">
      <Formik
        initialValues={initialValues}
        validationSchema={droposalFormSchema}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => {
          const handleMediaUploadStart = (media: File) => {
            setIsIPFSUploading(true)
            formik.setFieldValue('mediaType', media.type)
          }

          const flattenErrorMessages = (value: unknown): string[] => {
            if (!value) return []
            if (typeof value === 'string') return [value]
            if (Array.isArray(value)) {
              return value.flatMap((item) => flattenErrorMessages(item))
            }
            if (typeof value === 'object') {
              return Object.values(value as Record<string, unknown>).flatMap((item) =>
                flattenErrorMessages(item)
              )
            }
            return []
          }

          const formErrors = Object.entries(
            formik.errors as Record<string, unknown>
          ).flatMap(([key, error]) => {
            const label = droposalFieldLabels[key as keyof DroposalFormValues] || key
            return flattenErrorMessages(error).map((message, index) => ({
              key: `${key}-${index}`,
              message: `${label}: ${message === '*' ? 'Required' : message}`,
            }))
          })

          const handleEditionTypeChanged = (value: string) => {
            value === 'open'
              ? formik.setFieldValue('maxSupply', 0)
              : formik.setFieldValue('maxSupply', undefined)
            setEditionType(value as EditionType)
          }

          const showCover = formik.values['mediaType']
            ? !formik.values['mediaType']?.startsWith('image')
            : false

          return (
            <>
              <DroposalPreview formik={formik} editionType={editionType} />
              <Text mb="x8" ml="x2" className={defaultHelperTextStyle}>
                This droposal uses the ZORA 721 Contract.{' '}
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://docs.zora.co/contracts/ERC721Drop"
                >
                  Learn more
                </a>
              </Text>
              <Box
                data-testid="droposal-form"
                as={'fieldset'}
                disabled={formik.isValidating || disabled}
                style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
              >
                <Flex as={Form} direction={'column'} gap={'x4'}>
                  <Section label={'Collection'}>
                    <SmartInput
                      {...formik.getFieldProps('name')}
                      inputLabel={'Name'}
                      placeholder={'Zorbs'}
                      type={FIELD_TYPES.TEXT}
                      formik={formik}
                      id={'name'}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      errorMessage={
                        formik.touched['name'] && formik.errors['name']
                          ? formik.errors['name']
                          : undefined
                      }
                    />

                    <SmartInput
                      {...formik.getFieldProps('symbol')}
                      inputLabel={'Symbol'}
                      placeholder={'$SYMBOL'}
                      type={FIELD_TYPES.TEXT}
                      formik={formik}
                      id={'symbol'}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      errorMessage={
                        formik.touched['symbol'] && formik.errors['symbol']
                          ? formik.errors['symbol']
                          : undefined
                      }
                    />

                    <TextArea
                      {...formik.getFieldProps('description')}
                      inputLabel={'Description'}
                      placeholder={
                        'This is a project that means a lot to me. Soon it can be yours too.'
                      }
                      formik={formik}
                      id={'description'}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      errorMessage={
                        formik.touched['description'] && formik.errors['description']
                          ? formik.errors['description']
                          : undefined
                      }
                    />
                  </Section>

                  <Section label={'Artwork'} hint={'Media + optional cover'}>
                    <SingleMediaUpload
                      {...formik.getFieldProps('mediaUrl')}
                      formik={formik}
                      id="mediaUrl"
                      inputLabel={'Media'}
                      onUploadStart={handleMediaUploadStart}
                      onUploadSettled={() => setIsIPFSUploading(false)}
                    />

                    {showCover && (
                      <SingleMediaUpload
                        {...formik.getFieldProps('coverUrl')}
                        formik={formik}
                        id="coverUrl"
                        inputLabel={'Cover'}
                        onUploadStart={() => setIsIPFSUploading(true)}
                        onUploadSettled={() => setIsIPFSUploading(false)}
                      />
                    )}
                  </Section>

                  <Section label={'Sale'}>
                    <SmartInput
                      {...formik.getFieldProps('pricePerMint')}
                      inputLabel={'Price'}
                      placeholder={'0.01'}
                      type={FIELD_TYPES.TEXT}
                      formik={formik}
                      perma={'ETH'}
                      id={'pricePerMint'}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      errorMessage={
                        formik.touched['pricePerMint'] && formik.errors['pricePerMint']
                          ? formik.errors['pricePerMint']
                          : undefined
                      }
                    />

                    <Text
                      mb="x8"
                      ml="x2"
                      style={{ marginTop: -30 }}
                      className={defaultHelperTextStyle}
                    >
                      Zora charges a small flat fee 0.000777 ETH per NFT minted to
                      collectors.{' '}
                      <a
                        target="_blank"
                        rel="noreferrer noopener"
                        href="https://support.zora.co/en/articles/4981037-zora-mint-collect-fees"
                      >
                        Learn more
                      </a>
                    </Text>

                    <Box className={grid2}>
                      <DatePicker
                        {...formik.getFieldProps('publicSaleStart')}
                        placeholder={'yyyy-mm-dd'}
                        inputLabel={'Start time'}
                        formik={formik}
                        id={'publicSaleStart'}
                        autoSubmit={false}
                        disabled={false}
                        enableTime={true}
                        dateFormat="Z"
                        altFormat="Y-m-d H:i"
                        errorMessage={
                          formik.touched['publicSaleStart'] &&
                          formik.errors['publicSaleStart']
                            ? formik.errors['publicSaleStart']
                            : undefined
                        }
                      />

                      <DatePicker
                        {...formik.getFieldProps('publicSaleEnd')}
                        placeholder={'yyyy-mm-dd'}
                        inputLabel={'End time'}
                        formik={formik}
                        id={'publicSaleEnd'}
                        autoSubmit={false}
                        disabled={false}
                        enableTime={true}
                        dateFormat="Z"
                        altFormat="Y-m-d H:i"
                        errorMessage={
                          formik.touched['publicSaleEnd'] &&
                          formik.errors['publicSaleEnd']
                            ? formik.errors['publicSaleEnd']
                            : undefined
                        }
                      />
                    </Box>
                  </Section>

                  <Section label={'Revenue'} hint={'Payout & splits'}>
                    <SmartInput
                      {...formik.getFieldProps('fundsRecipient')}
                      inputLabel={'Payout address'}
                      placeholder={'0x... or .eth'}
                      type={FIELD_TYPES.TEXT}
                      formik={formik}
                      id={'fundsRecipient'}
                      isAddress={true}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={
                        'The DAO treasury address is set as the default payout address. This address will receive any withdrawals and royalties. It can be your personal wallet, a multisignature wallet, or an external splits contract.'
                      }
                      errorMessage={
                        formik.touched['fundsRecipient'] &&
                        formik.errors['fundsRecipient']
                          ? formik.errors['fundsRecipient']
                          : undefined
                      }
                    />

                    <Box mt={'x2'}>
                      <SplitToggle
                        checked={splitState !== 'none'}
                        isActive={splitState === 'active' && !!activeSplitAddress}
                        onChange={(checked) => {
                          if (checked) {
                            setSplitState('creating')
                          } else {
                            setSplitState('none')
                            setActiveSplitAddress(null)
                            formik.setFieldValue('fundsRecipient', treasury || '')
                          }
                        }}
                      />
                      {splitState !== 'none' && (
                        <Box mt={'x4'}>
                          <SplitRecipients
                            mode={splitState === 'active' ? 'view' : 'edit'}
                            activeSplitAddress={activeSplitAddress}
                            onSplitCreated={(address) => {
                              formik.setFieldValue('fundsRecipient', address)
                              setActiveSplitAddress(address)
                              setSplitState('active')
                            }}
                            onEditSplit={() => {
                              setSplitState('creating')
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Section>

                  <Box className={section}>
                    <button
                      type={'button'}
                      className={advancedToggle}
                      aria-expanded={showAdvanced}
                      onClick={() => setShowAdvanced((v) => !v)}
                    >
                      <span className={eyebrow}>Advanced</span>
                      <span
                        className={[
                          advancedChevron,
                          showAdvanced ? advancedChevronOpen : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <Icon id={'chevron-down'} size={'md'} align={'center'} />
                      </span>
                    </button>
                    {showAdvanced && (
                      <Flex direction={'column'} mt={'x4'}>
                        <label className={defaultInputLabelStyle}>Edition type</label>
                        <DropdownSelect
                          options={editionSizeOptions}
                          value={editionType}
                          onChange={handleEditionTypeChanged}
                        />

                        {editionType === 'fixed' ? (
                          <SmartInput
                            {...formik.getFieldProps('maxSupply')}
                            placeholder={'1000'}
                            inputLabel={'Edition size'}
                            type={FIELD_TYPES.TEXT}
                            formik={formik}
                            perma={'Editions'}
                            id={'maxSupply'}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            errorMessage={
                              formik.touched['maxSupply'] && formik.errors['maxSupply']
                                ? formik.errors['maxSupply']
                                : undefined
                            }
                          />
                        ) : (
                          <Box mb={'x8'}>
                            <label className={defaultInputLabelStyle}>Edition size</label>
                            <Flex
                              align={'center'}
                              backgroundColor={'background2'}
                              h={'x16'}
                              px={'x4'}
                              style={{ borderRadius: '16px' }}
                            >
                              <Text color="text4">Unlimited</Text>
                            </Flex>
                          </Box>
                        )}

                        <SmartInput
                          {...formik.getFieldProps('royaltyPercentage')}
                          inputLabel={'Royalty'}
                          placeholder={'5'}
                          perma={'%'}
                          type={FIELD_TYPES.NUMBER}
                          formik={formik}
                          id={'royaltyPercentage'}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          errorMessage={
                            formik.touched['royaltyPercentage'] &&
                            formik.errors['royaltyPercentage']
                              ? formik.errors['royaltyPercentage']
                              : undefined
                          }
                        />

                        <SmartInput
                          {...formik.getFieldProps('maxPerAddress')}
                          inputLabel={'Mint limit per address'}
                          placeholder={'Unlimited'}
                          type={FIELD_TYPES.NUMBER}
                          formik={formik}
                          id={'maxPerAddress'}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          helperText={'Leave empty for unlimited mints per wallet.'}
                          errorMessage={
                            formik.touched['maxPerAddress'] &&
                            formik.errors['maxPerAddress']
                              ? formik.errors['maxPerAddress']
                              : undefined
                          }
                        />

                        <SmartInput
                          {...formik.getFieldProps('defaultAdmin')}
                          inputLabel={'Default admin address'}
                          placeholder={'0x... or .eth'}
                          type={FIELD_TYPES.TEXT}
                          formik={formik}
                          id={'defaultAdmin'}
                          isAddress={true}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          helperText={
                            'The wallet you have connected to nouns.build is set as the default admin address. This address will manage the edition. It can be your personal wallet, a multisignature wallet, or the DAO treasury.'
                          }
                          errorMessage={
                            formik.touched['defaultAdmin'] &&
                            formik.errors['defaultAdmin']
                              ? formik.errors['defaultAdmin']
                              : undefined
                          }
                        />
                      </Flex>
                    )}
                  </Box>

                  {!formik.isValidating && formErrors.length > 0 && (
                    <Box mt="x2">
                      {formErrors.map(({ key, message }) => (
                        <Text key={key} color="negative" textAlign="left">
                          - {message}
                        </Text>
                      ))}
                    </Box>
                  )}
                  <Button
                    variant={'outline'}
                    borderRadius={'curved'}
                    type="submit"
                    disabled={disabled || isIPFSUploading}
                  >
                    Add Transaction to Queue
                  </Button>
                </Flex>
              </Box>
            </>
          )
        }}
      </Formik>
    </Box>
  )
}
