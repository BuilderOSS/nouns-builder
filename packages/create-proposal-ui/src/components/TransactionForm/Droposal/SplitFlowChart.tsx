'use client'

import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useDaoStore } from '@buildeross/stores'
import { Avatar } from '@buildeross/ui/Avatar'
import React, { useMemo } from 'react'
import { useAccount } from 'wagmi'

import { formatSplitAddress, type SplitRecipient } from '../../../utils/splits'
import {
  container,
  emptyState,
  legend,
  nodeLabelHtml,
  nodePctHtml,
  nodeRow,
  nodeText,
  sourceLabel,
  sourceSub,
  svg as svgClass,
} from './SplitFlowChart.css'

/**
 * A single recipient node: resolves the recipient's ENS name + avatar and draws
 * them (HTML via <foreignObject> so the avatar image and gradient fallback can
 * render inside the SVG). Falls back to the truncated address when there's no
 * ENS name, and labels the DAO treasury / the connected user specially.
 */
const RecipientNode: React.FC<{
  address: string
  percent: number
  x: number
  y: number
  isTreasury: boolean
  isYou: boolean
}> = ({ address, percent, x, y, isTreasury, isYou }) => {
  const { displayName, ensAvatar } = useEnsData(address)
  const label = isTreasury
    ? 'DAO Treasury'
    : `${displayName || formatSplitAddress(address)}${isYou ? ' (You)' : ''}`
  return (
    <foreignObject x={x - 20} y={y - 20} width={190} height={44}>
      <div className={nodeRow}>
        <Avatar address={address} src={isTreasury ? undefined : ensAvatar} size="40" />
        <div className={nodeText}>
          <div className={nodeLabelHtml}>{label}</div>
          <div className={nodePctHtml}>{percent.toFixed(2)}%</div>
        </div>
      </div>
    </foreignObject>
  )
}

const W = 480
const H = 340
const PAD = 32
const SOURCE_X = 70
const TARGET_X = 300

/**
 * Sankey-style visualization of how NFT sale revenue flows from the split
 * contract to each recipient — flow width is proportional to allocation %.
 * Ported from the production Gnars website pattern, adapted to zord/SVG.
 */
export const SplitFlowChart: React.FC<{ recipients: SplitRecipient[] }> = ({
  recipients,
}) => {
  const { address } = useAccount()
  const { treasury } = useDaoStore((x) => x.addresses)

  const totalPercent = useMemo(
    () => recipients.reduce((sum, r) => sum + (r.percentAllocation || 0), 0),
    [recipients]
  )

  // Filter out empty/zero recipients and merge duplicate addresses.
  const valid = useMemo(() => {
    const grouped = new Map<string, { address: string; percentAllocation: number }>()
    recipients
      .filter((r) => r.percentAllocation > 0 && r.address)
      .forEach((r) => {
        const key = r.address.toLowerCase()
        const existing = grouped.get(key)
        if (existing) existing.percentAllocation += r.percentAllocation
        else
          grouped.set(key, { address: r.address, percentAllocation: r.percentAllocation })
      })
    return Array.from(grouped.values())
  }, [recipients])

  if (valid.length === 0 || totalPercent === 0) {
    return (
      <div className={emptyState}>
        Add recipients with allocations to see the split visualization
      </div>
    )
  }

  const avail = H - PAD * 2
  const sourceY = H / 2

  return (
    <div className={container}>
      <svg
        className={svgClass}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="splitFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="splitFlowTreasury" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
          <filter id="splitGlow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Source node */}
        <g>
          <circle
            cx={SOURCE_X}
            cy={sourceY}
            r="10"
            fill="#10b981"
            filter="url(#splitGlow)"
          />
          <text x={SOURCE_X} y={sourceY - 18} textAnchor="middle" className={sourceLabel}>
            Split
          </text>
          <text x={SOURCE_X} y={sourceY + 26} textAnchor="middle" className={sourceSub}>
            Contract
          </text>
        </g>

        {/* Flows — outer first so the center renders on top */}
        {valid
          .map((recipient, index) => ({
            recipient,
            index,
            distance: Math.abs(index - (valid.length - 1) / 2),
          }))
          .sort((a, b) => b.distance - a.distance)
          .map(({ recipient, index }) => {
            const spacing = avail / valid.length
            const targetY = PAD + spacing * index + spacing / 2
            const flowHeight = Math.max(
              (recipient.percentAllocation / 100) * avail * 0.4,
              8
            )
            const midX = (SOURCE_X + TARGET_X) / 2
            const curve = Math.abs(targetY - sourceY) < 10 ? 30 : 0
            const path = `M ${SOURCE_X} ${sourceY} C ${midX} ${sourceY + curve}, ${midX} ${targetY - curve}, ${TARGET_X} ${targetY}`
            const isTreasury =
              !!treasury && recipient.address.toLowerCase() === treasury.toLowerCase()
            return (
              <path
                key={`flow-${recipient.address.toLowerCase()}`}
                d={path}
                stroke={isTreasury ? 'url(#splitFlowTreasury)' : 'url(#splitFlow)'}
                strokeWidth={flowHeight}
                fill="none"
                strokeLinecap="round"
                opacity={isTreasury ? 1 : 0.9}
              />
            )
          })}

        {/* Recipient nodes — ENS name + avatar, rendered as HTML foreignObjects */}
        {valid.map((recipient, index) => {
          const spacing = avail / valid.length
          const targetY = PAD + spacing * index + spacing / 2
          const isTreasury =
            !!treasury && recipient.address.toLowerCase() === treasury.toLowerCase()
          const isYou =
            !!address && recipient.address.toLowerCase() === address.toLowerCase()
          return (
            <RecipientNode
              key={`node-${recipient.address.toLowerCase()}`}
              address={recipient.address}
              percent={recipient.percentAllocation}
              x={TARGET_X}
              y={targetY}
              isTreasury={isTreasury}
              isYou={isYou && !isTreasury}
            />
          )
        })}
      </svg>
      <div className={legend}>Flow width = allocation %</div>
    </div>
  )
}
