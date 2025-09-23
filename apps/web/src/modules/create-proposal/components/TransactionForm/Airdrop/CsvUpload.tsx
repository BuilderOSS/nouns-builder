import { Box, Button, Flex, Text } from '@buildeross/zord'
import Papa from 'papaparse'
import React, { useCallback, useState } from 'react'
import { Icon } from 'src/components/Icon'

export interface CsvRecord {
  address: string
  amount: string
}

export interface CsvUploadProps {
  onCsvParsed: (records: CsvRecord[]) => void
  onError: (error: string) => void
  disabled?: boolean
}

export const CsvUpload = ({ onCsvParsed, onError, disabled }: CsvUploadProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const validateAndParseCSV = useCallback(
    (file: File) => {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        onError('Please upload a CSV file')
        return
      }

      if (file.size > 1024 * 1024) {
        // 1MB limit
        onError('File size must be less than 1MB')
        return
      }

      setIsProcessing(true)

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.toLowerCase().trim(),
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              onError(`CSV parsing error: ${results.errors[0].message}`)
              return
            }

            const data = results.data as any[]

            if (data.length === 0) {
              onError('CSV file is empty')
              return
            }

            if (data.length > 100) {
              onError('CSV file contains too many rows. Maximum 100 recipients allowed.')
              return
            }

            // Validate headers
            const expectedHeaders = ['address', 'amount']
            const actualHeaders = (results.meta?.fields ?? []).map((h) =>
              h.toLowerCase().trim()
            )

            const missingHeaders = expectedHeaders.filter(
              (h) => !actualHeaders.includes(h)
            )
            if (missingHeaders.length > 0) {
              onError(
                `Missing required columns: ${missingHeaders.join(', ')}. Expected: address, amount`
              )
              return
            }

            // Validate and clean data
            const cleanedRecords: CsvRecord[] = []
            const errors: string[] = []
            const seen = new Set<string>()

            data.forEach((row, index) => {
              const address = row.address?.toString().trim()
              const amount = row.amount?.toString().trim()

              if (!address) {
                errors.push(`Row ${index + 1}: Missing address`)
                return
              }

              const key = address.toLowerCase()
              if (seen.has(key)) {
                errors.push(`Row ${index + 1}: Duplicate address`)
                return
              }
              seen.add(key)

              if (!amount || !/^\d+$/.test(amount)) {
                errors.push(
                  `Row ${index + 1}: Invalid amount (must be a positive integer)`
                )
                return
              }

              cleanedRecords.push({
                address,
                amount,
              })
            })

            if (errors.length > 0) {
              onError(
                `Validation errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : ''}`
              )
              return
            }

            if (cleanedRecords.length === 0) {
              onError('No valid records found in CSV')
              return
            }

            onCsvParsed(cleanedRecords)
          } catch (err) {
            onError(
              `Failed to process CSV: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
          } finally {
            setIsProcessing(false)
          }
        },
        error: (error) => {
          onError(`Failed to parse CSV: ${error.message}`)
          setIsProcessing(false)
        },
      })
    },
    [onCsvParsed, onError]
  )

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      validateAndParseCSV(file)
    },
    [validateAndParseCSV]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled || isProcessing) return

      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect, disabled, isProcessing]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled && !isProcessing) {
        setIsDragging(true)
      }
    },
    [disabled, isProcessing]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const downloadTemplate = useCallback(() => {
    const csvContent =
      'address,amount\n0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e,10\n0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe,25'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'airdrop_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }, [])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,text/csv'
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      handleFileSelect(target.files)
    }
    input.click()
  }, [handleFileSelect])

  return (
    <Box w="100%">
      <Flex direction="column" gap="x3">
        <Flex justify="space-between" align="center">
          <Text fontWeight="display">Upload CSV File</Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadTemplate}
            disabled={disabled}
          >
            <Icon id="download" />
            Download Template
          </Button>
        </Flex>

        <Box
          p="x8"
          borderRadius="curved"
          borderStyle="dashed"
          borderWidth="normal"
          borderColor={isDragging ? 'accent' : 'border'}
          backgroundColor={isDragging ? 'background2' : 'background1'}
          style={{
            transition: 'all 0.2s ease',
            cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={disabled || isProcessing ? -1 : 0}
          aria-disabled={disabled || isProcessing}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled || isProcessing) return
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick()
            }
          }}
          onClick={() => {
            if (disabled || isProcessing) return
            handleClick()
          }}
        >
          <Flex direction="column" align="center" gap="x3">
            <Text fontWeight="display" textAlign="center">
              {isProcessing
                ? 'Processing CSV...'
                : isDragging
                  ? 'Drop CSV file here'
                  : 'Drag and drop CSV file or click to browse'}
            </Text>
            <Text color="text3" fontSize="14" textAlign="center">
              Maximum 100 recipients
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
