import { Box } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import { BuilderTransaction, useProposalStore } from 'src/modules/create-proposal/stores'

import { Alert } from '../../Alert'
import { UpgradeCard } from '../../UpgradeCard'

export interface UpgradeRequiredProps {
  transaction?: BuilderTransaction
  latest?: string
  date?: string
  totalContractUpgrades?: number
}

const animation = {
  init: {
    height: 0,
    overflow: 'hidden',
    transition: {
      animate: 'easeInOut',
    },
  },
  open: {
    height: 'auto',
    transition: {
      animate: 'easeInOut',
    },
  },
}

export const UpgradeRequired: React.FC<UpgradeRequiredProps> = ({
  latest,
  date,
  transaction: upgradeTransaction,
  totalContractUpgrades,
}) => {
  const addTransaction = useProposalStore((state) => state.addTransaction)

  const handleUpgrade = (): void => {
    addTransaction(upgradeTransaction!)
  }

  return (
    <AnimatePresence>
      <motion.div initial={'init'} animate={'open'} variants={animation}>
        <Box mb={'x10'}>
          <UpgradeCard
            hasThreshold={true}
            totalContractUpgrades={totalContractUpgrades}
            version={latest}
            date={date}
            onUpgrade={handleUpgrade}
            alert={<Alert />}
          />
        </Box>
      </motion.div>
    </AnimatePresence>
  )
}
