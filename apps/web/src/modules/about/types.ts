export type AboutStat = {
  id: string
  label: string
  value: string
  detail: string
  icon: string
}

export type DaoCategory = 'featured' | 'trending' | 'new' | 'active'

export type AboutDao = {
  id: string
  name: string
  description: string
  signalLabel: string
  signalValue: string
  href: string
  badge: string
  initials: string
  imageUrl?: string | null
  recentAuctionImage?: string | null
  chainIcon?: string | null
  chainName?: string | null
  category: DaoCategory
}

export type CoiningHighlight = {
  id: string
  title: string
  creator: string
  dao: string
  chainLabel: string
  amount: string
  href: string
  eyebrow: string
  surface: string
  previewLabel: string
}

export type DroposalStatus =
  | 'Active'
  | 'Succeeded'
  | 'Queued'
  | 'Defeated'
  | 'Executed'
  | 'Trending'
  | 'Live'
  | 'Recent'

export type DroposalHighlight = {
  id: string
  title: string
  dao: string
  amount: string
  status: DroposalStatus
  summary: string
  href: string
  category: string
}

export type BuilderStep = {
  id: string
  title: string
  body: string
  marker: string
}

export type BuilderValueProp = {
  id: string
  title: string
  body?: string
  emoji?: string
  imageSrc?: string
}

export type ActivityItem = {
  id: string
  title: string
  detail: string
  meta: string
  tone: 'launch' | 'coin' | 'governance' | 'protocol'
}

export type AboutDaoTabKey = 'featured' | 'trending' | 'new' | 'active'

export type AboutDaoTabsResponse = {
  featured: AboutDao[]
  trending: AboutDao[]
  new: AboutDao[]
  active: AboutDao[]
}

export type AboutSnapshotResponse = {
  stats: AboutStat[]
}

export type AboutShowcaseResponse = {
  coining: CoiningHighlight[]
  drops: DroposalHighlight[]
  proposals: DroposalHighlight[]
}

export type BuilderFeature = {
  id: string
  marker: string
  title: string
  body: string
}
