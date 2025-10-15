import { Box, Text } from '@buildeross/zord'

interface SectionProps {
  title: string
  subtitle?: any
  children: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({ title, subtitle, children }) => {
  return (
    <>
      <Text variant="heading-xs" mt="x10">
        {title}
      </Text>
      {subtitle && (
        <Text variant="paragraph-md" mt="x2">
          {subtitle}
        </Text>
      )}
      <Box
        borderColor="border"
        borderStyle="solid"
        borderWidth="normal"
        borderRadius="curved"
        color="text3"
        px="x6"
        py="x4"
        mt="x6"
      >
        {children}
      </Box>
    </>
  )
}
